"use client";

import { useEffect, useState } from "react";

const SlackMention = ({ userID }) => {
  const [user, setUser] = useState(userID);
  const [pic, setPic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/user/${userID}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data?.username);
        setPic(data?.avatar);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* <img src={pic} alt="Slack Avatar"  />: {user} */}
      <a
        href={`https://hackclub.slack.com/team/${userID}`}
        target="_blank"
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        @{user}
      </a>
    </>
  );
};

export default SlackMention;
