import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import { Drawer, Typography, IconButton, Button, Modal } from "@mui/material";
import {
  IoAddSharp,
  IoCloseCircleOutline,
  IoList,
  IoRemoveSharp,
} from "react-icons/io5";
import currencySign from "@/utils/currencySign";
import { RxCrossCircled } from "react-icons/rx";
import { userContext } from "../_app";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Barcode from "react-barcode";

function ReturnedOrders(props) {
  const router = useRouter();
  const [userRquestList, setUserRquestList] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [returnOrders, setReturnOrders] = useState(true);
  const [popupData, setPopupData] = useState({});
  const [openCart, setOpenCart] = useState(false);
  const [CartItem, setCartItem] = useState(0);
  const [user, setUser] = useContext(userContext);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [cartData, setCartData] = useState({});
  const [totalRefundedAmount, setTotalRefundedAmount] = useState(0);
  const [selctDate, setSelctDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [searchSeller, setSearchSeller] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default limit
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: pageSize,
  });
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
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
    getOrderBySeller(null, currentPage,pageSize);
  }, [currentPage.pageSize]);

  useEffect(() => {
    console.log(popupData);
  }, [popupData]);

  const getOrderBySeller = async (
    selctedDate,
    page = 1,
    limit = 10,
    seller,
    customer
  ) => {
    const data = {};

    if (selctedDate) {
      data.curentDate = moment(new Date(selctedDate)).format();
    }

    if (returnOrders) {
      data.returnOrders = returnOrders;
    }

    if (seller) {
      data.sellerName = seller;
    }
    if (customer) {
      data.customerName = customer;
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
        setPagination({
          ...res?.pagination,
          itemsPerPage: pageSize, // force override to match dropdown
        });
        // setCurrentPage(res?.pagination?.currentPage);
        console.log(res?.pagination);
        let totalRefundedAmount = 0;

        res.data.forEach((order) => {
          order.productDetail.forEach((item) => {
            if (
              item.returnDetails?.isRefunded &&
              item.returnDetails.refundAmount
            ) {
              totalRefundedAmount += item.returnDetails.refundAmount;
            }
            // If calculate based on item price and quantity
            // if (item.returnDetails?.isRefunded && item.price && item.quantity) {
            //   totalRefundedAmount += item.price * item.quantity;
            // }
          });
        });
        setTotalRefundedAmount(totalRefundedAmount.toFixed(2));
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  //   useEffect(() => {
  //     if (user?._id) {
  //       getEmployee(currentPage);
  //     }
  //   }, [user]);

  //   const getEmployee = async () => {
  //     props.loader(true);
  //     let url;
  //     if (user?.type === "SELLER") {
  //       url = `getEmployee?all=true`;
  //     }

  //     Api("get", url, router).then(
  //       (res) => {
  //         props.loader(false);

  //         setEmployeeIds(res.data);
  //       },
  //       (err) => {
  //         props.loader(false);
  //         console.log(err);
  //         props.toaster({ type: "error", message: err?.message });
  //       }
  //     );
  //   };

  const reminderSellerForReturn = async (orderId, sellerId) => {
    props.loader(true);
    let data = {
      orderId: orderId,
      sellerId: sellerId,
    };
    Api("post", "reminderSellerForReturn", data, router).then(
      (res) => {
        props.loader(false);
        setviewPopup(false);
        props.toaster({ type: "success", message: "Reminder Send Successfully" });
        setPopupData({});
        setOpenIndex(null);
        closeDrawer();
        // getOrderBySeller(null, currentPage);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
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

  function status({ value }) {
    return (
      <div>
        <p
          className={`${value === "Return-requested" ? "text-orange-500" : "text-green-500"
            } text-base font-normal text-center`}
        >
          {value}
        </p>
      </div>
    );
  }

  const info = ({ value, row }) => {
    //console.log(row.original._id)
    return (
      <div className="flex items-center justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px]"
          onClick={() => {
            // setOpenCart(true);
            // setCartData(row.original);
            setviewPopup(true);
            setPopupData((prev) => ({
              _id: row.original._id,
              orderId: row.original.orderId,
              productDetail: row.original.productDetail,
              productId: row.original.productId,
              shipping_address: row.original.shipping_address,
              seller_id: row.original.seller_id,
            }));
          }}
        >
          See
        </button>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Sr. No",
        accessor: "indexNo",
        Cell: indexID,
      },
      {
        Header: "Order ID",
        accessor: (row) => row.orderId || row._id,
        Cell: orderId,
      },
      {
        Header: "Customer",
        accessor: "user.username",
        Cell: email,
      },
      {
        Header: "Seller",
        accessor: "seller_id.username",
        Cell: name,
      },
      {
        Header: "Order Date",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "Return Date",
        accessor: "productDetail[0].returnDetails.returnRequestDate",
        Cell: returndate,
      },
      // {
      //   Header: "STATUS",
      //   accessor: "status",
      //   Cell: status,
      // },
      {
        Header: "See Details",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );

  return (
    <section className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5 relative z-10">
      <p className="text-gray-800 font-bold  md:text-[32px] text-2xl">
        Returned Orders
      </p>
      {/* pl-2 */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {/* md:mt-9 */}
        {/* shadow-2xl  */}

        <div className="flex items-center md:mb-5 mb-5 gap-2">
          <h1 className="text-gray-800 font-bold text-lg md:text-2xl">
            Refunded Amount:{" "}
          </h1>
          <p className="text-gray-800 font-bold text-lg md:text-2xl">
            {/* {currencySign(userRquestList?.reduce((a, b) => a + b?.total, 0))} */}
            {/* 0 */}
            {currencySign(totalRefundedAmount)}
          </p>
        </div>

        <div className="bg-white border border-custom-lightGrayColor w-full rounded-[10px] md:py-0 py-5 md:px-0 px-5">
          <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full md:h-[70px]">
            <div
              onClick={() => setOpen(!open)}
              className="cursor-pointer flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor"
            >
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
                  setSearchCustomer("");
                  setSearchSeller("");
                }}
              >
                Reset
              </button>
            </div>
          </div>
          {open && (
            <div className="w-full col-span-9 flex gap-4 md:flex-row flex-col justify-start md:items-center items-start py-3 md:ml-5">
              <div className="flex items-center">
                <div className="flex flex-col gap-1">
                  {/* <label className="text-gray-800 font-semibold text-base">
                  Search
                </label> */}
                  <input
                    className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[220px] pl-3 text-base font-normal text-black outline-none"
                    type="text"
                    placeholder="Search by Seller Name"
                    value={searchSeller}
                    onChange={(e) => {
                      setSearchSeller(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex flex-col gap-1">
                  {/* <label className="text-gray-800 font-semibold text-base">
                  Search
                </label> */}
                  <input
                    className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[220px] pl-3 text-base font-normal text-black outline-none"
                    type="text"
                    placeholder="Search by Customer Name"
                    value={searchCustomer}
                    onChange={(e) => {
                      setSearchCustomer(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 md:mt-0 mt-5">
                <button
                  className="h-[38px] w-[93px] bg-custom-darkpurple text-white text-base	font-normal rounded-[8px] disabled:bg-custom-darkGrayColor/50"
                  disabled={!searchSeller && !searchCustomer && !selctDate}
                  onClick={() => {
                    getOrderBySeller(
                      selctDate,
                      currentPage,
                      10,
                      searchSeller,
                      searchCustomer
                    );
                    setOpenCart(false);
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          )}
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
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-[9]">
            <div className="relative w-[300px] md:w-[460px] h-auto bg-white rounded-[15px] m-auto">
              <div
                className="absolute top-2 right-2 p-1 rounded-full text-black w-8 h-8 cursor-pointer"
                onClick={() => {
                  setviewPopup(!viewPopup);
                  setPopupData({});
                  setOpenIndex(null);
                }}
              >
                <RxCrossCircled className="h-full w-full font-semibold " />
              </div>

              <div className="max-h-[400px] px-5 w-full py-3 overflow-y-scroll scrollbar-hide">
                <p className="text-center mt-2 font-semibold text-xl text-gray-800">
                  Returned Product Details
                </p>

                <ul className="rounded-md space-y-2 my-4">
                  {popupData?.productDetail?.length > 0 &&
                    popupData?.productDetail?.map((item, index) => (
                      <li
                        key={index}
                        className="rounded-md bg-custom-darkpurple/10 p-2"
                      >
                        <button
                          className="flex items-center justify-between w-full focus:outline-none"
                          type="button"
                          onClick={() => toggleAccordion(index)}
                        >
                          <div className="flex items-center gap-2">
                            <img src={item?.image[0]} className="w-10 h-10" />
                            <div className="flex flex-col items-start gap-0.5">
                              <p className="text-gray-800 text-base font-semibold">
                                {item?.product?.name}
                              </p>
                              <p className="text-gray-800 text-sm font-normal">
                                {currencySign(item?.total ?? item?.price ?? 0)}
                              </p>
                            </div>
                          </div>
                          <svg
                            className={`w-4 h-4 transform transition-transform ${openIndex === index ? "rotate-180" : ""
                              }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 13.535l4.95-4.95 1.414 1.414-6.364 6.364-6.364-6.364 1.414-1.414z" />
                          </svg>
                        </button>
                        {openIndex === index && (
                          <div className="accordion-content p-4">
                            <dl className="sm:divide-y sm:divide-gray-200">
                              <div className="py-1 flex flex-col gap-1">
                                <dt className="text-custom-darkpurple text-sm font-semibold">
                                  Return Reason
                                </dt>
                                <dd className="col-span-2 mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                                  {item?.returnDetails?.reason}
                                </dd>
                              </div>
                              <div className="py-1 flex flex-col gap-1">
                                <dt className="text-custom-darkpurple text-sm font-semibold">
                                  Return Date & Time
                                </dt>
                                <dd className="col-span-2 mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                                  {moment(
                                    item?.returnDetails?.returnRequestDate
                                  ).format("YYYY-MM-DD hh:mm:ss A")}
                                </dd>
                              </div>
                              <div className="py-1 flex flex-col gap-1">
                                <dt className="text-custom-darkpurple text-sm font-semibold">
                                  Barcode
                                </dt>
                                <dd className="col-span-2 mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                                  <Barcode
                                    value={item._id}
                                    height={20}
                                    width={0.5}
                                    fontSize={10}
                                    background="transparent"
                                  // displayValue={false}
                                  />
                                </dd>
                              </div>
                              <div className="py-1 flex flex-col gap-1">
                                <dt className="text-custom-darkpurple text-sm font-semibold">
                                  Proof
                                </dt>
                                <dd className="mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2 px-3">
                                  <Slider {...settings}>
                                    {item?.returnDetails?.proofImages?.map(
                                      (media, i) => {
                                        const isVideo =
                                          media?.match(/\.(mp4|webm|ogg)$/i);

                                        return (
                                          <div className="w-auto" key={i}>
                                            {isVideo ? (
                                              <video
                                                controls
                                                autoPlay
                                                className="w-auto h-[200px] object-fill rounded-md mr-2"
                                                src={media}
                                              />
                                            ) : (
                                              <img
                                                src={media}
                                                className="w-full h-[200px] object-cover rounded-md mr-2"
                                                alt={`proof-${i}`}
                                              />
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </Slider>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3">
                  <button
                    // disabled={!popupData?.assignedEmployee}
                    onClick={() => {
                      reminderSellerForReturn(
                        popupData?.orderId || popupData?._id,
                        popupData?.seller_id?._id
                      );
                      setviewPopup(false);
                      setPopupData({});
                      setOpenIndex(null);
                    }}
                    className="text-white bg-custom-darkpurple hover:bg-custom-darkpurple/90 px-5 py-2 rounded justify-center mx-auto grid w-60 cursor-pointer disabled:bg-custom-darkpurple/30"
                  >
                    Send Seller Notification
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
            pageSize={pageSize}
              setPageSize={setPageSize}
          />
        </div>
      </section>
    </section>
  );
}

export default isAuth(ReturnedOrders);
