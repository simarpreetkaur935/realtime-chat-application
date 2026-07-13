import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import router from "./router";
import { AuthContextProvider } from "./Context/AuthContext.jsx";
import { SocketContextProvider } from "./Context/socketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
  <AuthContextProvider>
    <SocketContextProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </SocketContextProvider>
  </AuthContextProvider>
</StrictMode>

);