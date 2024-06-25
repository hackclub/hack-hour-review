"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import JsonMessageFormatter from "app/lib/messages";

import SlackThread from "../../../../slackThread";
import Header from "app/lib/header";
import Loading from "app/scrapbook/loading";

export default function Scrapbook() {
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [buttonStates, setButtonStates] = useState(["none", "none", "none"]);
  const [scrap, setScrap] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [curSession, setCurSession] = useState(0);
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
    setButtonStates(["otherPressed", "otherPressed", "pressed"]);
    const resp = await (
      await fetch(`/api/session/${sessionID}/approve`)
    ).json();
    if (curSession >= scrap.sessions.length - 1) {
      // next session
    } else {
      setCurSession(curSession + 1);
    }
  };

  const rejectSession = () => {
    // reject session, and then...
    if (curSession >= scrap.sessions.length - 1) {
      // next session
    } else {
      setCurSession(curSession + 1);
    }
  };

  const undoSession = useCallback(() => {
    setCurSession((prev) => Math.max(prev - 1, 0));
  }, []);

  if (pageIsLoading) {
    return <Loading />;
  }
  if (error) return <p>Error: {error}</p>;
  if (!scrap) return null;

  return (
    <>
      <div className="h-[15vh]">
        <Header
          name={user.name}
          length={scrap.sessions.length}
          curSession={curSession}
        />
      </div>

      <SlackThread messages={scrap.sessions[curSession].messages} />

      <div className="mx-auto bg-gray-800 w-[85vw] h-[70vh] rounded-2xl">
        <JsonMessageFormatter
          data={scrap.sessions[curSession]}
        ></JsonMessageFormatter>
      </div>
      <div className="w-screen h-[15vh] bottom-10 py-12 grid grid-rows-1 grid-cols-3 gap-x-4 px-4">
        <button
          className="bg-orange-400 rounded-md disabled:bg-gray-400"
          onClick={undoSession}
          disabled={buttonStates[0] === "otherPressed" ? true : null}
        >
          <p className="text-center mx-4 lg:text-lg md:text-md sm:text-sm">
            {buttonStates[0] !== "pressed" ? "Previous" : "Going Back..."}
          </p>
        </button>
        <button
          className="bg-red-400 rounded-md disabled:bg-gray-400"
          onClick={rejectSession}
          disabled={buttonStates[1] === "otherPressed" ? true : null}
        >
          <p className="text-center mx-4 lg:text-lg md:text-md sm:text-sm">
            {buttonStates[1] !== "pressed" ? "Reject" : "Rejecting..."}
          </p>
        </button>
        <button
          className="bg-green-400 rounded-md disabled:bg-gray-400"
          onClick={approveSession}
          disabled={buttonStates[2] === "otherPressed" ? true : null}
        >
          <p className="text-center mx-4 lg:text-lg md:text-md sm:text-sm">
            {buttonStates[2] !== "pressed" ? "Approve" : "Approving..."}
          </p>
        </button>
      </div>
    </>
  );
}
