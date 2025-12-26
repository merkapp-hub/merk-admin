import React, { useMemo, useState, useEffect } from "react";
import Table, { indexID } from "@/components/table";
import { Api, ApiBlobData, ApiFormData } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import { IoCloseCircleOutline } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Navigation } from "swiper/modules";
import isAuth from "@/components/isAuth";
import currencySign from "@/utils/currencySign";
import MultiSelect from "@/components/MultiSelect";
import PopupTable from "@/components/PopupTable";

function Sellers(props) {
  const router = useRouter();
  const [sellersData, setSellersData] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [driverdata, setdriverdata] = useState([]);
  const [currentIndex, setCuurentIndex] = useState(0);
  const [newPopupData, setNewPopupData] = useState({});
  const [newPopup, setNewPopup] = useState(false);
  const [selctDate, setSelctDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(10); // default limit
   const [pagination, setPagination] = useState({
     totalPages: 1,
     currentPage: 1,
     itemsPerPage: pageSize,
   });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const open = Boolean(anchorEl);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const options = ["Products", "Orders", "Employees", "Returns", "Refunds"];
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClosePopup = () => {
    setNewPopup(false);
    setNewPopupData({});
  };

  useEffect(() => {
    getuserlist(currentPage,pageSize);
  }, [currentPage,pageSize]);

  const handleClose = () => {
    setviewPopup(false);
    setPopupData({});
    setdriverdata([]);
    setSelectedId("");
    setSelectedOptions([]);
    setAnchorEl(null);
  };

  // const singleData = [
  //     {
  //         img: driverdata?.docimg
  //     },
  //     {
  //         img: driverdata?.vehicleimg
  //     },
  // ]

  const getuserlist = async (page = 1, limit = 10, search) => {
    let url = `auth/getSellerListt?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${search}`;
    }

    props.loader(true);
    Api("get", url, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================vvvvvvv>", res);
        setSellersData(res.data);
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

  const getSellerStats = async (id) => {
    props.loader(true);
    Api("get", `getSellerStats/${id}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>vvv", res);
        // setSellersData(res.data);
        // setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateStatus = async (id, status) => {
    setviewPopup(false);
    props.loader(true);
    Api("post", `updateStore`, { id, status }, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        getuserlist();
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const exportData = async () => {
    props.loader(true);
    setviewPopup(false);
    const data = {
      reportTypes: selectedOptions,
      id: selectedId,
    };
    ApiBlobData("post", `export/detailed-seller-report`, data, router).then(
      (res) => {
        props.loader(false);

        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "detailed-seller-report.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
        props.toaster({
          type: "success",
          message: "Exported successfully",
        });
        setAnchorEl(null);
        setSelectedOptions([]);
        setSelectedId("");
        setdriverdata([]);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({
          type: "error",
          message: err?.message || "Export failed",
        });
      }
    );
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

  function mobile({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function status({ row }) {
    const value = row.original?.status;
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

  const info = ({ value, row }) => {
    return (
      <div className="flex items-center  justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#FE3E0020] text-custom-red text-base	font-normal rounded-[8px]"
          onClick={() => {
            setviewPopup(true);
            setPopupData(row.original);
            // getSellerStats(row.original?._id);
            setSelectedId(row.original?._id);
            setdriverdata([
              {
                img: row.original?.store?.identity,
              },
              {
                img: row.original?.store?.kbis,
              },
            ]);
          }}
        >
          See
        </button>
      </div>
    );
  };

  function commission({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-semibold text-center">
          {value || 15}%
        </p>
      </div>
    );
  }

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        // accessor: "_id",
        accessor: "indexNo",
        Cell: indexID,
      },
      {
        Header: "NAME",
        accessor: "firstName",
        Cell: name,
      },
      {
        Header: "E-mail",
        accessor: "email",
        Cell: email,
      },

      {
        Header: "Mobile",
        accessor: "number",
        Cell: mobile,
      },
      {
        Header: "Commission",
        accessor: "commissionRate",
        Cell: commission,
      },
      {
        Header: "DATE",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: status,
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
    <section  className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
      <p className="text-gray-800 font-bold  md:text-[32px] text-2xl">
        Sellers
      </p>
      {/* pl-2 */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {/* md:mt-9 */}
        {/* shadow-2xl  */}

        {/* <div className='bg-white border border-custom-lightGrayColor w-full md:h-[70px] rounded-[10px] md:py-0 py-5 md:px-0 px-5'>
                    <div className='md:grid md:grid-cols-10 grid-cols-1 w-full h-full '>
                        <div className='flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor'>
                            <img className='w-[20px] h-[23px]' src='/filterImg.png' />
                        </div>
                        <div className='flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:pt-0 pt-5 md:pb-0 pb-3'>
                            <p className='text-gray-800 text-sm	font-bold'>Filter By</p>
                        </div>
                        <div className='col-span-8 flex justify-start items-center '>
                            <p className='text-gray-800 font-semibold text-sm md:pl-3'>Date</p>
                            <input className='ml-3 text-gray-800' type='date' placeholder='Date' />
                        </div>
                    </div>
                </div> */}

        <div className="bg-white border mt-5 border-custom-lightGrayColor w-full  rounded-[10px] md:py-0 py-5 md:px-0 px-5">
          <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full py-3">
            {/* <div className="flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor">
              <img className="w-[20px] h-[23px]" src="/filterImg.png" />
            </div> */}
            <div className="col-span-1 flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:pt-0 pt-5 md:pb-0 pb-3">
              <p className="text-gray-800 text-sm	font-bold">Filter By</p>
            </div>
            <div className="w-full col-span-9 flex md:flex-row flex-col md:justify-between justify-start md:items-center items-start">
              <div className="flex items-center ml-3">
                {/* <div className="flex items-center">
                 <lable className="text-gray-800 md:pl-3 font-semibold text-sm">
                  Date
                </lable> 
                <input
                  className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[160px] px-3 text-base font-normal text-black outline-none"
                  type="date"
                  placeholder="Date"
                  value={selctDate}
                  max={moment(new Date()).format("YYYY-MM-DD")}
                  onChange={(e) => {
                    setSelctDate(e.target.value);
                  }}
                />
              </div> */}
                <div className="flex flex-col gap-1 md:pl-3">
                  {/* <label className="text-gray-800 font-semibold text-base">
                Search
              </label> */}
                  <input
                    className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[280px] pl-3 text-base font-normal text-black outline-none"
                    type="text"
                    placeholder="Search by Name, Email, Mobile"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 md:mt-0 mt-5 md:mr-5">
                <button
                  className="h-[38px] w-[93px] bg-custom-darkpurple text-white text-base	font-normal rounded-[8px] disabled:bg-custom-darkGrayColor/50"
                  disabled={search.length < 1}
                  onClick={() => {
                    getuserlist(currentPage, 10, search);
                    setSelctDate("");
                    setSelectedOptions([]);
                  }}
                >
                  Search
                </button>
                <button
                  className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px]"
                  onClick={() => {
                    setSearch("");
                    getuserlist(currentPage, 10, "");
                    setSelctDate("");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-wrap justify-between gap-4 md:mt-5 mt-3 p-3">
            <div className="flex flex-col gap-1">
              <label className="text-gray-800 font-semibold text-base">
                Search
              </label>
              <input
                className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[300px] pl-3 text-base font-normal text-black outline-none"
                type="text"
                placeholder="Search"
                onChange={(e) => {
                  // setFilter(e.target.value);
                  // getInTouch(null, currentPage, 10, e.target.value);
                  console.log("filter");
                }}
              />
            </div>
          </div> */}
        </div>

        {viewPopup && (
          <Dialog
            open={viewPopup}
            onClose={handleClose}
            // maxWidth="md"
            fullScreen
          >
            <div className="p-5 bg-white relative overflow-hidden">
              <IoCloseCircleOutline
                className="text-black h-8 w-8 absolute right-2 top-2 cursor-pointer"
                onClick={handleClose}
              />
              <div className="grid grid-cols-12 justify-between border-b-2 border-b-gray-300 py-2">
                <div className="col-span-6">
                  <div className="md:flex flex-row justify-start items-start">
                    <Avatar
                      // alt={singleData.username}
                      // src={singleData.profile}
                      sx={{ width: 60, height: 60 }}
                    />
                    <div className="flex flex-col justify-start items-start md:pl-5">
                      <p className="text-base font-bold text-gray-800">
                        {popupData?.username}
                      </p>
                      <p className="text-base font-semibold text-custom-newBlack">
                        {popupData?.email}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {popupData?.number}
                      </p>
                      {/* <button
                      className="text-white bg-custom-darkpurple rounded w-36 h-[30px] mt-2"
                      onClick={() =>
                        router.push(
                          `/sellers-product?seller_id=${popupData?._id}`
                        )
                      }
                    >
                      Seller Products
                    </button> */}
                      <button
                        className="text-white bg-custom-darkpurple rounded w-36 h-[30px] mt-2"
                        // onClick={() =>
                        //   router.push(
                        //     `/sellers-product?seller_id=${popupData?._id}`
                        //   )
                        // }
                        id="lock-button"
                        aria-haspopup="listbox"
                        aria-controls="lock-menu"
                        aria-label="when device is locked"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleClickListItem}
                      >
                        Export Seller
                      </button>
                      <MultiSelect
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        handleCloseMenu={handleCloseMenu}
                        options={options}
                        selectedOptions={selectedOptions}
                        setSelectedOptions={setSelectedOptions}
                        onClick={() => exportData()}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-6 flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
                  <div className="grid grid-cols-4 w-full justify-between items-center md:pl-5">
                    {/* Commission Rate Section */}
                    <div className="col-span-4 mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Commission Rate:
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {popupData?.commissionRate || 15}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            defaultValue={popupData?.commissionRate || 15}
                            className="w-20 h-8 px-2 border border-gray-300 rounded text-center"
                            id={`commission-${popupData?._id}`}
                          />
                          <button
                            className="h-8 px-3 bg-blue-600 text-white text-sm font-normal rounded hover:bg-blue-700"
                            onClick={async () => {
                              const newRate = document.getElementById(`commission-${popupData?._id}`).value;
                              if (!newRate || newRate < 0 || newRate > 100) {
                                props.toaster({ type: "error", message: "Please enter a valid commission rate (0-100)" });
                                return;
                              }
                              
                              props.loader(true);
                              try {
                                const response = await Api("put", "auth/updateSellerCommission", {
                                  sellerId: popupData?._id,
                                  commissionRate: parseFloat(newRate)
                                }, router);
                                
                                if (response?.success) {
                                  props.toaster({ type: "success", message: "Commission rate updated successfully" });
                                  setPopupData({ ...popupData, commissionRate: parseFloat(newRate) });
                                  getuserlist(currentPage, pageSize);
                                } else {
                                  props.toaster({ type: "error", message: response?.message || "Failed to update commission" });
                                }
                              } catch (error) {
                                props.toaster({ type: "error", message: error?.message || "Failed to update commission" });
                              } finally {
                                props.loader(false);
                              }
                            }}
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      onClick={() => {
                        setNewPopup(true);
                        setNewPopupData({
                          id: popupData?._id,
                          name: popupData?.username,
                          type: "Orders",
                        });
                      }}
                      className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full"
                    >
                      <p className="text-sm font-semibold text-gray-600">
                        Total Order:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {popupData?.stats?.totalOrders}
                      </p>
                    </div>
                    <div onClick={() => {
                        setNewPopup(true);
                        setNewPopupData({
                          id: popupData?._id,
                          name: popupData?.username,
                          type: "Products",
                        });
                      }} className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Products:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {popupData?.stats?.totalProducts}
                      </p>
                    </div>
                    <div onClick={() => {
                        setNewPopup(true);
                        setNewPopupData({
                          id: popupData?._id,
                          name: popupData?.username,
                          type: "Employees",
                        });
                      }} className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Employees:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {popupData?.stats?.totalEmployees}
                      </p>
                    </div>
                    <div onClick={() => {
                        setNewPopup(true);
                        setNewPopupData({
                          id: popupData?._id,
                          name: popupData?.username,
                          type: "Returns",
                        });
                      }} className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Returned Items:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {popupData?.stats?.returnedItems}
                      </p>
                    </div>
                    <div className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Refunded Items:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {popupData?.stats?.refundedItems}
                      </p>
                    </div>
                    <div className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Refund Amount:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {currencySign(popupData?.stats?.totalRefundAmount)}
                      </p>
                    </div>
                    <div className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Income:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {currencySign(popupData?.stats?.totalIncome)}
                      </p>
                    </div>
                    <div className="cursor-pointer col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Tax:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {currencySign(popupData?.stats?.totalTax)}
                      </p>
                    </div>
                    {/* <button
                      className="text-white bg-custom-darkpurple rounded w-36 h-[30px] mt-2"
                      onClick={() =>
                        router.push(
                          `/sellers-product?seller_id=${popupData?._id}`
                        )
                      }
                    >
                      Seller Products
                    </button> */}
                  </div>
                </div>
              </div>
              <p className="text-gray-800 text-base font-bold pt-2">
                Uploaded Document
              </p>

              <Swiper
                navigation={true}
                modules={[Navigation]}
                className="mySwiper mt-5 md:w-[880px] w-68"
                onRealIndexChange={(newindex) =>
                  setCuurentIndex(newindex.activeIndex)
                }
                onSlideChange={() => console.log("slide change")}
                onSwiper={(swiper) => console.log(swiper)}
              >
                {driverdata?.map((item, i) => (
                  <SwiperSlide onKeyUpCapture={i}>
                    <div className="w-full flex justify-center">
                      <div className="md:w-80 md:h-64 w-60 h-48 relative rounded-lg">
                        <img
                          src={item?.img}
                          alt="icon"
                          layout="responsive"
                          className="rounded-sm md:w-80 md:h-64 w-60 h-48 object-contain"
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="md:h-12">
                <div className="flex  mt-5  justify-center  gap-5">
                  {popupData?.status != "Verified" && (
                    <button
                      className="text-white text-lg font-bold w-[274px] h-[50px] rounded-[12px] bg-custom-darkpurple"
                      onClick={() => {
                        updateStatus(popupData?._id, "Verified");
                      }}
                    >
                      Verify
                    </button>
                  )}
                  {popupData?.status != "Suspend" && (
                    <button
                      className="text-white text-lg font-bold w-[274px] h-[50px] rounded-[12px] bg-custom-darkRed"
                      onClick={() => {
                        updateStatus(popupData?._id, "Suspend");
                      }}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Dialog>
        )}
        <Dialog
          open={newPopup}
          onClose={handleClosePopup}
          fullScreen
          // PaperProps={{
          //   style: {
          //     maxHeight: "300px",
          //     width: "200px",
          //   },
          // }}
        >
          <PopupTable
            {...props}
            goBack={handleClosePopup}
            data={newPopupData}
            loader={props?.loader}
            toaster={props?.toaster}
          />
        </Dialog>

        <div className="">
          <Table
            columns={columns}
            data={sellersData}
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={currentPage}
            pageSize={pageSize}
              setPageSize={setPageSize}
            // itemsPerPage={pagination.itemsPerPage}
          />
        </div>
      </section>
    </section>
  );
}

export default isAuth(Sellers);
