import React from "react";

export default function App() {
  const [n, setN] = React.useState(0);
  return (
    <main style={{ padding: 20 }}>
      <h1>Counter</h1>
      <p>{n}</p>
      <button onClick={() => setN(n + 1)}>+1</button>
    </main>
  );
}
