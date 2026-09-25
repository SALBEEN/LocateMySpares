import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Tags,
  PackageSearch,
} from "lucide-react";
import api from "../../services/api";
import { showToast } from "../../utils/toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State including Stock
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    pricePerDay: "",
    damageFund: "",
    stock: 1, // Default stock is 1
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    "Power Tools",
    "Heavy Equipment",
    "Hand Tools",
    "Automotive",
    "Gardening & Landscaping",
    "Events & Party",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      showToast.error("Please upload an image of the equipment.");
      return;
    }

    if (formData.stock < 1) {
      showToast.error("Stock must be at least 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("pricePerDay", formData.pricePerDay);
      submitData.append("damageFund", formData.damageFund);
      submitData.append("stock", formData.stock); // Append stock to backend
      submitData.append("image", imageFile);

      await api.post("/product/create", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast.success("Product published successfully!");
      navigate("/inventory");
    } catch (err) {
      showToast.error(err.response?.data?.message || "Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/inventory")}
          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            List New Equipment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the details below to add a new item to your rental catalog.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Core Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <PackageSearch size={18} className="text-blue-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Equipment Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Equipment Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Bosch Power Drill 500W"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description
              </label>
              <textarea
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the condition, included accessories, and key specifications..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Right Column: Pricing & Media */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <Tags size={18} className="text-green-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Pricing & Stock
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Price/Day (Rs)
                </label>
                <input
                  type="number"
                  name="pricePerDay"
                  min="0"
                  required
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full px-4 py-3 font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Deposit (Rs)
                </label>
                <input
                  type="number"
                  name="damageFund"
                  min="0"
                  required
                  value={formData.damageFund}
                  onChange={handleChange}
                  placeholder="2000"
                  className="w-full px-4 py-3 font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* NEW STOCK FIELD */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Total Inventory Stock
              </label>
              <input
                type="number"
                name="stock"
                min="1"
                required
                value={formData.stock}
                onChange={handleChange}
                placeholder="1"
                className="w-full px-4 py-3 font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                How many identical units of this item do you have?
              </p>
            </div>

            {/* Modern Image Upload */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Product Image
              </label>
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 group h-56">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-400 transition-colors cursor-pointer group">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/inventory")}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md disabled:opacity-70 transition-colors min-w-[160px]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Publish Listing"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
