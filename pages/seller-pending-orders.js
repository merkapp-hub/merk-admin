import React, { useState, useEffect, useContext } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import Swal from "sweetalert2";
import currencySign from "@/utils/currencySign";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";

function SellerPendingOrders(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [statusFilter, setStatusFilter] = useState("all"); // Show all orders by default

  useEffect(() => {
    if (user?.role === "seller") {
      fetchOrders();
      fetchNotifications();
    }
  }, [user, currentPage, statusFilter, pagination.limit]);

  const fetchOrders = async () => {
    props.loader(true);
    try {
      const apiUrl = `getSellerPendingOrders?status=${statusFilter}&page=${currentPage}&limit=${pagination.limit}`;
      
      const res = await Api(
        "get",
        apiUrl,
        "",
        router
      );

      if (res.status) {
        setOrders(res.data || []);
        setPagination(res.pagination || pagination);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      props.toaster({ type: "error", message: "Failed to load orders" });
    } finally {
      props.loader(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await Api("get", "getSellerNotifications?limit=50", "", router);
    
      if (res.status) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleApprove = (orderId) => {
    Swal.fire({
      title: "Approve Order?",
      text: "This will confirm the order and start processing.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        props.loader(true);
        try {
          const res = await Api("post", "approveOrder", { orderId }, router);
          
          if (res.status) {
            Swal.fire({
              title: "Approved!",
              text: "Order has been approved successfully.",
              icon: "success",
              confirmButtonColor: "#28a745"
            });
            fetchOrders();
            fetchNotifications();
          } else {
            throw new Error(res.message || "Failed to approve order");
          }
        } catch (err) {
          Swal.fire({
            title: "Error!",
            text: err.message || "Failed to approve order",
            icon: "error",
            confirmButtonColor: "#d33"
          });
        } finally {
          props.loader(false);
        }
      }
    });
  };

  const handleReject = (orderId) => {
    Swal.fire({
      title: "Reject Order?",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Enter reason for rejection...",
      inputAttributes: {
        "aria-label": "Enter reason for rejection"
      },
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Please provide a reason for rejection";
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        props.loader(true);
        try {
          const res = await Api(
            "post",
            "rejectOrder",
            { orderId, reason: result.value },
            router
          );
          
          if (res.status) {
            Swal.fire({
              title: "Rejected!",
              text: "Order has been rejected.",
              icon: "success",
              confirmButtonColor: "#28a745"
            });
            fetchOrders();
            fetchNotifications();
          } else {
            throw new Error(res.message || "Failed to reject order");
          }
        } catch (err) {
          Swal.fire({
            title: "Error!",
            text: err.message || "Failed to reject order",
            icon: "error",
            confirmButtonColor: "#d33"
          });
        } finally {
          props.loader(false);
        }
      }
    });
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await Api("post", "markNotificationRead", { notificationId }, router);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800"
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <section className="w-full h-full bg-transparent md:pt-5 pt-2 pb-5 pl-5 pr-5 relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
      </div>

      <div className="mb-4 flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-800"
          >
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="all">All Orders</option>
          </select>
        </div>
        
        {pagination.total > 0 && (
          <div className="text-sm text-gray-600">
            Total: {pagination.total} orders
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.firstName} {order.user?.lastName}
                      <br />
                      <span className="text-xs text-gray-500">
                        {order.user?.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currencySign(order.total?.toFixed(2) || "0.00")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          order.sellerApprovalStatus
                        )}`}
                      >
                        {order.sellerApprovalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moment(order.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.sellerApprovalStatus === "Pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(order._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(order._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {order.sellerApprovalStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              {pagination.totalPages > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage >= pagination.totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage >= pagination.totalPages 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </>
              )}
              <span className="text-sm text-gray-700 mx-auto">
                Page {currentPage} of {pagination.totalPages}
              </span>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              {pagination.totalPages > 1 && (
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                          : 'text-gray-500 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      ← Previous
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage >= pagination.totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage >= pagination.totalPages 
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                          : 'text-gray-500 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      Next →
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif._id}
                className={`p-3 rounded border ${
                  notif.readBy?.includes(user._id)
                    ? "bg-gray-50 border-gray-200"
                    : "bg-blue-50 border-blue-200"
                }`}
                onClick={() => markNotificationRead(notif._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600">{notif.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {moment(notif.createdAt).fromNow()}
                    </p>
                  </div>
                  {!notif.readBy?.includes(user._id) && (
                    <span className="bg-blue-500 h-2 w-2 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default isAuth(SellerPendingOrders);
