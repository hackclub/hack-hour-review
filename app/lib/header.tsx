import pluralize from "./pluralize";

export default function Header({ name, length, curSession }) {
  if (name !== "") {
    return (
      <>
        {" "}
        <p className="text-xl text-center">
          You're reviewing {name}'s scrapbook post!
        </p>
        <p className="text-center">
          They have {pluralize("session", length, true)} to review.
        </p>
        <p className="text-center">
          You are reviewing session #{curSession + 1}
        </p>
      </>
    );
  }
}
