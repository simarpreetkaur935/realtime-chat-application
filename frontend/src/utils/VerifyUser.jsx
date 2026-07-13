import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const VerifyUser = () => {
  const { authUser } = useAuth();

  return authUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default VerifyUser;