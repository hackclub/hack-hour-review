import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/dark.css";
import DOMPurify from "dompurify";

hljs.registerLanguage("json", json);

export default function JsonMessageFormatter({ data }) {
  const highlightedJson = DOMPurify.sanitize(
    hljs.highlight(JSON.stringify(data, null, 2), {
      language: "json",
    }).value
  );
  // I'm sorry in advance.
  return (
    <div className="w-full h-full p-2">
      <pre
        className="w-full h-full p-2 overflow-y-scroll overflow-x-hidden"
        dangerouslySetInnerHTML={{ __html: highlightedJson }}
      ></pre>
    </div>
  );
}
