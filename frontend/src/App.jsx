import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

// Layout
import MainLayout from "./components/layout/MainLayout";
import VerifyOTP from "./pages/public/Auth/VerifyOTP";

// Public Pages
import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";
import ProductDetails from "./pages/public/productDetails";
import Login from "./pages/public/Auth/Login";
import Register from "./pages/public/Auth/Register";

// Renter Pages
import MyRentals from "./pages/renter/MyRentals";
import Checkout from "./pages/renter/Checkout";
import LenderProfile from "./pages/renter/LenderProfile";

// Lender Pages
import Dashboard from "./pages/lender/Dashboard";
import Inventory from "./pages/lender/Inventory";
import AddProduct from "./pages/lender/AddProduct";

import { useAuth } from "./hooks/useAuth"; // Import the hook

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth(); // Mock user for testing UI
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* FULL SCREEN ROUTES (No Sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* LAYOUT ROUTES (With Sidebar & Breadcrumbs) */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ProductDetails />} />
          <Route path="/lender/:lenderId" element={<LenderProfile />} />

          {/* Protected Routes (Renters & Lenders) */}
          <Route
            path="/my-rentals"
            element={
              <ProtectedRoute allowedRoles={["renter", "lender"]}>
                <MyRentals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:productId?"
            element={
              <ProtectedRoute allowedRoles={["renter", "lender"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes (Strictly Lenders) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/new"
            element={
              <ProtectedRoute allowedRoles={["lender"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
