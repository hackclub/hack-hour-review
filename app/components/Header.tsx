export default function Header({ name, scrapbookLink, sessionIndex }) {
  if (name !== "") {
    return (
      <>
        {" "}
        <p className="text-xl text-center">
          You're reviewing {name}'s <a href={scrapbookLink} target="_blank">scrapbook post</a>!
        </p>
        <p className="text-center">
          You are reviewing session #{sessionIndex + 1} of {length}.
        </p>
      </>
    );
  }
}
