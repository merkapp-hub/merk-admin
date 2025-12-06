import { Api } from "@/services/service";
import React, { useEffect, useState } from "react";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInMs = now - reviewDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return 'Just now';
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        index < rating ? (
          <IoMdStar key={index} className="text-yellow-400 text-lg" />
        ) : (
          <IoMdStarOutline key={index} className="text-gray-400 text-lg" />
        )
      ));
  };

  const getAllReviews = async (page = 1, dateFilter = "") => {
    setLoading(true);
    try {
      let endpoint = `getAllReviews?page=${page}&limit=10`; // Changed to 10 per page
      if (dateFilter) {
        endpoint += `&date=${dateFilter}`;
      }

      const res = await Api("get", endpoint, "", null);
      console.log('+++', res);
      
      if (res.status && res.data) {
        setReviews(res.data.reviews || []);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      console.log("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllReviews(currentPage, filterDate);
  }, [currentPage, filterDate]);

  const handleDateFilterChange = (e) => {
    setFilterDate(e.target.value);
    setCurrentPage(1); 
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Clear date filter function
  const clearDateFilter = () => {
    setFilterDate("");
    setCurrentPage(1);
  };

  return (
    <div className="m-10 relative z-10">
      <h1 className="text-lg sm:text-xl md:text-2xl my-5 text-black font-semibold">
        Reviews {pagination.totalReviews && `(${pagination.totalReviews})`}
      </h1>
      
      {/* Filter Section */}
      <div className="bg-white border border-gray-300 w-full md:h-[70px] rounded-[10px] md:py-0 py-5">
        <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full">
         
          <div className="flex md:justify-center justify-start items-center md:border-r md:border-gray-300 md:px-0 px-5 md:pt-0 pt-5 md:pb-0 pb-3">
            <p className="text-black text-sm font-bold">Filter By</p>
          </div>
          <div className="col-span-8 flex justify-start items-center">
            <p className="text-black font-semibold text-sm pl-3">Date</p>
            <input
              className="px-3 py-1 border ml-3 text-black rounded"
              type="date"
              value={filterDate}
              onChange={handleDateFilterChange}
              placeholder="Date"
            />
            {filterDate && (
              <button
                onClick={clearDateFilter}
                className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Show filter status */}
      {filterDate && (
        <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
          Showing reviews for: {new Date(filterDate).toLocaleDateString()}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Reviews List */}
      {!loading && (
        <div className="overflow-y-scroll max-h-[400px] md:max-h-[500px] mt-5 scrollbar-hide md:pb-10 pb-5">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="mb-5">
                <div className="flex justify-between items-center mb-3 md:w-[90%] w-full">
                  <div className="flex flex-col">
                    <p className="text-sm text-custom-blue font-semibold">
                      {getTimeAgo(review.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {review.posted_by?.firstName} {review.posted_by?.lastName}
                    </p>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <div className="border w-full md:w-[90%] border-t-8 border-t-purple-200 rounded-md py-5 px-5 bg-white shadow-sm">
                  <p className="text-black mb-3">{review.description}</p>
                  {review.product && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <p>Product: <span className="font-medium">{review.product.name}</span></p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {filterDate ? 'No reviews found for selected date' : 'No reviews found'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-3 py-1">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Reviews;