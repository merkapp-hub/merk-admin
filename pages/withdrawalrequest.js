import React, { useMemo, useState, useEffect } from "react";
import Table, { indexID } from "@/components/table";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import isAuth from "@/components/isAuth";
import { Dialog, Drawer } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import ActivityList from "@/components/activityList";
import currencySign from "@/utils/currencySign";
import { MdKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

function Withdralreq(props) {
  const router = useRouter();
  const [withdrawData, setWithdrawData] = useState([]);
  const [sellerid, setsellerid] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [viewPopup, setViewPopup] = useState(false);
  const [viewPopupData, setViewPopupData] = useState({});
  const [popupLimit, setPopupLimit] = useState(10);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    GetPendingWithdrawreq(currentPage);
  }, [currentPage]);

  useEffect(() => {
    GetPendingWithdrawreq(1); // Reset to first page when filter changes
  }, [statusFilter]);

  const GetPendingWithdrawreq = async (page = 1, limit = pagination.itemsPerPage) => {
    props.loader(true);
    try {
      // Build the query string with filters
      let query = `page=${page}&limit=${limit}&populate=request_by`;
      if (statusFilter !== 'all') {
        query += `&status=${statusFilter}`;
      }
      
      const res = await Api("get", `getWithdrawreq?${query}`, "", router);
      
      const dataWithIndex = res?.data?.map((item, index) => ({
        ...item,
        index: (page - 1) * limit + index + 1,
      }));
      
      setWithdrawData(dataWithIndex || []);
      setPagination(prev => ({
        ...prev,
        totalPages: res?.pagination?.totalPages || 1,
        currentPage: res?.pagination?.currentPage || 1,
        itemsPerPage: limit,
        totalItems: res?.pagination?.totalItems || 0
      }));
      
    } catch (err) {
      console.error("Error fetching withdrawal requests:", err);
      props.toaster({ 
        type: "error", 
        message: err?.response?.data?.message || "Failed to load withdrawal requests" 
      });
    } finally {
      props.loader(false);
    }
  };
  
  const approvereq = (id, sellerid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to approve this payment?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonText: "Approve",
      confirmButtonColor: "#28a745",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          props.loader(true);
          const response = await Api("post", "updateWithdrawreq", {
            id,
            seller_id: sellerid,
          }, router);

          if (response?.status === true) {
            // Show success message
            props.toaster({ 
              type: "success", 
              message: "Withdrawal request approved successfully!" 
            });
            
            // Refresh the withdrawal requests list
            await GetPendingWithdrawreq(currentPage);
          } else {
            throw new Error(response?.message || 'Failed to approve withdrawal request');
          }
        } catch (error) {
          console.error("Error approving withdrawal:", error);
          props.toaster({ 
            type: "error", 
            message: error?.response?.data?.message || error.message || "Failed to approve withdrawal request" 
          });
        } finally {
          props.loader(false);
        }
      }
    });
  };

  function indexID({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function name({ value }) {
    return (
      <div className="min-w-[120px]">
        <p className="text-gray-800 text-base font-normal text-center truncate" title={value}>
          {value || '-'}
        </p>
      </div>
    );
  }
  function note({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center whitespace-normal">
          {value}
        </p>
      </div>
    );
  }

  function date({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
          {moment(value).format("DD MMM YYYY")}
        </p>
      </div>
    );
  }

  function mobile({ value }) {
    return (
      <div className="min-w-[100px]">
        <p className="text-gray-800 text-base font-normal text-center">
          {value || '-'}
        </p>
      </div>
    );
  }

  function status({ value }) {
    return (
      <div>
        <p
          className={`text-gray-800 text-base font-normal text-center 
                     ${value == "Verified" ? "text-green-500" : ""}
                     ${value == "Suspend" ? "text-red-500" : ""}
                     ${value == "Pending" ? "text-yellow-500" : ""}
                     `}
        >
          {value}
        </p>
      </div>
    );
  }

  const viewWithdrawalDetails = async (data) => {
    if (!data.request_by?._id) {
      props.toaster({ type: "error", message: "Seller information not available" });
      return;
    }
    
    props.loader(true);
    try {
      const res = await Api("get", `getWithdrawreqbyseller/${data.request_by._id}`, "", router);
      
      if (res?.status !== true) {
        throw new Error(res?.message || 'Failed to load withdrawal details');
      }
      
      // Ensure we have an array of history items
      const history = Array.isArray(res.data) ? res.data : [];
      
      setViewPopupData({
        ...data,
        history: history
      });
      setViewPopup(true);
    } catch (err) {
      console.error("Error in viewWithdrawalDetails:", err);
      props.toaster({ 
        type: "error", 
        message: err?.response?.data?.message || err.message || "Failed to load withdrawal details" 
      });
    } finally {
      props.loader(false);
    }
  };

  const info = ({ value, row }) => {
    const isApprovedOrRejected = ['Completed', 'Rejected'].includes(row.original.settle);
    
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          className="h-[38px] px-4 bg-blue-500 text-white text-sm font-normal rounded-[8px] flex items-center"
          onClick={() => viewWithdrawalDetails(row.original)}
        >
          View
        </button>
        {!isApprovedOrRejected && (
          <button
            className="h-[38px] px-4 bg-green-500 text-white text-sm font-normal rounded-[8px]"
            onClick={() => {
              approvereq(row.original._id, row.original.request_by?._id);
            }}
          >
            Approve
          </button>
        )}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        // accessor: "_id",
        accessor: "index",
        Cell: indexID,
      },
      {
        Header: "Seller Name",
        accessor: "seller_name",
        Cell: ({ row }) => {
          const seller = row.original.request_by;
          const sellerName = seller?.firstName && seller?.lastName 
            ? `${seller.firstName} ${seller.lastName}`.trim()
            : seller?.name || seller?.username || 'N/A';
          return name({ value: sellerName });
        },
      },
      {
        Header: "Mobile",
        accessor: "seller_mobile",
        Cell: ({ row }) => {
          const seller = row.original.request_by;
          const mobileNumber = seller?.number || seller?.mobile || 'N/A';
          return mobile({ value: mobileNumber });
        },
      },
      {
        Header: "Status",
        accessor: "settle",
        Cell: status,
      },
      {
        Header: "Note",
        accessor: "note",
        Cell: note,
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: mobile,
      },
      {
        Header: "Info",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );

  return (
    <section className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Seller Withdrawal Request</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                style={{
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem top 50%',
                  backgroundSize: '0.65rem auto',
                }}
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={withdrawData}
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              itemsPerPage={pagination.itemsPerPage}
              setPageSize={(size) => {
                setPagination(prev => ({ ...prev, itemsPerPage: size }));
                GetPendingWithdrawreq(1, size);
              }}
              className="min-w-full"
            />
          </div>
          {/* Pagination controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage >= pagination.totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems || 0)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalItems || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">First</span>
                      <MdOutlineKeyboardDoubleArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <MdKeyboardArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {pagination.totalPages || 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= (pagination.totalPages || 1)}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <MdOutlineKeyboardArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(pagination.totalPages || 1)}
                      disabled={currentPage >= (pagination.totalPages || 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Last</span>
                      <MdOutlineKeyboardDoubleArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* View Popup */}
      <Dialog
        open={viewPopup}
        onClose={() => setViewPopup(false)}
        maxWidth="md"
        fullWidth
      >
        <div className="bg-white p-6 rounded-lg relative">
          <button
            onClick={() => setViewPopup(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <IoCloseCircleOutline size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-6">Withdrawal Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {viewPopupData.request_by?.username || '-'}</p>
                <p><span className="font-medium">Mobile:</span> {viewPopupData.request_by?.number || '-'}</p>
                <p><span className="font-medium">Email:</span> {viewPopupData.request_by?.email || '-'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Withdrawal Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Amount:</span> {currencySign(viewPopupData.amount || 0)}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 ${
                    viewPopupData.settle === 'Approved' ? 'text-green-500' : 
                    viewPopupData.settle === 'Rejected' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {viewPopupData.settle || 'Pending'}
                  </span>
                </p>
                <p><span className="font-medium">Request Date:</span> {moment(viewPopupData.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
              </div>
            </div>
          </div>
          
          {viewPopupData.note && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Note</h3>
              <p className="bg-gray-50 p-3 rounded">{viewPopupData.note}</p>
            </div>
          )}
          
          {viewPopupData.history?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
              <div className="space-y-3">
                {viewPopupData.history.map((item, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {item.type === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                      <span className={item.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                        {item.type === 'credit' ? '+' : '-'}{currencySign(item.amount || 0)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {moment(item.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </div>
                    {item.note && (
                      <div className="text-sm text-gray-600 mt-1">
                        Note: {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </section>
  );
}

export default isAuth(Withdralreq);
