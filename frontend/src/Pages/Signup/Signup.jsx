import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [userInput, setUserInput] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confPassword: "",
    gender: "",
  });

  const handleInput = (e) => {
    setUserInput({
      ...userInput,
      [e.target.id]: e.target.value,
    });
  };

  const handleGender = (gender) => {
    setUserInput({
      ...userInput,
      gender,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !userInput.fullname ||
      !userInput.username ||
      !userInput.email ||
      !userInput.password ||
      !userInput.confPassword ||
      !userInput.gender
    ) {
      return toast.error("Please fill all fields");
    }

    if (userInput.password !== userInput.confPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      const register = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          fullname: userInput.fullname,
          username: userInput.username,
          email: userInput.email,
          password: userInput.password,
          gender: userInput.gender,
        },
        {
          withCredentials: true,
        }
      );

      const data = register.data;

      if (data.success === false) {
        setLoading(false);
        return toast.error(data.message);
      }

      toast.success(data.message);

      localStorage.setItem("chatapp", JSON.stringify(data));

      setLoading(false);

      navigate("/login");
    } catch (error) {
      setLoading(false);

      toast.error(
        error.response?.data?.message || "Registration Failed"
      );

      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">

      <div className="card w-full max-w-md bg-base-100 shadow-2xl my-8">

        <div className="card-body">

          <h1 className="text-3xl font-bold text-center">
            Sign Up
            <span className="text-primary"> Chatters</span>
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 mt-6"
          >

            {/* Full Name */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Full Name
                </span>
              </label>

              <input
                id="fullname"
                type="text"
                placeholder="Enter Full Name"
                className="input input-bordered w-full"
                value={userInput.fullname}
                onChange={handleInput}
              />
            </div>

            {/* Username */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Username
                </span>
              </label>

              <input
                id="username"
                type="text"
                placeholder="Enter Username"
                className="input input-bordered w-full"
                value={userInput.username}
                onChange={handleInput}
              />
            </div>

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
                placeholder="Enter Email"
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
                placeholder="Enter Password"
                className="input input-bordered w-full"
                value={userInput.password}
                onChange={handleInput}
              />
            </div>

            {/* Confirm Password */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Confirm Password
                </span>
              </label>

              <input
                id="confPassword"
                type="password"
                placeholder="Confirm Password"
                className="input input-bordered w-full"
                value={userInput.confPassword}
                onChange={handleInput}
              />
            </div>

            {/* Gender */}

            <div className="form-control">

              <label className="label">
                <span className="label-text font-semibold">
                  Gender
                </span>
              </label>

              <div className="flex gap-8">

                <label className="cursor-pointer flex items-center gap-2">
                  <span>Male</span>

                  <input
                    type="radio"
                    name="gender"
                    className="radio radio-primary"
                    checked={userInput.gender === "male"}
                    onChange={() => handleGender("male")}
                  />
                </label>

                <label className="cursor-pointer flex items-center gap-2">
                  <span>Female</span>

                  <input
                    type="radio"
                    name="gender"
                    className="radio radio-primary"
                    checked={userInput.gender === "female"}
                    onChange={() => handleGender("female")}
                  />
                </label>

              </div>

            </div>

            {/* Signup Button */}

            <button
              type="submit"
              className="btn btn-primary w-full mt-4"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>

          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Login Now!!
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Signup;