import { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../services/api";
import { showToast } from "../../utils/toast";

import {
  LogOut,
  X,
  Menu,
  Home,
  Package,
  ShoppingBag,
  LayoutDashboard,
  PlusCircle,
  User,
  ChevronDown,
  Settings,
  Moon,
  Sun,
  Camera,
  Shield,
  Mail,
  Phone,
  Key,
  XCircle,
  CheckCircle2,
  Search,
} from "lucide-react";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(0);
  const [passData, setPassData] = useState({ otp: "", newPassword: "" });
  const [isUploading, setIsUploading] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

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
      setPassData({ otp: "", newPassword: "" });
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to reset password.",
      );
    }
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Catalog", path: "/catalog", icon: Package },
    ...(user && user.role !== "lender"
      ? [{ name: "My Rentals", path: "/my-rentals", icon: ShoppingBag }]
      : []),
    ...(user?.role === "lender"
      ? [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { name: "Inventory", path: "/inventory", icon: Package },
          { name: "Add Product", path: "/inventory/new", icon: PlusCircle },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors relative">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-black text-blue-600 dark:text-blue-500 tracking-tight"
          >
            LMS
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                {/* Profile Badge Button */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden shrink-0 border border-blue-200 dark:border-blue-800">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        className="text-blue-600 dark:text-blue-400"
                        size={16}
                      />
                    )}
                  </div>
                  <div className="text-left hidden sm:block max-w-[150px]">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none mt-0.5">
                      {user.name}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-500 dark:text-gray-400 ml-1"
                  />
                </button>

                {/* Desktop Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 bg-green-100/50 dark:bg-green-900/20 w-fit px-2 py-1 rounded-md border border-green-200 dark:border-green-800/50">
                          <CheckCircle2
                            size={14}
                            className="text-green-600 dark:text-green-500"
                          />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                            Active & Verified User
                          </span>
                        </div>
                      </div>

                      <div className="p-2 space-y-1 border-b border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setShowSettingsModal(true);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Settings size={18} className="text-gray-400" />{" "}
                          Account Settings
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            toggleTheme();
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          {theme === "dark" ? (
                            <Sun size={18} className="text-yellow-500" />
                          ) : (
                            <Moon size={18} className="text-blue-500" />
                          )}
                          {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </button>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setShowLogoutModal(true);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu (Now includes Profile & Theme Toggle) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2 shadow-lg">
            {/* Mobile Profile Details */}
            {user && (
              <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden shrink-0 border border-blue-200 dark:border-blue-800">
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
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <Icon size={20} /> {link.name}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <>
                  <button
                    onClick={() => toggleTheme()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors"
                  >
                    {theme === "dark" ? (
                      <Sun size={18} className="text-yellow-500" />
                    ) : (
                      <Moon size={18} className="text-blue-500" />
                    )}
                    {theme === "dark"
                      ? "Switch to Light Mode"
                      : "Switch to Dark Mode"}
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowSettingsModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors"
                  >
                    <Settings size={18} /> Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="w-full flex-1 flex px-6 py-8 gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Menu
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <Icon size={20} /> {link.name}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* ---------------- SETTINGS & PROFILE MODAL ---------------- */}
      {showSettingsModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-200 dark:border-gray-800">
            <div className="bg-blue-600 p-6 text-center relative">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setPasswordStep(0);
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
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
                <label className="absolute bottom-0 right-0 bg-blue-800 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-900 shadow-md transition-colors border-2 border-white">
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
              <span className="inline-block mt-1 px-3 py-1 bg-blue-800/50 text-blue-100 text-xs font-bold rounded-full capitalize border border-blue-400/30">
                {user.role} Account
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <Mail size={16} className="text-blue-500" />{" "}
                  <span>{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <Phone size={16} className="text-green-500" />{" "}
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
              </div>

              {passwordStep === 0 ? (
                <button
                  onClick={handleRequestPasswordReset}
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-gray-200">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                      <Key size={18} />
                    </div>
                    Change Password
                  </div>
                  <span className="text-xs text-gray-500">
                    Requires Email OTP
                  </span>
                </button>
              ) : passwordStep === 1 ? (
                <div className="text-center py-6 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <Shield
                    className="mx-auto text-blue-500 animate-pulse mb-3"
                    size={36}
                  />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Sending verification code...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please check your inbox.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleConfirmPasswordReset}
                  className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Enter OTP code sent to email
                    </label>
                    <input
                      type="text"
                      required
                      value={passData.otp}
                      onChange={(e) =>
                        setPassData({ ...passData, otp: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasswordStep(0)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- LOGOUT MODAL ---------------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <LogOut size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ready to leave?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Are you sure you want to log out? You will need to sign back
                  in to manage your rentals and inventory.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                >
                  Yes, Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
