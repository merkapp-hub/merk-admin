import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import { Drawer } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import currencySign from "@/utils/currencySign";
import { RxCrossCircled } from "react-icons/rx";
import { userContext } from "./_app";
import Swal from 'sweetalert2';

function ReturnedOrders(props) {
  const router = useRouter();
  const [userRquestList, setUserRquestList] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [returnOrders] = useState(true);
  const [popupData, setPopupData] = useState({});
  const [openCart, setOpenCart] = useState(false);
  const [cartData, setCartData] = useState({});
  const [selctDate, setSelctDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const closeDrawer = async () => {
    setOpenCart(false);
    setCartData({});
    setPopupData({
      assignedEmployee: "",
      orderId: "",
    });
    setviewPopup(false);
  };

  useEffect(() => {
    getOrderBySeller(null, currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log(popupData);
  }, [popupData]);

  const getOrderBySeller = async (selctedDate, page = 1, limit = 10) => {
    const data = {};

    if (selctedDate) {
      data.curentDate = moment(new Date(selctedDate)).format();
    }

    if (returnOrders) {
      data.returnOrders = returnOrders;
    }

    props.loader(true);

    Api(
      "post",
      `getSellerReturnOrderByAdmin?page=${page}&limit=${limit}`,
      data,
      router
    ).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setUserRquestList(res?.data);
        setPagination(res?.pagination);
        setCurrentPage(res?.pagination?.currentPage);
        console.log(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const sendReturnNotificationToSeller = async (orderId) => {
    props.loader(true);
    let data = {
      orderId: orderId,
    };
    Api("post", "send-return-notification-to-seller", data, router).then(
      (res) => {
        props.loader(false);
        props.toaster({ type: "success", message: res?.message });
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const confirmReturnOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Confirm Return Order',
      text: 'Are you sure you want to mark this order as returned?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E58F14',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Return Order',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      props.loader(true);
      let data = {
        orderId: orderId,
        status: 'Returned'
      };
      
      Api("post", "update-return-order-status", data, router).then(
        (res) => {
          props.loader(false);
          props.toaster({ type: "success", message: "Order marked as returned successfully" });
          setviewPopup(false);
          getOrderBySeller(null, currentPage); // Refresh the list
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.message || "Failed to update order status" });
        }
      );
    }
  };

  // console.log("order seller ::", userRquestList);

  function indexID({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function orderId({ value }) {
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
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function email({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
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

  function returndate({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
          {moment(value).format("DD MMM YYYY")}
        </p>
      </div>
    );
  }

  const info = ({ value, row }) => {
    //console.log(row.original._id)
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px]"
          onClick={() => {
            // setOpenCart(true);
            // setCartData(row.original);
            setviewPopup(true);
            setPopupData((prev) => ({
              orderId: row.original._id,
              productDetail: row.original.productDetail,
              productId: row.original.productId,
              shipping_address: row.original.shipping_address,
              seller_id: row.original.seller_id,
              returnReason: row.original.returnReason,
              returnRequestDate: row.original.returnRequestDate || row.original.returndate,
              // Add order-level data for fallback
              orderData: row.original
            }));
          }}
        >
          See
        </button>
        
        <button
          className="h-[38px] w-[100px] bg-green-600 hover:bg-green-700 text-white text-sm font-normal rounded-[8px]"
          onClick={() => {
            confirmReturnOrder(row.original._id);
          }}
        >
          Return Order
        </button>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "indexNo",
        Cell: indexID,
      },
      {
        Header: "ORDER ID",
        accessor: row => row.orderId || row._id,
        Cell: orderId,
      },
      {
        Header: "CUSTOMER NAME",
        accessor: "user.username",
        Cell: email,
      },
      {
        Header: "SELLER NAME",
        accessor: "seller_id.username",
        Cell: name,
      },
      {
        Header: "ORDER DATE",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "RETURN DATE",
        accessor: "returndate",
        Cell: returndate,
      },
      // {
      //   Header: "STATUS",
      //   accessor: "status",
      //   Cell: status,
      // },
      {
        Header: "Actions",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );

  return (
    <section  className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
      <p className="text-gray-800 font-bold  md:text-[32px] text-2xl">
        Returned Orders
      </p>
      {/* pl-2 */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {/* md:mt-9 */}
        {/* shadow-2xl  */}

        {/* <div className="flex items-center md:mb-5 mb-5 gap-2">
          <h1 className="text-gray-800 font-bold text-lg md:text-2xl">
            Refunded Amount:{" "}
          </h1>
          <p className="text-gray-800 font-bold text-lg md:text-2xl">
            0
          </p>
        </div> */}

        <div className="bg-white border border-custom-lightGrayColor w-full md:h-[70px] rounded-[10px] md:py-0 py-5 md:px-0 px-5">
          <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full ">
            <div className="cursor-pointer flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor">
              <img className="w-[20px] h-[23px]" src="/filterImg.png" />
            </div>
            <div className="flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:pt-0 pt-5 md:pb-0 pb-3">
              <p className="text-gray-800 text-sm	font-bold">Filter By</p>
            </div>
            <div className="col-span-8 flex md:flex-row flex-col md:justify-between justify-start md:items-center items-start">
              <div className="flex items-center">
                <p className="text-gray-800 font-semibold text-sm md:pl-3">
                  Date
                </p>
                <input
                  className="text-gray-800 ml-3"
                  type="date"
                  placeholder="Date"
                  value={selctDate}
                  max={moment(new Date()).format("YYYY-MM-DD")}
                  onChange={(e) => {
                    setSelctDate(e.target.value);
                    getOrderBySeller(e.target.value);
                  }}
                />
              </div>
              <button
                className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px] md:mr-5 md:mt-0 mt-5"
                onClick={() => {
                  getOrderBySeller();
                  setSelctDate("");
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <Drawer
          className=""
          open={openCart}
          onClose={closeDrawer}
          anchor={"right"}
        >
          <div className="w-[310px] relative cursor-pointer">
            <div className="w-full p-5">
              <div className="!z-50 top-0 w-full border-b border-[#00000050]">
                <div className="flex justify-between cursor-pointer items-center pb-5 w-full">
                  <p className="text-black text-base font-normal"></p>
                  {/* Items • {CartItem} */}
                  <IoCloseCircleOutline
                    className="text-black w-5 h-5"
                    onClick={closeDrawer}
                  />
                </div>
              </div>

              {cartData?.productDetail?.map((item, i) => (
                <div
                  className="w-full"
                  key={i}
                  onClick={() => {
                    router.push(
                      `/orders-details/${cartData?._id}?product_id=${cartData?.productDetail[0]?._id}`
                    );
                  }}
                >
                  <div className="grid grid-cols-4 w-full gap-2 py-5">
                    <div className="flex justify-center items-center">
                      <img
                        className="w-[50px] h-[50px] object-contain"
                        src={item?.image[0]}
                      />
                    </div>
                    <div className="col-span-2 w-full">
                      <p className="text-black text-xs font-normal">
                        {item?.product?.name}
                      </p>
                      {item?.color && (
                        <div className="flex justify-start items-center gap-1 pt-1">
                          <p className="text-[#1A1A1A70] text-xs font-normal mr-2">
                            Colour:
                          </p>
                          <p
                            className="md:w-[10px] w-[10px] md:h-[10px] h-[10px] rounded-full flex justify-center items-center border border-black"
                            style={{ background: item?.color }}
                          ></p>
                        </div>
                      )}
                      <div className="flex justify-start items-center gap-1">
                        <p className="text-[#1A1A1A70] text-xs font-normal mr-2">
                          Quantaty:
                        </p>
                        <p className="text-black text-base font-normal">
                          {item?.qty}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-start items-end">
                      <p className="text-black text-xs font-normal pt-5">
                        {currencySign(item?.total ?? item?.price ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-5 !w-[270px] !z-50 fixed bottom-0  flex flex-col justify-start">
                <div className="flex justify-between border-t border-gray-300 text-lg font-bold items-center mb-5 pt-2 cursor-pointer">
                  <p className="text-black text-base font-semibold">Total:</p>
                  <p className="text-black text-base font-normal">
                    {currencySign(cartData?.total)}
                  </p>
                </div>

                {/* {!cartData?.assignedEmployee && (
                  <button
                    onClick={() => {
                      setviewPopup(true);
                      setPopupData((prev) => ({
                        ...prev,
                        orderId: cartData?._id,
                      }));
                    }}
                    className="bg-custom-darkpurple !w-[270px] h-[50px] rounded-[60px] text-white text-lg font-bold flex justify-center items-center mb-5"
                  >
                    Assign Employee
                  </button>
                )} */}
              </div>
            </div>
          </div>
        </Drawer>

        {viewPopup && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center z-[9999] p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Return Order Details</h2>
                  <button
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    onClick={() => {
                      setviewPopup(false);
                      setPopupData({});
                      setOpenIndex(null);
                    }}
                  >
                    <RxCrossCircled className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium text-gray-800">{popupData?.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Return Date</p>
                      <p className="font-medium text-gray-800">
                        {popupData?.returnRequestDate ? 
                          moment(popupData?.returnRequestDate).format("DD MMM YYYY, hh:mm A") :
                          'Date not available'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Returned Products</h3>
                  
                  {popupData?.productDetail?.length > 0 ? (
                    <div className="space-y-4">
                      {popupData.productDetail.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Product Header */}
                          <div 
                            className="bg-white p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleAccordion(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <img 
                                  src={item?.image?.[0] || '/placeholder-image.png'} 
                                  alt={item?.product?.name || 'Product'}
                                  className="w-16 h-16 object-cover rounded-lg border"
                                />
                                <div>
                                  <h4 className="font-semibold text-gray-800 text-lg">
                                    {item?.product?.name || 'Product Name Not Available'}
                                  </h4>
                                  <p className="text-purple-600 font-medium">
                                    {currencySign(item?.total ?? item?.price ?? 0)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item?.qty || 1}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  item?.returnDetails?.returnStatus === 'Refunded' 
                                    ? 'bg-green-100 text-green-800'
                                    : item?.returnDetails?.returnStatus === 'Approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item?.returnDetails?.returnStatus === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {item?.returnDetails?.returnStatus || 'Return Requested'}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                    openIndex === index ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Product Details (Expandable) */}
                          {openIndex === index && (
                            <div className="bg-gray-50 border-t border-gray-200 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-semibold text-gray-700 mb-2">Return Reason</h5>
                                  <p className="text-gray-600 bg-white p-3 rounded border">
                                    {item?.returnDetails?.reason || 
                                     popupData?.returnReason || 
                                     'No reason provided'}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-700 mb-2">Return Date & Time</h5>
                                  <p className="text-gray-600 bg-white p-3 rounded border">
                                    {item?.returnDetails?.returnRequestDate ? 
                                      moment(item?.returnDetails?.returnRequestDate).format("DD MMM YYYY, hh:mm:ss A") :
                                      popupData?.returnRequestDate ? 
                                        moment(popupData?.returnRequestDate).format("DD MMM YYYY, hh:mm:ss A") :
                                        'Date not available'
                                    }
                                  </p>
                                </div>
                              </div>
                              
                              {item?.color && (
                                <div className="mt-4">
                                  <h5 className="font-semibold text-gray-700 mb-2">Product Color</h5>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                                      style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-gray-600 capitalize">{item.color}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No product details available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      sendReturnNotificationToSeller(popupData?.orderId);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send Seller Notification</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      confirmReturnOrder(popupData?.orderId);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirm Return</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="">
          <Table
            columns={columns}
            data={userRquestList}
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={currentPage}
            itemsPerPage={pagination.itemsPerPage}
          />
        </div>
      </section>
    </section>
  );
}

export default isAuth(ReturnedOrders);
