"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { getNameByScrapId } from "app/lib/slack";
import JsonMessageFormatter from "app/lib/messages";

import pluralize from "../../../../lib/pluralize";
import SlackThread from "../../../../slackThread";
import Header from "app/lib/header";

export default function Scrapbook() {
  const [buttonStates, setButtonStates] = useState(["none", "none", "none"]);
  const [name, setName] = useState("");
  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scrapID]);

  useEffect(() => {
    if (scrap) {
      const getName = async () => {
        setName(await getNameByScrapId(scrap.id));
      };
      getName();
    }
  }, [scrap]);

  const approveSession = async () => {
    setButtonStates(["otherPressed", "otherPressed", "pressed"]);
    // const resp = await fetch(`/api/session/${sessionID}/approve`);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!scrap) return null;

  const sessionOrSessions =
    scrap.sessions.length === 1 ? "session" : "sessions";

  return (
    <>
      <div className="h-[15vh]">
        <Header
          name={name}
          length={scrap.sessions.length}
          curSession={curSession}
        />
        <SlackThread messages={scrap.sessions[curSession].messages} />
      </div>

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
