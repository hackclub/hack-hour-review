"use client";

import HTMLComment from './htmlComment';

const NoSlackMessages = () => (
  <div>No Slack Messages</div>
)

const SlackMessage = ({message}) => {
  if (!message) {
    return null;
  } else if (message.text == "" && message.files) {
    // file upload
      return (
        <>
          {message.files.map((file, i) => (
            <p key={i}>
              <em>{message.user} uploaded</em>{' '}
              <a href="file.thumb_480" target="_blank">
                {file.title}
              </a>
            </p>
          ))}
        </>
      )
  } else {
    return <span><em>Username not yet implemented</em>: {message.text}</span>
  }

}

export default function SlackThread(props) {
  const { messages } = props || [];
  const filteredMessages = messages.filter((message) => !message.bot_id)
  if (!filteredMessages || filteredMessages.length == 0) {
    return NoSlackMessages;
  }

  return (
    <>
      <h2>Slack thread!</h2>
      <ul>
        {filteredMessages.map((msg, i) => (
          <li key={i}>
            <SlackMessage message={msg} />
            <HTMLComment text={JSON.stringify(msg, null, 2)} />
          </li>
        ))}
      </ul>
    </>
  );
}
