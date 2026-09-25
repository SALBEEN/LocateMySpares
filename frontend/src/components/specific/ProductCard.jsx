import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, AlertCircle } from "lucide-react";

const ProductCard = ({ product }) => {
  const inStock = product.stock > 0;

  return (
    <Link
      to={`/catalog/${product._id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-blue-900/10 transition-all duration-300 cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {inStock ? (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
              Available
            </span>
          ) : (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheck size={14} className="mr-1.5 text-blue-500" />
            <span>{product.lender.name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={14} className="mr-1.5 text-gray-400" />
            <span>{product.lender.location}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
              Rent for
            </p>
            <p className="text-lg font-black text-gray-900 dark:text-white">
              Rs. {product.pricePerDay}{" "}
              <span className="text-sm font-normal text-gray-500">/day</span>
            </p>
          </div>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            View
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
