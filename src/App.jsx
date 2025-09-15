import React from "react";
import { Link } from "react-router-dom";
import { PROJECTS } from "./projects.js";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>YC React Sandpack</h1>
        <a
          href="https://github.com/kbj0072/yc_react_sandpack"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>
      <p style={{ color: "#6b7280" }}>
        여러 프로젝트를 한 리포에서 관리하고, 각 프로젝트로 이동해 코드
        편집/실행.
      </p>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {PROJECTS.map((p) => (
          <li
            key={p.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Project ID: {p.id}
                </div>
              </div>
              <Link
                to={`/p/${p.id}`}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                }}
              >
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
