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
import Barcode from "react-barcode";

function SellerOrders(props) {
  const router = useRouter();
  const [userRquestList, setUserRquestList] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    assignedEmployee: "",
    orderId: "",
  });
  const [openCart, setOpenCart] = useState(false);
  const [CartItem, setCartItem] = useState(0);
  const [user, setUser] = useContext(userContext);
  const [open, setOpen] = useState(false);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [cartData, setCartData] = useState({});
  const [selctDate, setSelctDate] = useState(new Date());
  const [searchSeller, setSearchSeller] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default limit
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: pageSize,
  });

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
  }, [currentPage,pageSize]);

  const getOrderBySeller = async (selctedDate, page = 1, limit = 10, seller, customer) => {
    const data = {};

    if (selctedDate) {
      data.curentDate = moment(new Date(selctedDate)).format();
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
      `getSellerOrderByAdmin?page=${page}&limit=${limit}`,
      data,
      router
    ).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setUserRquestList(res?.data);
        setPagination(res?.pagination);
        setCurrentPage(res?.pagination?.currentPage);
 setPagination({
          ...res?.pagination,
          itemsPerPage: pageSize, // force override to match dropdown
        });
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

  const assignEmployee = async (orderId) => {
    props.loader(true);
    let data = {
      orderId: orderId,
      assignedEmployee: popupData?.assignedEmployee,
    };
    Api("post", "assignOrder", data, router).then(
      (res) => {
        props.loader(false);
        setviewPopup(false);
        props.toaster({ type: "success", message: res?.message });
        setPopupData({
          assignedEmployee: "",
          orderId: "",
        });
        closeDrawer();
        getOrderBySeller(null, currentPage);
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

  function name({ value }) {
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

  function status({ value }) {
    return (
      <div>
        <p
          className={`${value === "Pending" ? "text-orange-500" : "text-green-500"
            } text-base font-normal text-center`}
        >
          {value === "Driverassigned" ? "Driver Assigned" : value}
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
            setOpenCart(true);
            setCartData(row.original);
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
        accessor: row => row.orderId || row._id,
        Cell: orderId,
      },
      {
        Header: "Seller Name",
        accessor: "seller_id.name",
        Cell: name,
      },
     {
      Header: "Customer Name",
      accessor: row => `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim(),
      Cell: name, 
    },
      {
        Header: "Order Date",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: status,
      },
      {
        Header: "See Details",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );

  const handleResetClick = () => {
    setSelctDate("");
    setSearchSeller("");
    setSearchCustomer("");

    getOrderBySeller(null, 1, 10, "", "");
  };

  return (
    <section className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5 relative z-10">
      <p className="text-gray-800 font-bold  md:text-[32px] text-2xl">
        Seller Orders
      </p>
      {/* pl-2 */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {/* md:mt-9 */}
        {/* shadow-2xl  */}

        <div className="bg-white border border-custom-lightGrayColor w-full rounded-[10px] md:py-0 py-5 md:px-0 px-5">
          <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full md:h-[70px]">
            <div onClick={() => setOpen(!open)} className="cursor-pointer flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor">
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
                onClick={handleResetClick}
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
                  disabled={
                    !searchSeller && !searchCustomer && !selctDate
                  }
                  onClick={() => {
                    getOrderBySeller(selctDate, currentPage, 10, searchSeller, searchCustomer);
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

              <div className="w-full">
                {/* <div className="w-full flex justify-between items-center">
                  <p className="text-black text-sm">Barcode:</p>
                  <p className="text-black text-sm font-normal">
                    <Barcode
                      value={cartData._id}
                      height={20}
                      width={0.5}
                      fontSize={10}
                    // displayValue={false}
                    />
                  </p>
                </div> */}
                <div className="w-full flex justify-between items-center">
                  <p className="text-black text-sm">Tax:</p>
                  <p className="text-black text-sm font-normal">
                    {currencySign(cartData?.tax)}
                  </p>
                </div>
                {/* <div className="w-full flex justify-between items-center my-1">
                  <p className="text-black text-sm">Delivery Fee:</p>
                  <p className="text-black text-sm font-normal">
                    {currencySign(cartData?.deliveryCharge)}
                  </p>
                </div>
                <div className="w-full flex justify-between items-center">
                  <p className="text-black text-sm">Delivery Tip:</p>
                  <p className="text-black text-sm font-normal">
                    {currencySign(cartData?.deliveryTip)}
                  </p>
                </div> */}
              </div>

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
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-[9999]">
            <div className="relative w-[300px] md:w-[360px] h-auto  bg-white rounded-[15px] m-auto">
              <div
                className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
                onClick={() => {
                  setviewPopup(!viewPopup);
                  //   setPopupData((prev) => ({
                  //     ...prev,
                  //     assignedEmployee: "",
                  //   }));
                }}
              >
                <RxCrossCircled className="h-full w-full font-semibold " />
              </div>

              <div className="px-5 w-full py-3">
                <p className="text-center mt-2 font-semibold text-xl text-gray-800">
                  Assign Employee
                </p>
                <div className="flex flex-col gap-2 mt-5 mb-5">
                  <select
                    className="bg-transparent border border-custom-darkpurple p-2 rounded-md text-gray-800 outline-none font-normal text-base"
                    onChange={(e) => {
                      setPopupData((prev) => ({
                        ...prev,
                        assignedEmployee: e.target.value,
                      }));
                    }}
                    value={popupData?.assignedEmployee}
                  >
                    <option value="">Select Employee</option>
                    {employeeIds?.map((item, i) => (
                      <option key={i} value={item?._id}>
                        {item?.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={!popupData?.assignedEmployee}
                    onClick={() => {
                      assignEmployee(popupData?.orderId);
                      setviewPopup(false);
                      setPopupData((prev) => ({
                        ...prev,
                        assignedEmployee: "",
                      }));
                    }}
                    className="text-white bg-custom-darkpurple hover:bg-custom-darkpurple/90 px-5 py-2 rounded justify-center mx-auto grid w-48 cursor-pointer disabled:bg-custom-darkpurple/30"
                  >
                    Assign
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

export default isAuth(SellerOrders);
