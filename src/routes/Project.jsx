import React from "react";
import { useParams, Link } from "react-router-dom";
import SandpackPlayground from "../components/SandpackPlayground.jsx";

export default function Project() {
  const { id } = useParams();
  const [files, setFiles] = React.useState(null);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    setFiles(null);
    setErr(null);
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}projects/${id}/files.json`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setFiles(data);
      } catch (e) {
        setErr(e.message || String(e));
      }
    })();
  }, [id]);

  return (
    <div className="container" style={{ height: "100%", maxWidth: "100%" }}>
      {/* <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/">← Back</Link>
        <h2 style={{ margin: 0 }}>Project: {id}</h2>
      </header> */}
      <div style={{ height: "calc(100% - 48px)", marginTop: 12 }}>
        {err && (
          <div style={{ color: "crimson" }}>
            Failed to load files.json: {err}
          </div>
        )}
        {!files && !err && <div>Loading…</div>}
        {files && <SandpackPlayground files={files} />}
      </div>
    </div>
  );
}
