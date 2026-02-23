import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import CategoryProducts from "./pages/CategoryProducts";
import Auth from "./pages/Auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();

  const hideNavbar = location.pathname === "/auth";

  // 🔥 Auto logout if token deleted
  useEffect(() => {
    const interval = setInterval(() => {
      if (!localStorage.getItem("token") && location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* 🔐 Protected Routes */}

        {/* 🔥 Categories Page */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Optional: redirect "/" → "/categories" */}
        <Route path="/" element={<Navigate to="/categories" />} />

        <Route
          path="/allproducts"
          element={
            <ProtectedRoute>
              <AllProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/category/:categoryName/:id"
          element={
            <ProtectedRoute>
              <CategoryProducts />
            </ProtectedRoute>
          }
        />

        <Route path="/auth" element={<Auth />} />

        <Route path="*" element={<Navigate to="/categories" />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
