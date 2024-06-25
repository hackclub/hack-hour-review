"use client";

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
      <ul>
        {filteredMessages.map((msg, i) => (
          <div key={i}>
            <ReactComment /></ReactComment>
            {`<!--${JSON.stringify(msg, null, 2)}-->`}
          </div>
        ))}
      </ul>
    </>
  );
}
