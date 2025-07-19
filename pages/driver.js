import React, { useMemo, useState, useEffect } from "react";
import Table, { indexID } from "@/components/table";
import { Api } from "@/services/service";
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

function Driver(props) {
  const router = useRouter();
  const [driverData, setDriverData] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  // const [driverdata, setdriverdata] = useState([]);
  const [currentIndex, setCuurentIndex] = useState(0);
  const [driverType, setDriverType] = useState("DRIVER");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default limit

  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: pageSize,
  });

  const handleClose = () => {
    setviewPopup(false);
  };

  useEffect(() => {
    if (driverType) {
      getDriverList(driverType, currentPage,pageSize);
    }
  }, [popupData, currentPage, pageSize]);

  const getDriverList = async (type, page = 1, limit = 10) => {
    props.loader(true);
    Api(
      "get",
      `getDriverList/${type}?page=${page}&limit=${limit}`,
      "",
      router
    ).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setDriverData(res?.data);
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

  console.log("popup Data ::", popupData);

  const updateStatus = async (id, status) => {
    props.loader(true);
    setviewPopup(false);
    Api("post", "updateStatus", { id, status }, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        getDriverList(driverType);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
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

  const info = ({ value, row }) => {
    // console.log(row.original)
    return (
      <div className="flex items-center justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#FE3E0020] text-custom-red text-base	font-normal rounded-[8px]"
          onClick={() => {
            setviewPopup(true);
            setPopupData(row.original);
            setDriverData([
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
        accessor: "username",
        Cell: name,
      },
      {
        Header: "E-mail",
        accessor: "email",
        Cell: email,
      },
      {
        Header: "DATE",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "Mobile",
        accessor: "number",
        Cell: mobile,
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
    <section className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
      <p className="text-gray-800 font-bold md:text-[32px] text-2xl">
        Driver
      </p>
      {/* pl-2  */}
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

        {viewPopup && (
          <Dialog
            open={viewPopup}
            onClose={handleClose}
            //  maxWidth="md"
            fullScreen
          >
            <div className="p-5  bg-white relative overflow-hidden">
              <IoCloseCircleOutline
                className="text-black h-8 w-8 absolute right-2 top-2"
                onClick={handleClose}
              />
              <div className="md:flex justify-between border-b-2 border-b-gray-300 py-2">
                <div className="">
                  <div className="md:flex flex-row justify-start items-start">
                    <Avatar
                      // alt={singleData.username}
                      // src={singleData.profile}
                      sx={{ width: 60, height: 60 }}
                    />
                    <div className="flex flex-col justify-start items-start md:pl-5">
                      <p className="text-base font-bold text-gray-800 md:pt-0 pt-2">
                        {popupData?.username}
                      </p>
                      <p className="text-base font-semibold text-custom-newBlack pt-2">
                        {popupData?.email}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 pt-2">
                        {popupData?.number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-6 flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
                  <div className="grid grid-cols-4 gap-x-4 w-full justify-between items-center md:pl-5">
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Delivered Items:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {popupData?.stats?.totalOrders}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Tips:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {currencySign(popupData?.stats?.totalTips)}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Earnings:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {currencySign(popupData?.stats?.totalEarnings)}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Wallet Balance:
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {currencySign(popupData?.stats?.totalWalletBalance)}
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

                <div className="flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
                  <div className="flex flex-col justify-start items-start md:pl-5 w-[50%]">
                    <div className="flex justify-between items-center w-full md:pt-0 pt-2">
                      <p className="text-sm text-gray-800 font-bold">
                        Number Plate :{" "}
                        <span className="text-custom-darkGrayColor">
                          {popupData?.numberPlate || "N/A"}
                        </span>
                      </p>
                      {/* <p className="text-sm font-normal text-gray-800">Licences : {" "} <span>{popupData?. }</span></p> */}
                      {/* <p className="text-sm font-normal text-gray-800">Total Order</p>
                                            <p className="text-sm font-normal text-gray-800">80</p> */}
                    </div>
                    <div className="flex justify-between items-center w-full pt-2">
                      {/* <p className="text-sm font-normal text-gray-800">Total earning</p>
                                            <p className="text-sm font-normal text-gray-800">150</p> */}
                    </div>
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
                {driverData?.map((item, i) => (
                  <SwiperSlide onKeyUpCapture={i}>
                    <div className="w-full flex justify-center">
                      <div className="md:w-80 md:h-64 w-60 h-48 relative rounded-lg">
                        <img
                          src={item?.numberPlateImg || "/image1.jpg"}
                          alt="icon"
                          layout="responsive"
                          className="rounded-sm md:w-80 md:h-64 w-60 h-48"
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

        <div className="">
          <Table
            columns={columns}
            data={driverData}
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={currentPage}
            // itemsPerPage={pagination.itemsPerPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </div>
      </section>
    </section>
  );
}

export default isAuth(Driver);
