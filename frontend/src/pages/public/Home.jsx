import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Zap,
  Wrench,
  Truck,
  ArrowRight,
  PackageCheck,
  BadgePercent,
  Clock,
  Sparkles,
} from "lucide-react";
import ProductCard from "../../components/specific/ProductCard";
import Skeleton from "../../components/common/Skeleton";
import api from "../../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Hero Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog`, { state: { initialSearch: searchQuery } });
    } else {
      navigate("/catalog");
    }
  };

  // Fetch real products from backend database instead of dummy data
  useEffect(() => {
    const fetchLiveFeaturedProducts = async () => {
      try {
        const response = await api.get("/product/all");
        const result = response.data;
        let rawProducts = [];

        if (Array.isArray(result)) {
          rawProducts = result;
        } else if (result && Array.isArray(result.data)) {
          rawProducts = result.data;
        } else if (result && Array.isArray(result.products)) {
          rawProducts = result.products;
        }

        // Format products to match UI requirements and pick top 3 available items
        const formatted = rawProducts.map((p) => ({
          ...p,
          image: p.imageUrl || p.image || "https://placehold.co/400x300",
          lender: {
            name: p.owner?.name || p.lender?.name || "Verified Lender",
            location: p.location || "Bharatpur",
          },
        }));

        setFeaturedProducts(formatted.slice(0, 3)); // Display up to 3 live items
      } catch (error) {
        console.error("Failed to fetch live inventory", error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveFeaturedProducts();
  }, []);

  const categories = [
    {
      name: "Power Tools",
      icon: Zap,
      desc: "Drills, grinders, saws & electric equipment",
      color:
        "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      name: "Hand Tools",
      icon: Wrench,
      desc: "Wrenches, hammers, socket sets & manuals",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      name: "Heavy Equipment",
      icon: Truck,
      desc: "Generators, mixers, scaffolding & machinery",
      color:
        "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 mt-4 px-6 py-16 md:py-24 text-center max-w-5xl mx-auto transition-colors">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 mb-6 shadow-sm">
            <Sparkles size={14} /> Trusted Equipment & Spare Parts Rental
            Network
          </span>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            Rent verified tools locally. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Build and repair without limits.
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
            Connect directly with verified local lenders. Skip massive capital
            expenses, secure rentals with eSewa verification, and protect items
            with built-in damage deposit workflows.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-10 w-full max-w-2xl flex items-center bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 transition-colors"
          >
            <div className="flex-1 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drills, generators, mixers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm md:text-base font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors text-sm shadow-md"
            >
              Explore Catalog
            </button>
          </form>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-200 dark:border-gray-800 w-full max-w-2xl text-center">
            <div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                100%
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
                Verified Lenders
              </p>
            </div>
            <div className="border-x border-gray-200 dark:border-gray-800">
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                Secure
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
                Damage Protection
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                Instant
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
                Order & Returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Explore Equipment Categories
          </h2>
          <Link
            to="/catalog"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-sm"
          >
            View catalog <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to="/catalog"
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all group flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3.5 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={24} />
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live Available Products from Database */}
      <section className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Available For Rent Now
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live items currently listed by local lenders in your area.
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-sm"
          >
            Browse all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4"
              >
                <Skeleton className="h-48 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                <Skeleton className="h-6 w-3/4 bg-gray-100 dark:bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-8 w-24 bg-gray-100 dark:bg-gray-800" />
                  <Skeleton className="h-8 w-24 rounded-lg bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))
          ) : featuredProducts.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
              <PackageCheck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                No equipment listed yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Check back soon or list your own gear as a lender!
              </p>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="max-w-5xl mx-auto bg-blue-50 dark:bg-blue-950/30 rounded-3xl p-8 md:p-12 border border-blue-200 dark:border-blue-900/50 flex flex-col md:flex-row items-center gap-8 transition-colors">
        <div className="flex-shrink-0 p-5 bg-blue-600 rounded-2xl text-white shadow-lg">
          <ShieldCheck size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Secure Escrow & Damage Protection Workflow
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed font-medium">
            Every order handles security deposits separately from daily rental
            fees. Lenders can verify safe returns or report damages with custom
            notes, ensuring a fair dispute resolution cycle for both parties.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
