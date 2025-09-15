import { Sandpack } from "@codesandbox/sandpack-react";

export default function SandpackPlayground({ files }) {
  return (
    <Sandpack
      template="react"
      files={files}
      options={{
        showTabs: true,
        showLineNumbers: true,
        showInlineErrors: true,
        wrapContent: true,
        autorun: true,
        resizablePanels: true,
        recompileMode: "delayed",
        recompileDelay: 300,
        editorHeight: "auto",
      }}
    />
  );
}
