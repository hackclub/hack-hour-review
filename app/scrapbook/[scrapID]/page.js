"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import SlackThread from "app/components/SlackThread";
import Header from "app/components/Header"
import Loading from "app/components/Loading";
import Card from "app/components/Card";

const ReviewButton = ({text, action, activeButton, color}) => {
  let buttonText = text
  let buttonColor = color

  const currentlyLoading = activeButton?.toLowerCase()?.includes(text)
  const anotherLoading = activeButton != null && !currentlyLoading
  if (currentlyLoading) {
    buttonText = "Loading..."
  }
  if (anotherLoading) {
    buttonColor = "gray"
  }

  return (
    <button className={`bg-${buttonColor}-400 rounded-md`} onClick={action}>
      <p className="text-center mx-4 lg:text-lg md:text-md sm:text-sm">
        {buttonText}
      </p>
    </button>
  );
}

export default function Scrapbook() {
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(null); // null, "approved", "rejected", "unreviewed"
  const [scrap, setScrap] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [sessionIndex, setSessionIndex] = useState(0);

  const params = useParams();
  const { scrapID, sessionID } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/scrapbook/${scrapID}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setScrap(data.scrap);
        setUser(data.user);
      } catch (error) {
        setError(error.message);
      } finally {
        setPageIsLoading(false);
      }
    };

    fetchData();
  }, [scrapID]);

  const approveSession = async () => {
    setButtonLoading("approved");

    const resp = await (
      await fetch(`/api/session/${sessionID}/approve`, {method: 'POST'})
    ).json();

    setButtonLoading(null);
    if (sessionIndex >= scrap.sessions.length - 1) {
      // next session
    } else {
      setSessionIndex(sessionIndex + 1);
    }
  };

  const rejectSession = async () => {
    const resp = await (
      await fetch(`/api/session/${sessionID}/reject`, {method: 'POST'})
    ).json();

    // reject session, and then...
    if (sessionIndex >= scrap.sessions.length - 1) {
      // next session
    } else {
      setSessionIndex(sessionIndex + 1);
    }
  };

  if (pageIsLoading) {
    return <Loading />;
  }
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="h-[15vh]">
        <Header
          name={user.name}
          scrapbookLink={scrap.slackURL}
          sessionIndex={sessionIndex}
        />
      </div>


      <Card>
        <h1>#scrapbook posts</h1>
        <SlackThread messages={scrap.messages} slackURL={scrap.slackURL} />
      </Card>

      {scrap.sessions.sort((a,b) => a.slackTS - b.slackTS).map((session, index) => {
        console.log(session)
        return (
          <Card key={index}>
            <h1>Session {index + 1}</h1>
            <SlackThread messages={session.messages} slackURL={session.slackURL} />

            <ReviewButton text="Reject" action={rejectSession} activeButton={buttonLoading} color="orange" />
            <ReviewButton text="Approve" action={approveSession} activeButton={buttonLoading} color="green" />
          </Card>
        );
      })}
    </>
  );
}
