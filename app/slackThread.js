"use client";

import { useState } from "react";
import HTMLComment from "./htmlComment";

const NoSlackMessages = () => <div>No Slack Messages</div>;

const SlackMessage = ({ message }) => {
  if (!message) {
    return null;
  } else if (message.text == "" && message.files) {
    // file upload
    return (
      <>
        {message.files.map((file, i) => (
          <p key={i}>
            <em>{message.user} uploaded</em>{" "}
            <a href="file.thumb_480" target="_blank">
              {file.title}
            </a>
          </p>
        ))}
      </>
    );
  } else {
    return (
      <span>
        <em>Username not yet implemented</em>: {message.text}
      </span>
    );
  }
};

const SlackMessages = ({ messages }) => {
  return (
    <ul>
      {messages.map((msg, i) => (
        <li key={i}>
          <SlackMessage message={msg} />
          <HTMLComment text={JSON.stringify(msg, null, 2)} />
        </li>
      ))}
    </ul>
  );
};
const GithubMessages = (props) => {
  const { githubLinks } = props;
  console.log({ githubLinks })
  return (
    <div>
      <ul>
        {githubLinks.map((link, i) => (
          <li key={i}>
            <a href={link} target="_blank">
              {link.replace()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function SlackThread(props) {
  const { messages } = props || [];
  const filteredMessages = messages.filter((message) => !message.bot_id);
  const githubLinks = filteredMessages
    .map((msg) => msg.text)
    .filter((text) => text.includes("github.com"));

  const hasGithubLinks = githubLinks.length > 0;

  const [ghView, setGhView] = useState(hasGithubLinks);

  if (!filteredMessages || filteredMessages.length == 0) {
    return NoSlackMessages;
  }

  return (
    <>
      <h2>Message Thread</h2>
      <button onClick={() => setGhView(true)} disabled={ghView}>
        Only GH links
      </button>
      <button onClick={() => setGhView(false)} disabled={!ghView}>
        All Slack Messages
      </button>
      {ghView ? (
        <GithubMessages githubLinks={githubLinks} />
      ) : (
        <SlackMessages messages={filteredMessages} />
      )}
    </>
  );
}
