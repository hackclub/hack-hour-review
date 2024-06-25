"use client";

import HTMLComment from './htmlComment';

const NoSlackMessages = () => (
  <div>No Slack Messages</div>
)

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
          <div key={i}>
            <HTMLComment text={JSON.stringify(msg, null, 2)} />
          </div>
        ))}
      </ul>
    </>
  );
}
