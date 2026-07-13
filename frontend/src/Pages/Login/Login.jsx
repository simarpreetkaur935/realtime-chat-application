import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const {setAuthUser} = useAuth();
  const [userInput, setUserInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setUserInput({
      ...userInput,
      [e.target.id]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const login = await axios.post(
      "https://realtime-chat-application-bcwz.onrender.com/api/auth/login",
      userInput,
      {
        withCredentials: true,
      }
    );

    const data = login.data;

    if (data.success === false) {
      setLoading(false);
      toast.error(data.message);
      console.log(data.message)
      return;
    }

    toast.success(data.message);

    localStorage.setItem("chatapp", JSON.stringify(data));
    setAuthUser(data);
    setLoading(false);

    // Uncomment this after you create the Home page
    navigate("/");

  } catch (error) {
    setLoading(false);

    console.log(error);

    toast.error(error.response?.data?.message || "Login Failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">

          <h1 className="text-3xl font-bold text-center">
            Login
            <span className="text-primary"> Chatters</span>
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 mt-6"
          >
            {/* Email */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Email
                </span>
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={userInput.email}
                onChange={handleInput}
              />
            </div>

            {/* Password */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Password
                </span>
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                value={userInput.password}
                onChange={handleInput}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;