import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { showToast } from "../../utils/toast";
import {
  Home,
  Search,
  LayoutDashboard,
  Package,
  PlusCircle,
  ListOrdered,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  User,
  Camera,
  Shield,
  Mail,
  Phone,
  Key,
  XCircle,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth(); // Assuming your context exposes a logout function

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(0); // 0: hidden, 1: sending OTP, 2: entering OTP
  const [passData, setPassData] = useState({ otp: "", newPassword: "" });
  const [isUploading, setIsUploading] = useState(false);

  const publicLinks = [
    { name: "Home", path: "/", icon: <Home size={20} /> },
    { name: "Catalog", path: "/catalog", icon: <Search size={20} /> },
  ];
  const renterLinks = [
    {
      name: "My Rentals",
      path: "/my-rentals",
      icon: <ListOrdered size={20} />,
    },
  ];
  const lenderLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Inventory", path: "/inventory", icon: <Package size={20} /> },
    {
      name: "Add Product",
      path: "/inventory/new",
      icon: <PlusCircle size={20} />,
    },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
          isActive
            ? "bg-blue-600 text-white dark:bg-blue-500"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        }`
      }
    >
      {item.icon}
      <span>{item.name}</span>
    </NavLink>
  );

  // --- Profile Image Upload ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file); // Must match backend multer field name

    try {
      await api.post("/user/upload-profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast.success("Profile image updated! Refresh to see changes.");
    } catch (error) {
      showToast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Password Reset Flow ---
  const handleRequestPasswordReset = async () => {
    setPasswordStep(1);
    try {
      await api.post("/user/request-password-reset", { email: user.email });
      showToast.success("OTP sent to your email!");
      setPasswordStep(2);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to send reset code.",
      );
      setPasswordStep(0);
    }
  };

  const handleConfirmPasswordReset = async (e) => {
    e.preventDefault();
    try {
      await api.post("/user/reset-password", {
        email: user.email,
        otp: passData.otp,
        newPassword: passData.newPassword,
      });
      showToast.success("Password changed successfully!");
      setPasswordStep(0);
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to reset password.",
      );
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md text-gray-800 dark:text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Udharo LMS
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {publicLinks.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
          {user?.role === "renter" && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Renter Tools
              </div>
              {renterLinks.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </>
          )}
          {user?.role === "lender" && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Lender Tools
              </div>
              {lenderLinks.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* User Profile Card (Clickable to open settings) */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden shrink-0">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* --- Profile & Settings Modal --- */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 text-center relative">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setPasswordStep(0);
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <XCircle size={24} />
              </button>

              <div className="relative inline-block mt-2">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-blue-600/50 shadow-lg">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-gray-400" size={40} />
                  )}
                </div>
                {/* Upload Image Button */}
                <label className="absolute bottom-0 right-0 bg-blue-800 text-white p-2 rounded-full cursor-pointer hover:bg-blue-900 shadow-md transition-colors">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">{user.name}</h3>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-800/50 text-blue-100 text-xs font-semibold rounded-full capitalize border border-blue-400/30">
                Active {user.role}
              </span>
            </div>

            {/* Modal Body / Settings */}
            <div className="p-6 space-y-6">
              {/* User Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Mail size={16} className="text-gray-400" />{" "}
                  <span>{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="text-gray-400" />{" "}
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Settings Controls */}
              {passwordStep === 0 ? (
                <div className="space-y-3">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {theme === "dark" ? (
                        <Sun size={18} className="text-yellow-500" />
                      ) : (
                        <Moon size={18} className="text-blue-500" />
                      )}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </div>
                  </button>

                  <button
                    onClick={handleRequestPasswordReset}
                    className="flex items-center justify-between w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                      <Key size={18} className="text-gray-400" /> Change
                      Password
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full p-3 rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-sm font-bold text-red-600 dark:text-red-400">
                      <LogOut size={18} /> Logout
                    </div>
                  </button>
                </div>
              ) : passwordStep === 1 ? (
                <div className="text-center py-4">
                  <Shield
                    className="mx-auto text-blue-500 animate-pulse mb-3"
                    size={32}
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sending OTP to your email...
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleConfirmPasswordReset}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Enter OTP sent to {user.email}
                    </label>
                    <input
                      type="text"
                      required
                      value={passData.otp}
                      onChange={(e) =>
                        setPassData({ ...passData, otp: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="123456"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passData.newPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasswordStep(0)}
                      className="flex-1 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Save Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
