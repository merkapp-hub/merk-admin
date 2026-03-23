import React, { useMemo, useState, useEffect } from 'react'
import Table, { indexID } from '@/components/table'
import { Api } from '@/services/service';
import { useRouter } from 'next/router'
import moment from 'moment';
import { RxCrossCircled } from 'react-icons/rx'
import { FaEye, FaSearch, FaShoppingBag } from 'react-icons/fa'
import isAuth from '@/components/isAuth';

function Users(props) {
    const router = useRouter()
    const [usersData, setUsersData] = useState([]);
    const [viewPopup, setViewPopup] = useState(false)
    const [popupData, setPopupData] = useState({});
    const [ordersPopup, setOrdersPopup] = useState(false)
    const [selectedUserOrders, setSelectedUserOrders] = useState([]);
    const [userStats, setUserStats] = useState({ totalUsers: 0 });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        getUsersList()
        getUserStats()
    }, [])

    const getUsersList = async (page = 1, search = '', startDate = '', endDate = '') => {
        setLoading(true);
        props.loader(true);
        let url = `users?page=${page}&limit=${pageSize}&search=${search}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        
        Api("get", url, "", router).then(
            (res) => {
                props.loader(false);
                setLoading(false);
                console.log("Users API Response:", res);
                if (res.data && res.data.users) {
                    console.log("Users data structure:", res.data.users);
                    console.log("First user:", res.data.users[0]);
                    setUsersData(res.data.users);
                    setPagination(res.data.pagination);
                } else {
                    console.log("No users data found in response");
                    setUsersData([]);
                }
            },
            (err) => {
                props.loader(false);
                setLoading(false);
                console.log("Users API Error:", err);
                setUsersData([]);
                props.toaster({ type: "error", message: err?.message || "Failed to fetch users" });
            }
        );
    };

    const getUserStats = async () => {
        Api("get", "users/stats", "", router).then(
            (res) => {
                console.log("Stats API Response:", res);
                if (res.data) {
                    setUserStats(res.data);
                }
            },
            (err) => {
                console.log("Stats API Error:", err);
                setUserStats({ totalUsers: 0 });
            }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        getUsersList(1, searchTerm, dateFilter.startDate, dateFilter.endDate);
    };

    const handlePageChange = (newPage) => {
        getUsersList(newPage, searchTerm, dateFilter.startDate, dateFilter.endDate);
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        getUsersList(1, searchTerm, dateFilter.startDate, dateFilter.endDate);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter({ startDate: '', endDate: '' });
        getUsersList(1, '', '', '');
    };

    const viewUserDetails = async (userId) => {
        props.loader(true);
        Api("get", `users/${userId}`, "", router).then(
            (res) => {
                props.loader(false);
                setPopupData(res.data);
                setViewPopup(true);
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const viewUserOrders = async (userId) => {
        props.loader(true);
        Api("get", `users/${userId}`, "", router).then(
            (res) => {
                props.loader(false);
                setSelectedUserOrders(res.data.orderStats?.orders || []);
                setOrdersPopup(true);
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    function name({ value, row }) {
        return (
            <div>
                <p className='text-gray-800 text-base font-normal text-center'>{value}</p>
            </div>
        )
    }

    function email({ value }) {
        return (
            <div>
                <p className='text-gray-800 text-base font-normal text-left'>{value}</p>
            </div>
        )
    }

    function phone({ value }) {
        return (
            <div>
                <p className='text-gray-800 text-base font-normal text-center'>{value || 'N/A'}</p>
            </div>
        )
    }

    function joinDate({ value }) {
        return (
            <div>
                <p className='text-gray-800 text-base font-normal text-left'>{moment(value).format('DD/MM/YYYY')}</p>
            </div>
        )
    }

    function status({ value }) {
        return (
            <div className='text-left'>
                <span className={`px-2 py-1 rounded text-xs ${value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {value}
                </span>
            </div>
        )
    }

    function role({ value }) {
        return (
            <div className='text-left'>
                <span className={`px-2 py-1 rounded text-xs ${
                    value === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {value === 'seller' ? 'Seller' : 'Customer'}
                </span>
            </div>
        )
    }

    function actions({ row }) {
        console.log('Actions row data:', row);
        console.log('Original data:', row.original);
        return (
            <div className='flex justify-start gap-2'>
                <button 
                    onClick={() => {
                        const userId = row.original._id;
                        console.log('Clicking view for user ID:', userId);
                        if (userId) {
                            viewUserDetails(userId);
                        } else {
                            console.error('No user ID found in row.original:', row.original);
                            props.toaster({ type: "error", message: "User ID not found" });
                        }
                    }}
                    className='text-blue-600 hover:text-blue-800 p-1'
                    title="View Details"
                >
                    <FaEye size={16} />
                </button>
                <button 
                    onClick={() => {
                        const userId = row.original._id;
                        if (userId) {
                            viewUserOrders(userId);
                        } else {
                            props.toaster({ type: "error", message: "User ID not found" });
                        }
                    }}
                    className='text-[#12344D] hover:text-[#0f2a3a] p-1'
                    title="View Orders"
                >
                    <FaShoppingBag size={16} />
                </button>
            </div>
        )
    }

    const columns = useMemo(
        () => [
            {
                Header: 'S.No',
                accessor: (row, index) => index + 1 + ((pagination.currentPage - 1) * pageSize),
                disableSortBy: true,
                Cell: ({ value }) => (
                    <div className='text-center'>
                        <p className='text-gray-800 text-base font-normal'>{value}</p>
                    </div>
                )
            },
            {
                Header: 'Name',
                accessor: (row) => `${row.firstName} ${row.lastName}`,
                Cell: name,
            },
            {
                Header: () => (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        Email
                    </div>
                ),
                accessor: 'email',
                Cell: email,
            },
            {
                Header: () => (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        Join Date
                    </div>
                ),
                accessor: 'createdAt',
                Cell: joinDate,
            },
            {
                Header: () => (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        Role
                    </div>
                ),
                accessor: 'role',
                Cell: role,
            },
            {
                Header: () => (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        Status
                    </div>
                ),
                accessor: 'status',
                Cell: status,
            },
            {
                Header: () => (
                    <div style={{ textAlign: 'left', width: '100%' }}>
                        Actions
                    </div>
                ),
                accessor: 'actions',
                Cell: actions,
                disableSortBy: true,
            },
        ],
        [pagination.currentPage, pageSize]
    );

    return (
        <div className='w-full'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-bold text-gray-800'>Users & Sellers Management</h1>
                <div className='flex gap-4'>
                    <div className='bg-blue-100 p-4 rounded-lg'>
                        <p className='text-sm text-blue-600'>Total Users & Sellers</p>
                        <p className='text-2xl font-bold text-blue-800'>{userStats.totalUsers || 0}</p>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-lg shadow p-4 mb-4'>
                <form onSubmit={handleSearch} className='flex gap-4 items-center flex-wrap'>
                    <div className='flex-1 min-w-[200px]'>
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                    
                    <div className='flex gap-2 items-center'>
                        <input
                            type="date"
                            placeholder="Start Date"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                            className='px-3 text-gray-700 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <span className='text-gray-500'>to</span>
                        <input
                            type="date"
                            placeholder="End Date"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                            className='px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
                    >
                        <FaSearch />
                        Search
                    </button>
                    
                    {(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className='px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600'
                        >
                            Clear All
                        </button>
                    )}
                </form>
            </div>

            <div className='bg-white rounded-lg shadow'>
                <Table 
                    columns={columns} 
                    data={usersData || []} 
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    currentPage={pagination.currentPage}
                    setCurrentPage={handlePageChange}
                    pageSize={pageSize}
                    setPageSize={handlePageSizeChange}
                    itemsPerPage={pageSize}
                />
            </div>

            {viewPopup && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[10000]'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-bold'>User Details</h2>
                            <button 
                                onClick={() => setViewPopup(false)}
                                className='text-gray-500 hover:text-gray-700'
                            >
                                <RxCrossCircled size={24} />
                            </button>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>Personal Information</h3>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Name</label>
                                    <p className='text-gray-800'>{popupData.firstName} {popupData.lastName}</p>
                                </div>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Email</label>
                                    <p className='text-gray-800'>{popupData.email}</p>
                                </div>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Phone</label>
                                    <p className='text-gray-800'>{popupData.mobile || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Join Date</label>
                                    <p className='text-gray-800'>{moment(popupData.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                                </div>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Status</label>
                                    <p className='text-gray-800'>{popupData.status}</p>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>Order Statistics</h3>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Total Orders</label>
                                    <p className='text-gray-800 text-xl font-bold'>{popupData.orderStats?.totalOrders || 0}</p>
                                </div>
                                <div>
                                    <label className='text-sm font-medium text-gray-600'>Total Spent</label>
                                    <p className='text-gray-800 text-xl font-bold'>${popupData.orderStats?.totalSpent || 0}</p>
                                </div>
                            </div>
                        </div>

                        {popupData.shiping_address && (
                            <div className='mt-6'>
                                <h3 className='text-lg font-semibold text-gray-800 border-b pb-2 mb-4'>Shipping Address</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='text-sm font-medium text-gray-600'>Address</label>
                                        <p className='text-gray-800'>{popupData.shiping_address.address}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-600'>City</label>
                                        <p className='text-gray-800'>{popupData.shiping_address.city}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-600'>State</label>
                                        <p className='text-gray-800'>{popupData.shiping_address.state?.label}</p>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-600'>Country</label>
                                        <p className='text-gray-800'>{popupData.shiping_address.country?.label}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {ordersPopup && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[10000]'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-bold'>User Orders ({selectedUserOrders.length})</h2>
                            <button 
                                onClick={() => setOrdersPopup(false)}
                                className='text-gray-500 hover:text-gray-700'
                            >
                                <RxCrossCircled size={24} />
                            </button>
                        </div>

                        {selectedUserOrders.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <table className='min-w-full table-auto'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Order ID</th>
                                            <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Date</th>
                                            <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Products</th>
                                            <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Amount</th>
                                            <th className='px-4 py-2 text-left text-sm font-medium text-gray-600'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedUserOrders.map((order, index) => (
                                            <tr key={index} className='border-b'>
                                                <td className='px-4 py-2 text-sm text-gray-800'>{order.orderId || order._id}</td>
                                                <td className='px-4 py-2 text-sm text-gray-800'>{moment(order.createdAt).format('DD/MM/YYYY')}</td>
                                                <td className='px-4 py-2 text-sm text-gray-800'>
                                                    <div className='space-y-1'>
                                                        {order.productDetail?.map((product, idx) => (
                                                            <div key={idx} className='flex items-center gap-2'>
                                                                <img 
                                                                    src={product.image?.[0] || '/default-product.png'} 
                                                                    alt="Product" 
                                                                    className='w-8 h-8 object-cover rounded'
                                                                />
                                                                <span className='text-xs'>
                                                                    {product.product?.name || 'Product'} (Qty: {product.qty || 1})
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className='px-4 py-2 text-sm text-gray-800 font-semibold'>
                                                    ${order.finalAmount || order.total || 0}
                                                </td>
                                                <td className='px-4 py-2 text-sm'>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className='text-center py-8'>
                                <p className='text-gray-500'>No orders found for this user</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default isAuth(Users)