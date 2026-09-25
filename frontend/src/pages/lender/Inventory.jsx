import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit2, Trash2, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { showToast } from "../../utils/toast";
import Skeleton from "../../components/common/Skeleton";

const StatusBadge = ({ isAvailable, stock }) => {
  if (stock <= 0) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Out of Stock
      </span>
    );
  }
  return isAvailable ? (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Available
    </span>
  ) : (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      Hidden
    </span>
  );
};

const Inventory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  // 2. Fetch ONLY this lender's inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await productService.getMyProducts();

        let productsArray = [];
        if (Array.isArray(response)) productsArray = response;
        else if (Array.isArray(response.data)) productsArray = response.data;
        else if (response.data && Array.isArray(response.data.products))
          productsArray = response.data.products;
        else if (response.products && Array.isArray(response.products))
          productsArray = response.products;

        // Sort by Newest First (so your newly added products appear instantly at the top)
        const sortedProducts = productsArray.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setProducts(sortedProducts);
      } catch (error) {
        console.error("Failed to fetch inventory", error);
        showToast.error("Failed to load your inventory.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const toggleAvailability = async (productId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, isAvailable: newStatus } : p,
      ),
    );

    try {
      await productService.toggleAvailability(productId, newStatus);
      showToast.success("Product availability updated!");
    } catch (error) {
      console.error("Toggle failed", error);
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, isAvailable: currentStatus } : p,
        ),
      );
      showToast.error("Failed to update availability.");
    }
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)),
    );
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your equipment, pricing, and availability.
          </p>
        </div>

        <Link
          to="/inventory/new"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Product
        </Link>
      </div>
    </div>
  );
};

export default Inventory;
