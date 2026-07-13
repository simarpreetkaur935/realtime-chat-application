import { createBrowserRouter } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Signup/Signup";
import Home from "./Pages/Home/Home";
import VerifyUser from "./utils/VerifyUser";
import Profile from "./Pages/Profile/Profile";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  { path: "/signup", element: <Signup /> },

  {
    element: <VerifyUser />,
    children: [{ path: "/", element: <Home /> }],
  },
  
]);

export default router;