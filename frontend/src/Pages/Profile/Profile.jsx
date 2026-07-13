import React from "react";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams();

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Profile Page</h1>

      <p className="mt-5">
        User ID: {id}
      </p>
    </div>
  );
};

export default Profile;