"use client";
import { useEffect, useState } from "react";

import sample from '../lib/sample'
import Loading from "./loading";

export default function Page() {
  const [scrapbooks, setScrapbooks] = useState([]);
  const [random, setRandom] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/scrapbook/unreviewed");
        const data = await response.json();
        setScrapbooks(data.scrapbooks);
        const randomScrapbook = sample(data.scrapbooks);
        setRandom(randomScrapbook)
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <h1 className="text-3xl text-center">Review-O-Matic 3000</h1>
      <a href={`/scrapbook/${random}`}>👉 I'm feeling lucky 👈</a>
      <ul>
        {scrapbooks.map((id) => (
          <li key={id}>
            <a className="text-blue-500 underline" href={"/scrapbook/" + id}>
              {id}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
