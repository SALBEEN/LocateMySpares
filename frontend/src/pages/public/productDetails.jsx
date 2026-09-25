import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Minus,
  Plus,
  PackageOpen,
} from "lucide-react";
import api from "../../services/api";
import { showToast } from "../../utils/toast";
import Skeleton from "../../components/common/Skeleton";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/product/${id}`);
        setProduct(response.data.product || response.data);
      } catch (error) {
        showToast.error("Failed to load product details.");
        navigate("/catalog");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast.error(`Only ${product.stock} units available in stock.`);
    }
  };

  const handleProceedToCheckout = () => {
    // Navigate to checkout and pass the product and requested quantity via state
    navigate("/checkout", { state: { product, quantity } });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-8">
        <Skeleton className="w-full md:w-1/2 h-96 rounded-2xl" />
        <div className="w-full md:w-1/2 space-y-4">
          <Skeleton className="w-3/4 h-10" />
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-full h-32" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.stock > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <button
        onClick={() => navigate("/catalog")}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 p-8 flex items-center justify-center">
          <img
            src={
              product.imageUrl ||
              product.image ||
              "https://placehold.co/600x400"
            }
            alt={product.name}
            className="w-full max-w-md object-contain rounded-xl drop-shadow-xl"
          />
        </div>

        {/* Right Side: Details & Action */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                {product.category}
              </span>
              <div
                className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg ${inStock ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
              >
                {inStock ? (
                  <ShieldCheck size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {inStock ? `${product.stock} In Stock` : "Out of Stock"}
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8 text-sm font-medium text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Lender</p>
                  <p className="text-gray-900 dark:text-white">
                    {product.owner?.name || "Verified Lender"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-gray-900 dark:text-white">
                    {product.location || "Bharatpur Area"}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {product.description}
            </p>
          </div>

          {/* Checkout & Quantity Box */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Rental Rate
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    Rs. {product.pricePerDay}
                  </span>
                  <span className="text-gray-500 font-medium mb-1">/ day</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Damage Deposit
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Rs. {product.damageFund}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="flex items-center justify-between gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 rounded-xl">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || !inStock}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= product.stock || !inStock}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToCheckout}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {inStock ? (
                  <>
                    Proceed to Booking <ArrowRight size={18} />
                  </>
                ) : (
                  <>Currently Unavailable</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
