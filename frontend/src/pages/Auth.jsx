import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[A-Za-z\s]+$/;

  const validateField = (name, value) => {
    let message = "";

    if (name === "name") {
      if (!value) {
        message = "Name is required";
      } else if (!nameRegex.test(value)) {
        message = "Enter a valid name (letters only)";
      }
    }

    if (name === "email") {
      if (!value) {
        message = "Email is required";
      } else if (!emailRegex.test(value)) {
        message = "Enter a valid email address";
      }
    }

    if (name === "password" && !isLogin) {
      if (!value) {
        message = "Password is required";
      } else {
        const isValid =
          value.length >= 8 &&
          /[A-Z]/.test(value) &&
          /[a-z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[!@#$%^&*]/.test(value);

        if (!isValid) {
          message = "Password does not meet requirements";
        }
      }
    }

    if (name === "confirmPassword" && !isLogin) {
      if (!value) {
        message = "Please confirm your password";
      } else if (value !== form.password) {
        message = "Passwords do not match";
      }
    }

    return message;
  };

  const handleBlur = (e) => {
    const message = validateField(e.target.name, e.target.value);

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: message,
    }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Proper Submit Validation
  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    let newErrors = {};

    // 🔹 SIGNUP → Frontend validation
    if (!isLogin) {
      const fieldsToValidate = ["name", "email", "password", "confirmPassword"];

      fieldsToValidate.forEach((field) => {
        const message = validateField(field, form[field]);
        if (message) {
          newErrors[field] = message;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    try {
      if (isLogin) {
        // 🔹 LOGIN (Backend handles validation)
        const res = await api.post("/api/auth/login", {
          email: form.email.trim(),
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);

        toast.success("Login successful");
        navigate("/");
      } else {
        // 🔹 REGISTER
        await api.post("/api/auth/register", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });

        toast.success("Account created successfully");
        setIsLogin(true);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";

      // 🔥 Real-world error mapping
      if (isLogin) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="border border-gray-300 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-[550px] p-6 sm:p-8 rounded-md shadow-sm">
        <h2 className="text-xl sm:text-2xl mb-4 text-center sm:text-left">
          {isLogin ? "Sign-In" : "Create account"}
        </h2>

        {/* Name */}
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-sm font-semibold">Your name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full mt-1 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-semibold">Email</label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full mt-1 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-semibold">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full mt-1 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 pr-16"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-sm text-blue-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>

          {!isLogin && (
            <div className="mt-2 text-[10px] flex flex-wrap gap-1">
              <p
                className={
                  form.password.length >= 8 ? "text-green-600" : "text-gray-800"
                }
              >
                • At least 8 characters
              </p>
              <p
                className={
                  /[A-Z]/.test(form.password)
                    ? "text-green-600"
                    : "text-gray-800"
                }
              >
                • One uppercase letter
              </p>
              <p
                className={
                  /[a-z]/.test(form.password)
                    ? "text-green-600"
                    : "text-gray-800"
                }
              >
                • One lowercase letter
              </p>
              <p
                className={
                  /[0-9]/.test(form.password)
                    ? "text-green-600"
                    : "text-gray-800"
                }
              >
                • One number
              </p>
              <p
                className={
                  /[!@#$%^&*]/.test(form.password)
                    ? "text-green-600"
                    : "text-gray-800"
                }
              >
                • One special character
              </p>
            </div>
          )}

          {errors.password && (
            <p className="text-red-600 text-sm mt-2">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        {!isLogin && (
          <div className="mb-4 relative">
            <label className="block text-sm font-semibold">
              Re-enter password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full mt-1 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-sm text-blue-600"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded text-black font-medium"
        >
          {isLogin ? "Sign-In" : "Create your account"}
        </button>

        <hr className="my-4" />

        <p className="text-sm text-center">
          {isLogin ? "New to MyShop?" : "Already have an account?"}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-blue-600 cursor-pointer hover:underline ml-1"
          >
            {isLogin ? "Create your account" : "Sign-In"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
