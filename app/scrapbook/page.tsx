"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [scrapbooks, setScrapbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/scrapbook/all");
        const data = await response.json();
        setScrapbooks(data.scrapbooks);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <h1 className="text-3xl text-center">Review-O-Matic 3000</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {scrapbooks.map((scrap, index) => (
            <li key={index}>{scrap}</li>
          ))}
        </ul>
      )}
    </>
  );
}
