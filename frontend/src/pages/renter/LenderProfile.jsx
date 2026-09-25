import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Store,
  Package,
  Star,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";
import ProductCard from "../../components/specific/ProductCard";
import Skeleton from "../../components/common/Skeleton";
import { showToast } from "../../utils/toast";

const LenderProfile = () => {
  const { lenderId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [lender, setLender] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchLenderData = async () => {
      try {
        // Fetch lender profile and their products
        // (Adjust the endpoints if your backend route structure differs)
        const [lenderRes, productsRes] = await Promise.all([
          api.get(`/user/profile/${lenderId}`),
          api.get(`/product/all?owner=${lenderId}`),
        ]);

        setLender(lenderRes.data.user || lenderRes.data);
        setProducts(productsRes.data.products || productsRes.data);
      } catch (error) {
        console.error("Failed to load lender profile", error);
        showToast.error("Could not load lender details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (lenderId) {
      fetchLenderData();
    }
  }, [lenderId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!lender) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lender Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Lender Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-5 pointer-events-none">
          <Store size={160} />
        </div>

        <img
          src={
            lender.profileImage ||
            "https://res.cloudinary.com/sxlmgaox/image/upload/v1697060910/default-profile-image.png"
          }
          alt={lender.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-blue-50 dark:border-gray-700 shadow-md"
        />

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              {lender.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold w-fit mx-auto md:mx-0">
              <ShieldCheck size={14} /> Verified Lender
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-1">
            {lender.storeAddress && (
              <span className="flex items-center gap-1.5">
                <Store size={16} className="text-blue-600 dark:text-blue-400" />
                {lender.storeAddress}
              </span>
            )}
            {lender.lenderAddress && (
              <span className="flex items-center gap-1.5">
                <MapPin
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />
                {lender.lenderAddress}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Phone size={16} className="text-blue-600 dark:text-blue-400" />
              {lender.phoneNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Catalog Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600 dark:text-blue-400" size={24} />
            Equipment Available from {lender.name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700 text-gray-500">
            This lender hasn't listed any equipment yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LenderProfile;
