import { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  RotateCcw,
  Upload,
  ExternalLink,
  XCircle,
  Phone,
  AlertCircle,
  Trash2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import { showToast } from "../../utils/toast";
import Skeleton from "../../components/common/Skeleton";

const MyRentals = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [rentals, setRentals] = useState({ active: [], history: [] });
  const [uploadingOrderId, setUploadingOrderId] = useState(null);

  const fetchRentals = async () => {
    try {
      const response = await api.get("/order/my-rentals");
      let rawOrders = response.data?.rentals || [];
      if (!Array.isArray(rawOrders) && Array.isArray(response.data)) {
        rawOrders = response.data;
      }

      const formattedOrders = rawOrders.map((order) => ({
        _id: order._id,
        product: {
          name: order.product?.name || "Equipment",
          image:
            order.product?.imageUrl ||
            order.product?.image ||
            "https://placehold.co/100x100",
        },
        lender: {
          name: order.lender?.name || "Lender Store",
          location: order.lender?.storeAddress || "Bharatpur",
          phone: order.lender?.phoneNumber || null,
        },
        startDate: order.rentalStartDate
          ? order.rentalStartDate.split("T")[0]
          : "",
        endDate: order.rentalEndDate ? order.rentalEndDate.split("T")[0] : "",

        // NEW: Split Costs
        rentalCost: order.rentalCost || order.totalCost,
        securityDeposit: order.securityDeposit || 0,
        totalCost: order.totalCost,

        status: order.status || "Pending",
        paymentStatus: order.paymentStatus || "Pending",
        paymentProofImage: order.paymentProofImage || null,
        paymentRejectionNote: order.paymentRejectionNote || "",
        damageReportNote: order.damageReportNote || "",
      }));

      const active = formattedOrders.filter((o) =>
        [
          "Pending",
          "Active",
          "Return Pending",
          "Damage Claimed",
          "Disputed",
        ].includes(o.status),
      );
      const history = formattedOrders.filter((o) =>
        ["Completed", "Completed (Damaged)", "Cancelled"].includes(o.status),
      );

      setRentals({ active, history });
    } catch (error) {
      console.error("Failed to fetch rentals", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleUploadProof = async (orderId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingOrderId(orderId);
      await api.patch(`/order/${orderId}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast.success("Payment proof uploaded successfully!");
      fetchRentals();
    } catch (error) {
      showToast.error("Failed to upload screenshot.");
    } finally {
      setUploadingOrderId(null);
    }
  };

  const handleRemoveScreenshot = async (orderId) => {
    if (!window.confirm("Remove this payment screenshot?")) return;
    try {
      await api.patch("/order/status", {
        orderId,
        action: "remove_screenshot",
      });
      showToast.success("Screenshot removed.");
      fetchRentals();
    } catch (error) {
      showToast.error("Failed to remove screenshot.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this rental request?"))
      return;
    try {
      await api.patch("/order/status", { orderId, newStatus: "Cancelled" });
      showToast.success("Rental request cancelled successfully.");
      fetchRentals();
    } catch (error) {
      showToast.error("Failed to cancel request.");
    }
  };

  const handleInitiateReturn = async (orderId) => {
    try {
      await api.patch("/order/initiate-return", { orderId });
      showToast.success("Return initiated!");
      fetchRentals();
    } catch (error) {
      showToast.error("Failed to process return.");
    }
  };

  // NEW: Universal handler for Damage Claims
  const handleAction = async (orderId, actionType) => {
    try {
      await api.patch("/order/status", { orderId, action: actionType });
      showToast.success("Status updated successfully.");
      fetchRentals();
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to update status.",
      );
    }
  };

  const RentalCard = ({ rental }) => {
    let statusColor =
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    let StatusIcon = Package;

    if (rental.status === "Active") {
      statusColor =
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    } else if (rental.status === "Pending") {
      statusColor =
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      StatusIcon = Clock;
    } else if (rental.status === "Return Pending") {
      statusColor =
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      StatusIcon = RotateCcw;
    } else if (rental.status.includes("Completed")) {
      statusColor =
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      StatusIcon = CheckCircle;
    } else if (rental.status === "Damage Claimed") {
      statusColor =
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse";
      StatusIcon = AlertTriangle;
    } else if (rental.status === "Disputed") {
      statusColor =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      StatusIcon = ShieldAlert;
    } else if (rental.status === "Cancelled") {
      statusColor =
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      StatusIcon = XCircle;
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={rental.product.image}
              alt={rental.product.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {rental.product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} /> {rental.lender.name} (
                  {rental.lender.location})
                </p>
                {/* Reveal Phone Number when appropriate */}
                {[
                  "Active",
                  "Return Pending",
                  "Damage Claimed",
                  "Disputed",
                ].includes(rental.status) &&
                  rental.lender.phone && (
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 w-fit px-2 py-0.5 rounded-md">
                      <Phone size={14} /> {rental.lender.phone}
                    </p>
                  )}
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
              >
                <StatusIcon size={14} /> {rental.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar size={18} className="text-gray-400" />
                <span>
                  {rental.startDate} → {rental.endDate}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rental Value
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Rs. {rental.rentalCost}
                  </p>
                </div>
                <div className="text-right border-l border-gray-200 dark:border-gray-700 pl-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Security Deposit
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Rs. {rental.securityDeposit}
                  </p>
                </div>
                {rental.status === "Active" && (
                  <button
                    onClick={() => handleInitiateReturn(rental._id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <RotateCcw size={14} /> Return Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEW: DAMAGE CLAIM PORTAL */}
        {rental.status === "Damage Claimed" && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-xl">
              <h4 className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-3">
                <AlertTriangle size={18} /> Lender Reported Damage
              </h4>
              <p className="text-sm text-red-800 dark:text-red-300 bg-red-100/50 dark:bg-red-950/50 p-4 rounded-lg border border-red-200/50 dark:border-red-800/50 mb-5">
                <strong className="block text-[11px] uppercase tracking-wider mb-1 opacity-70">
                  Lender's Note:
                </strong>
                "{rental.damageReportNote}"
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() =>
                    handleAction(rental._id, "accept_damage_charge")
                  }
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors"
                >
                  Accept Charge (Forfeit Deposit)
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to dispute this? An admin will investigate.",
                      )
                    ) {
                      handleAction(rental._id, "dispute_damage");
                    }
                  }}
                  className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
                >
                  Dispute Claim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment & Rejection Portal */}
        {rental.status !== "Cancelled" &&
          rental.status !== "Damage Claimed" && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
              {/* Show Rejection Note if applicable */}
              {rental.paymentStatus === "Rejected" && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">Payment Rejected</span>
                    <span>{rental.paymentRejectionNote}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>Payment Status:</span>
                  <span
                    className={`font-bold uppercase px-2.5 py-1 rounded-md ${rental.paymentStatus === "Rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"}`}
                  >
                    {rental.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {rental.status === "Pending" && !rental.paymentProofImage && (
                    <button
                      onClick={() => handleCancelOrder(rental._id)}
                      className="flex items-center justify-center flex-1 sm:flex-none gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800 px-4 py-2 rounded-lg transition-colors"
                    >
                      <XCircle size={14} /> Cancel Request
                    </button>
                  )}

                  {rental.paymentProofImage ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={rental.paymentProofImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex-1 sm:flex-none justify-center font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-800 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        View Receipt <ExternalLink size={14} />
                      </a>
                      {rental.status === "Pending" && (
                        <button
                          onClick={() => handleRemoveScreenshot(rental._id)}
                          className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800 p-2 rounded-lg transition-colors"
                          title="Remove Screenshot"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label
                      className={`cursor-pointer flex-1 sm:flex-none justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${uploadingOrderId === rental._id ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Upload size={14} className="text-blue-500" />
                      {uploadingOrderId === rental._id
                        ? "Uploading..."
                        : "Upload Screenshot"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadProof(rental._id, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  const currentRentals =
    activeTab === "active" ? rentals.active : rentals.history;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          My Rentals
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Track your current equipment and past rental history.
        </p>
      </div>
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "active" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
        >
          Active & Action Required
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "history" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
        >
          Rental History
        </button>
      </div>
      <div className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : currentRentals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Package
              className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
              size={48}
            />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No {activeTab} rentals found
            </h3>
          </div>
        ) : (
          currentRentals.map((rental) => (
            <RentalCard key={rental._id} rental={rental} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyRentals;
