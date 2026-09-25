import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  BadgeDollarSign,
  Phone,
  AlertTriangle,
  ShieldAlert,
  CheckSquare,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import Skeleton from "../../components/common/Skeleton";

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardTab, setDashboardTab] = useState("action");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    pendingCount: 0,
  });
  const [actionOrders, setActionOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get(`/order/stats/${user._id}`),
        api.get("/order/incoming-orders"),
      ]);

      const statsData = statsRes.data?.data || statsRes.data || {};
      let rawOrders = ordersRes.data?.orders || [];
      if (!Array.isArray(rawOrders) && Array.isArray(ordersRes.data)) {
        rawOrders = ordersRes.data;
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
        renter: {
          name: order.renter?.name || "Customer",
          phone: order.renter?.phoneNumber || null,
        },
        startDate: order.rentalStartDate
          ? order.rentalStartDate.split("T")[0]
          : "",
        endDate: order.rentalEndDate ? order.rentalEndDate.split("T")[0] : "",

        rentalCost: order.rentalCost || order.totalCost,
        securityDeposit: order.securityDeposit || 0,
        totalCost: order.totalCost,

        status: order.status || "Pending",
        notes: order.notes || "",
        paymentStatus: order.paymentStatus || "Pending",
        paymentProofImage: order.paymentProofImage || null,
        damageReportNote: order.damageReportNote || "",
      }));

      const needsAction = formattedOrders.filter(
        (o) =>
          o.status === "Pending" ||
          o.status === "Return Pending" ||
          o.status === "Disputed" ||
          (o.status === "Active" && o.paymentStatus === "Partial"),
      );

      const safeHistory = formattedOrders.filter(
        (o) =>
          o.status === "Completed" ||
          o.status === "Completed (Damaged)" ||
          o.status === "Cancelled" ||
          o.status === "Damage Claimed" ||
          (o.status === "Active" && o.paymentStatus !== "Partial"),
      );

      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        totalRentals: statsData.totalRentals || 0,
        pendingCount: needsAction.length,
      });

      setActionOrders(needsAction);
      setHistoryOrders(safeHistory);
    } catch (error) {
      console.error("Failed to fetch dashboard data from API", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAction = async (orderId, actionType, note = "") => {
    try {
      let payload = { orderId, action: actionType };

      if (actionType === "approve_order")
        payload = { orderId, newStatus: "Active" };
      if (actionType === "reject_order")
        payload = { orderId, newStatus: "Cancelled" };

      if (note) payload.note = note;

      await api.patch("/order/status", payload);
      showToast.success("Successfully updated!");
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to update", error);
      showToast.error(error.response?.data?.message || "Action failed.");
    }
  };

  const handleRejectPayment = async (orderId) => {
    const reason = window.prompt(
      "Why are you rejecting this payment? (e.g., 'Amount too low', 'Blurry image')",
    );
    if (reason === null) return;
    if (reason.trim() === "") {
      showToast.error("You must provide a reason for rejection.");
      return;
    }

    try {
      await api.patch("/order/status", {
        orderId,
        action: "reject_payment",
        rejectionNote: reason,
      });
      showToast.success("Payment rejected. Renter has been notified.");
      fetchDashboardData();
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to reject payment.",
      );
    }
  };

  const handleReportDamage = (orderId) => {
    const reason = window.prompt(
      "Describe the damage found on the item. The renter will see this.",
    );
    if (reason === null) return;
    if (reason.trim() === "") {
      showToast.error("You must provide a description of the damage.");
      return;
    }
    handleAction(orderId, "report_damage", reason);
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4 transition-colors">
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isLoading ? (
            <Skeleton className="w-24 h-8 bg-gray-100 dark:bg-gray-800" />
          ) : (
            value
          )}
        </h3>
      </div>
    </div>
  );

  const currentDisplayOrders =
    dashboardTab === "action" ? actionOrders : historyOrders;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Here is what's happening with your inventory today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Earnings"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          colorClass="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50"
        />
        <StatCard
          title="Units Rented"
          value={stats.totalRentals}
          icon={Package}
          colorClass="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
        />
        <StatCard
          title="Action Required"
          value={stats.pendingCount}
          icon={Clock}
          colorClass="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-6">
            <button
              onClick={() => setDashboardTab("action")}
              className={`pb-1 text-sm font-bold transition-colors border-b-2 ${
                dashboardTab === "action"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Action Required ({actionOrders.length})
            </button>
            <button
              onClick={() => setDashboardTab("history")}
              className={`pb-1 text-sm font-bold transition-colors border-b-2 ${
                dashboardTab === "history"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Active & Ledger ({historyOrders.length})
            </button>
          </div>
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
            {dashboardTab === "action"
              ? "Pending Approvals & Verification"
              : "Ledger & Records"}
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="w-full h-12 bg-gray-100 dark:bg-gray-800" />
            </div>
          ) : currentDisplayOrders.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="mx-auto text-gray-400 mb-4" size={32} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                You're all caught up!
              </h3>
            </div>
          ) : (
            currentDisplayOrders.map((order) => (
              <div
                key={order._id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
              >
                {/* Details Section */}
                <div className="flex items-center gap-4">
                  <img
                    src={order.product.image}
                    alt={order.product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {order.product.name}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${order.status.includes("Damage") ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                      >
                        {order.status}
                      </span>
                    </h4>

                    <div className="flex flex-col gap-1 mt-0.5">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Rented by{" "}
                        <span className="font-semibold text-gray-900 dark:text-gray-200">
                          {order.renter.name}
                        </span>
                      </p>

                      {[
                        "Active",
                        "Return Pending",
                        "Damage Claimed",
                        "Disputed",
                      ].includes(order.status) &&
                        order.renter.phone && (
                          <div className="flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                            <Phone size={12} />
                            <span>{order.renter.phone}</span>
                          </div>
                        )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Payment:{" "}
                        <strong
                          className={`${order.paymentStatus === "Completed" ? "text-green-600 dark:text-green-400" : order.paymentStatus === "Partial" ? "text-yellow-600 dark:text-yellow-400" : order.paymentStatus === "Rejected" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"} uppercase`}
                        >
                          {order.paymentStatus}
                        </strong>
                      </span>
                      {order.paymentProofImage && (
                        <a
                          href={order.paymentProofImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 hover:underline flex items-center gap-1 font-bold"
                        >
                          View Receipt <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* STRICT BUTTON LOGIC */}
                <div className="flex flex-col lg:items-end justify-between sm:justify-end w-full sm:w-auto gap-4">
                  {/* Ledger Breakdown */}
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                        Rental Income
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Rs. {order.rentalCost}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                        Security Deposit
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Rs. {order.securityDeposit}
                      </p>
                    </div>
                  </div>

                  {dashboardTab === "action" && (
                    <div className="flex gap-2">
                      {order.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleAction(order._id, "reject_order")
                            }
                            className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-3.5 py-2 rounded-xl hover:bg-red-100 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <XCircle size={14} /> Decline
                          </button>
                          <button
                            onClick={() =>
                              handleAction(order._id, "approve_order")
                            }
                            className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 px-3.5 py-2 rounded-xl hover:bg-green-100 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle size={14} /> Accept Order
                          </button>
                        </>
                      )}

                      {order.status === "Active" &&
                        order.paymentStatus === "Partial" && (
                          <>
                            <button
                              onClick={() => handleRejectPayment(order._id)}
                              className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-3.5 py-2 rounded-xl hover:bg-red-100 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                            <button
                              onClick={() =>
                                handleAction(order._id, "verify_payment")
                              }
                              className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 px-3.5 py-2 rounded-xl hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <BadgeDollarSign size={14} /> Verify
                            </button>
                          </>
                        )}

                      {order.status === "Return Pending" && (
                        <>
                          <button
                            onClick={() => handleReportDamage(order._id)}
                            className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-red-100 transition-colors shadow-sm"
                          >
                            <AlertTriangle size={14} /> Report Damage
                          </button>
                          <button
                            onClick={() =>
                              handleAction(order._id, "complete_safe_return")
                            }
                            className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-green-100 transition-colors shadow-sm"
                          >
                            <CheckSquare size={14} /> Safe Return
                          </button>
                        </>
                      )}

                      {order.status === "Disputed" && (
                        <span className="bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                          <ShieldAlert size={14} /> Admin Review Pending
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
