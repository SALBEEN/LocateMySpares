import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
  Store,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import api from "../../../services/api";
import { showToast } from "../../../utils/toast";

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "renter",
    lenderAddress: "",
    storeAddress: "",
    otp: "",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleRoleSelection = (selectedRole) =>
    setFormData((prev) => ({ ...prev, role: selectedRole }));

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 1. Password Match Validation
      if (formData.password !== formData.confirmPassword)
        throw new Error("Passwords do not match.");

      // 2. Simplified Password Validation Rule (Minimum length 8 characters)
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      // 3. Phone Number Validation
      if (formData.phoneNumber.length < 10)
        throw new Error("Please enter a valid 10-digit phone number.");

      const formattedPhoneNumber = `+977${formData.phoneNumber}`;
      const response = await api.post("/user/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formattedPhoneNumber,
        role: formData.role,
        lenderAddress:
          formData.role === "renter" ? formData.lenderAddress : undefined,
        storeAddress:
          formData.role === "lender" ? formData.storeAddress : undefined,
      });

      if (response.data.success) {
        showToast.success("Verification code sent to your email!");
        setStep(2);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed.",
      );
      showToast.error(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/user/verify-email-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      if (response.data.success) {
        showToast.success("Email verified successfully! You can now log in.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Verification failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* LEFT SIDE: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent"></div>

        <div className="relative z-10 p-12 max-w-2xl text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <Wrench className="text-white w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Join the Udharo <br />
            <span className="text-blue-400">Network.</span>
          </h1>
          <p className="text-lg text-blue-100/80">
            Whether you want to earn money renting out your idle equipment, or
            save money borrowing local tools, you're in the right place.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-h-screen overflow-y-auto">
        <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:p-0 my-auto">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {step === 1 ? "Create an Account" : "Verify Your Email"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {step === 1
                ? "Start your journey with Udharo LMS today."
                : `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelection("renter")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${formData.role === "renter" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-500 dark:text-gray-400"}`}
                >
                  <Package className="mb-1.5 h-5 w-5" />
                  <span className="font-semibold text-sm">I want to Rent</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelection("lender")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${formData.role === "lender" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-500 dark:text-gray-400"}`}
                >
                  <Store className="mb-1.5 h-5 w-5" />
                  <span className="font-semibold text-sm">I want to Lend</span>
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="relative">
                  <User className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Email Address"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Phone Number (e.g. 9840000000)"
                  />
                </div>

                {formData.role === "lender" ? (
                  <input
                    name="storeAddress"
                    type="text"
                    required
                    value={formData.storeAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Store Address / Location"
                  />
                ) : (
                  <input
                    name="lenderAddress"
                    type="text"
                    required
                    value={formData.lenderAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Preferred Local Area"
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Lock className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Password"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Confirm"
                    />
                  </div>
                </div>
                {/* Helper text for password rule */}
                <p className="text-[11px] text-gray-500 dark:text-gray-400 px-1">
                  Password must be at least 8 characters long.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md mt-4"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    Sign Up & Send Code{" "}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtpSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                  <input
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-3.5 text-center tracking-widest text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Complete Registration"
                )}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Back to edit details
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center lg:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
