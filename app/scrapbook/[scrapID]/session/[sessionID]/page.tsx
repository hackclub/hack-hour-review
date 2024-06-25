"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { getNameByScrapId } from "app/lib/slack";
import JsonMessageFormatter from "app/lib/messages";

import pluralize from "../../../../lib/pluralize";
import SlackThread from "../../../../slackThread";

export default function Scrapbook() {
  const [name, setName] = useState("");
  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curSession, setCurSession] = useState(0);
  const params = useParams();
  const { recordID } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/scrapbook/${recordID}`);
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
  }, [recordID]);

  useEffect(() => {
    if (scrap) {
      const getName = async () => {
        setName(await getNameByScrapId(scrap.id));
      };
      getName();
    }
  }, [scrap]);

  const approveSession = () => {
    // approve session, and then...
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
        <p className="text-xl text-center">
          You're reviewing {name}'s scrapbook post!
        </p>
        <p className="text-center">
          They have {pluralize("session", scrap.sessions.length, true)} to
          review.
        </p>
        <p className="text-center">
          You are reviewing session #{curSession + 1}
        </p>{" "}
      </div>

      <SlackThread messages={scrap.sessions[curSession].messages} />

      <div className="mx-auto bg-gray-800 w-[85vw] h-[70vh] rounded-2xl overflow-y-scroll overflow-x-hidden">
        <JsonMessageFormatter
          data={scrap.sessions[curSession]}
        ></JsonMessageFormatter>
      </div>
      <div className="w-screen h-[15vh] bottom-10 py-12 grid grid-rows-1 grid-cols-3 gap-x-4 px-4">
        <button className="bg-orange-400 rounded-md" onClick={undoSession}>
          <p className="text-center m-4 lg:text-lg md:text-md sm:text-sm">
            Previous
          </p>
        </button>
        <button className="bg-red-400 rounded-md" onClick={rejectSession}>
          <p className="text-center m-4 lg:text-lg md:text-md sm:text-sm">
            Reject
          </p>
        </button>
        <button className="bg-green-400 rounded-md" onClick={approveSession}>
          <p className="text-center m-4 lg:text-lg md:text-md sm:text-sm">
            Approve
          </p>
        </button>
      </div>
    </>
  );
}
