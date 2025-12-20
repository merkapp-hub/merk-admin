import { Api } from "@/services/service";
import { useEffect, useState } from "react"
import { Search, Eye, Calendar, Filter, ChevronLeft, ChevronRight, User, Mail, Phone, MessageSquare } from 'lucide-react';;

const CustomerQueries = () => {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    name: '',
    email: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    data: null
  });

   const fetchQueries = async (selectedDate, page = 1, limit = 20) => {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    if (selectedDate) {
      params.append('curDate', new Date(selectedDate).toISOString());
    }

    if (searchParams.name && searchParams.name.trim()) {
      params.append('name', searchParams.name.trim());
    }

    if (searchParams.email && searchParams.email.trim()) {
      params.append('email', searchParams.email.trim());
    }

    console.log('Fetching queries with params:', params.toString());
    setIsLoading(true);

    try {
      const res = await Api("get", `contacts?${params.toString()}`, null, null);

      setIsLoading(false);

      console.log('Queries response:', res);

      if (res?.status) {
        setQueries(res?.data || []);
        setPagination(res?.pagination);
        setCurrentPage(res?.pagination?.currentPage || page);
      } else {
        console.error("Failed to fetch queries:", res);
        setQueries([]);
      }
    } catch (err) {
      setIsLoading(false);
      console.error("An error occurred:", err);
      setQueries([]);
    }
  };

  useEffect(() => {
    fetchQueries(selectedDate, currentPage);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQueries(selectedDate, 1);
  };

  const handleReset = () => {
    setSearchParams({ name: '', email: '' });
    setSelectedDate('');
    setCurrentPage(1);
    fetchQueries('', 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchQueries(selectedDate, page);
  };

  const handleViewDetails = (query) => {
    setViewModal({
      isOpen: true,
      data: query
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Queries</h1>
        
        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-700">Search & Filter</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchParams.name}
                  onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}
                  className="w-full pl-10 pr-3 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Search by Email"
                  value={searchParams.email}
                  onChange={(e) => setSearchParams({...searchParams, email: e.target.value})}
                  className="w-full pl-10 pr-3 text-gray-900 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-500">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : queries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No queries found
                    </td>
                  </tr>
                ) : (
                 queries.map((query, index) => (
  <tr key={query._id} className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {query._id ? query._id.slice(-6) : (currentPage - 1) * (pagination?.limit || 10) + index + 1}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {query.name}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {query.email}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {formatDate(query.createdAt)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      <button
        onClick={() => handleViewDetails(query)}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <Eye className="w-4 h-4 mr-1" />
        View
      </button>
    </td>
  </tr>
))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
         {(pagination?.totalPages || 0) > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                   <span className="font-medium">{(currentPage - 1) * (pagination?.limit || 10) + 1}</span>
{' '}to{' '}
<span className="font-medium">
  {Math.min(currentPage * (pagination?.limit || 10), pagination?.totalItems || 0)}
</span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.totalItems}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Query Details</h3>
                <button
                  onClick={() => setViewModal({ isOpen: false, data: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{viewModal.data?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{viewModal.data?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{viewModal.data?.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date & Time</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(viewModal.data?.createdAt)} at {formatTime(viewModal.data?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {viewModal.data?.message || 'No message provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewModal({ isOpen: false, data: null })}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerQueries;