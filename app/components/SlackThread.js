"use client";

import { useState } from "react";
import HTMLComment from "../htmlComment";

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
            <a href={file.thumb_480} target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
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

export default function SlackThread({messages, slackURL}) {
  const filteredMessages = messages.filter((message) => !message.bot_id);
  let githubLinks = new Set()
  filteredMessages
    .map((msg) => msg.text)
    .filter((text) => text.includes("github"))
    .forEach(text => {
      const matches = text.match(/https:\/\/github.com\/[^ ]+/g) || [];
      console.log({matches})
      const removedCarrotMatches = matches.map(match => match.replace('>', ''))
      githubLinks.add(...removedCarrotMatches)
    });
  githubLinks = Array.from(githubLinks)

  const hasGithubLinks = githubLinks.length > 0;

  const [ghView, setGhView] = useState(hasGithubLinks);

  if (!filteredMessages || filteredMessages.length == 0) {
    return NoSlackMessages;
  }

  return (
    <>
      <h2><a href={slackURL} target="_blank">Go to message thread</a></h2>
      <button onClick={() => setGhView(true)} className={`${ghView ? 'bg-blue-600' : 'bg-blue-500'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}>
        GH links <span>{githubLinks.length}</span>
      </button>
      <button onClick={() => setGhView(false)} className={`${ghView ? 'bg-blue-500' : 'bg-blue-600'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}>
        All Slack Messages <span>{filteredMessages.length}</span>
      </button>
      {ghView ? (
        <GithubMessages githubLinks={githubLinks} />
      ) : (
        <SlackMessages messages={filteredMessages} />
      )}
    </>
  );
}
