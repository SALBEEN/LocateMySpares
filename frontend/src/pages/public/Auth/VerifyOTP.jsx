import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
// Import your Express API instance
import api from "../../../services/api";
import { authService } from "../../../services/authService";
import { showToast } from "../../../utils/toast";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Grab the data passed from Register.jsx
  const formData = location.state?.formData;
  const formattedPhoneNumber = location.state?.formattedPhoneNumber;

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Refs for input focus
  const inputRefs = useRef([]);

  // Kick user back if they bypassed the flow
  useEffect(() => {
    if (!formData || !window.confirmationResult) {
      navigate("/register");
    }
  }, [formData, navigate]);

  // ... (Keep the handleChange and handleKeyDown functions from the previous version) ...
  const handleChange = (element, index) => {
    /* Same as before */
  };
  const handleKeyDown = (e, index) => {
    /* Same as before */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 1. Ask Firebase to verify the code the user typed
      await window.confirmationResult.confirm(otpValue);

      // 2. If we reach this line, Firebase verified them successfully!
      // Now we send their data to your Express backend to create the account in MongoDB
      const registerPayload = {
        name: formData.name,
        phoneNumber: formData.phoneNumber, // Store the local format in your DB
        password: formData.password,
        role: formData.role,
        ...(formData.role === "lender" && {
          lenderAddress: formData.lenderAddress || "Bharatpur",
          storeAddress: formData.storeAddress || "Bharatpur Store",
        }),
      };

      const backendResponse = await api.post("/auth/register", registerPayload);

      // 3. Clear the firebase object from memory
      window.confirmationResult = null;

      // 4. Success! Route them to login.
      navigate("/login");
    } catch (err) {
      console.error(err);
      // Firebase throws specific errors for bad codes
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP code. Please try again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Verification failed. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        {/* ... The UI remains exactly the same as before ... */}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Verify Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
