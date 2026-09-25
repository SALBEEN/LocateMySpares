import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  Package,
} from "lucide-react";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import { showToast } from "../../utils/toast";
import Skeleton from "../../components/common/Skeleton";

const Checkout = () => {
  const { productId: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Capture the data passed from the Product Details page
  const passedProduct = location.state?.product;
  const passedQuantity = location.state?.quantity || 1;

  const [isLoading, setIsLoading] = useState(!passedProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState(passedProduct || null);

  // 2. Initialize quantity state
  const [quantity, setQuantity] = useState(passedQuantity);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);

  // Fetch product only if it wasn't passed via navigation state
  useEffect(() => {
    const targetId = passedProduct?._id || paramId;
    if (!targetId) {
      navigate("/catalog");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await productService.getSingleProduct(targetId);
        const data = response.data || response;
        setProduct(data.product || data);
      } catch (error) {
        showToast.error("Could not load product details.");
        navigate("/catalog");
      } finally {
        setIsLoading(false);
      }
    };

    if (!passedProduct) {
      fetchProduct();
    }
  }, [passedProduct, paramId, navigate]);

  // Date Logic
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (new Date(newStart) >= new Date(endDate)) {
      const nextDay = new Date(new Date(newStart).getTime() + 86400000)
        .toISOString()
        .split("T")[0];
      setEndDate(nextDay);
    }
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Quantity Handlers
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast.error(
        `Maximum stock reached! Only ${product.stock} available.`,
      );
    }
  };

  // Math Calculations
  const days = calculateDays();
  const price = product ? Number(product.pricePerDay) || 0 : 0;
  const depositPerItem = product ? Number(product.damageFund) || 0 : 0;

  const rentalCost = days * price * quantity;
  const totalDeposit = depositPerItem * quantity;
  const totalCost = rentalCost + totalDeposit;

  // Submit Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (quantity > product.stock) {
      showToast.error(`Only ${product.stock} units available.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        productId: product._id,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        quantity, // Passed to backend to block multiple items
        totalCost,
      };

      await orderService.createOrder(payload);

      showToast.success("Rental request submitted successfully!");
      navigate("/my-rentals");
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to submit booking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Secure Checkout
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review your rental dates and quantity before confirming.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Product & Dates */}
        <div className="flex-1 w-full space-y-6">
          {/* Product Summary Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex gap-6 shadow-sm items-center">
            <div className="w-28 h-28 shrink-0 rounded-2xl bg-gray-50 dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-700">
              <img
                src={product.imageUrl || product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
            <div className="flex flex-col justify-center flex-1">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                {product.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-bold">
                  Rs. {price} / day
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {product.stock} in stock
                </span>
              </div>
            </div>
          </div>

          {/* Rental Dates Form */}
          <form
            id="booking-form"
            onSubmit={handleConfirmBooking}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Calendar className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Rental Schedule
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="w-full px-4 py-3.5 font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Return Date
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3.5 font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary & Quantity */}
        <div className="w-full lg:w-[400px] lg:sticky lg:top-24 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-900/5">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              Order Summary
            </h3>

            {/* Quantity Adjuster */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold">
                <Package size={18} className="text-blue-500" /> Quantity
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1 rounded-xl shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-black text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 text-sm border-b border-gray-100 dark:border-gray-800 pb-6 mb-6">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  Rental ({days} {days === 1 ? "day" : "days"} × {quantity}{" "}
                  {quantity === 1 ? "item" : "items"})
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  Rs. {rentalCost}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <div className="flex flex-col">
                  <span className="font-medium">Damage Deposit</span>
                  <span className="text-[10px] text-gray-400">
                    (Refundable • Rs. {depositPerItem} / item)
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  Rs. {totalDeposit}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end mb-8">
              <span className="text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Due
              </span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">
                Rs. {totalCost}
              </span>
            </div>

            {/* Submit Button */}
            <button
              form="booking-form"
              type="submit"
              disabled={isSubmitting || quantity > product.stock}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 font-black text-lg shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                "Confirm Reservation"
              )}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Secure transaction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
