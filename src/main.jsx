import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Project from "./routes/Project.jsx";

const router = createHashRouter([
  { path: "/", element: <App /> },
  { path: "/p/:id", element: <Project /> },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
