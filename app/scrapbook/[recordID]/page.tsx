"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { getNameByScrapId } from "app/lib/slack";

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
      <p className="text-xl text-center">
        You're reviewing {name}'s {sessionOrSessions}!
      </p>
      <p className="text-center">
        They have {scrap.sessions.length} {sessionOrSessions} to review.
      </p>
      <p className="text-center">You are reviewing session #{curSession + 1}</p>
      <div className="mx-auto mt-20 bg-gray-800 w-[52rem] h-[40rem] rounded-2xl overflow-y-scroll overflow-x-hidden">
        <p>{JSON.stringify(scrap.sessions[0], null, 2)}</p>
      </div>
      <div className="w-screen absolute bottom-4 py-12 grid grid-rows-1 grid-cols-3 gap-x-4 px-4">
        <button className="bg-orange-400 rounded-md" onClick={undoSession}>
          <p className="text-center m-4">Previous Session</p>
        </button>
        <button className="bg-red-400 rounded-md" onClick={rejectSession}>
          <p className="text-center m-4">Reject, Next Session</p>
        </button>
        <button className="bg-green-400 rounded-md" onClick={approveSession}>
          <p className="text-center m-4">Approve, Next Session</p>
        </button>
      </div>
    </>
  );
}
