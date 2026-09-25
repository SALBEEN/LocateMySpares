import { useState, useEffect } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import ProductCard from "../../components/specific/ProductCard";
import Skeleton from "../../components/common/Skeleton";
import { useDebounce } from "../../hooks/useDebounce";
import api from "../../services/api";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    "All",
    "Power Tools",
    "Heavy Equipment",
    "Hand Tools",
    "Automotive",
    "Events & Party",
  ];

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const categoryParam =
          selectedCategory === "All" ? "" : selectedCategory;

        const response = await api.get("/product/all", {
          params: {
            search: debouncedSearch,
            category: categoryParam,
          },
        });

        const result = response.data;
        let rawProducts = [];

        // Extract products array safely from response
        if (Array.isArray(result)) {
          rawProducts = result;
        } else if (result && Array.isArray(result.data)) {
          rawProducts = result.data;
        } else if (result && Array.isArray(result.products)) {
          rawProducts = result.products;
        }

        // MAP DATABASE FIELDS TO MATCH UI CARD EXPECTATIONS
        const formattedProducts = rawProducts.map((p) => ({
          ...p,
          image: p.imageUrl || p.image || "https://placehold.co/400x300",
          lender: {
            name: p.owner?.name || p.lender?.name || "Verified Lender",
            location: p.location || "Bharatpur",
          },
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Failed to fetch catalog from API", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [debouncedSearch, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for drills, generators, tools..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>

        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors"
        >
          <SlidersHorizontal size={20} />
          Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar: Filters */}
        <div
          className={`w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors ${
            showMobileFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-400" />
            <h2 className="font-bold text-gray-900 dark:text-white">
              Categories
            </h2>
          </div>

          <div className="space-y-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right Area: Product Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors"
                >
                  <Skeleton className="h-48 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
                  <Skeleton className="h-6 w-3/4 bg-gray-100 dark:bg-gray-800" />
                  <Skeleton className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No equipment found
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                Try adjusting your search or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSearchInput("");
                  setSelectedCategory("All");
                }}
                className="mt-6 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
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
    </div>
  );
};

export default Catalog;
