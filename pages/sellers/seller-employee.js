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
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { FaLocationDot } from "react-icons/fa6";
import Link from "next/link";

function SellerEmployee(props) {
  const router = useRouter();
  const [sellersData, setSellersData] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [driverdata, setdriverdata] = useState([]);
  const [currentIndex, setCuurentIndex] = useState(0);
  const [selctDate, setSelctDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default limit
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: pageSize,
  });

  useEffect(() => {
    getuserlist(currentPage,pageSize);
  }, [currentPage,pageSize]);

  const handleClose = () => {
    setviewPopup(false);
    setPopupData({});
    setdriverdata([]);
  };

  // const singleData = [
  //     {
  //         img: driverdata?.docimg
  //     },
  //     {
  //         img: driverdata?.vehicleimg
  //     },
  // ]

  const getuserlist = async (page = 1, limit = 10, curDate, search) => {
    props.loader(true);

    const params = new URLSearchParams({
      page,
      limit,
      ...(curDate && { curDate: moment(new Date(curDate)).format() }),
      ...(search && { search }),
    });

    const url = `getSellerEmployeeByAdmin?${params.toString()}`;

    Api("get", url, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
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

  const deleteProduct = (_id, vendor) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to proceed with the deletion? change this to You want to proceed with the delete?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then(function (result) {
      if (result.isConfirmed) {
        const data = {
          _id,
          vendor,
        };

        Api("delete", `deleteEmployee/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);

            if (res?.status) {
              getuserlist();
              props.toaster({ type: "success", message: res.data?.meaasge });
            } else {
              console.log(res?.data?.message);
              props.toaster({ type: "error", message: res?.data?.meaasge });
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.data?.meaasge });
            props.toaster({ type: "error", message: err?.meaasge });
          }
        );
      } else if (result.isDenied) {
        // setFullUserDetail({})
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
    console.log(row.original);
    return (
      <div className="flex items-center justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#FE3E0020] text-custom-red text-base	font-normal rounded-[8px]"
          onClick={() => {
            setviewPopup(true);
            setPopupData(row.original);
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

  const actionHandler = ({ value, row }) => {
    return (
      <div className="bg-custom-offWhiteColor flex items-center w-[8rem] justify-evenly border border-custom-offWhite rounded-[10px] mr-[10px]">
        <div
          className="py-[10px] w-[50%] items-center flex justify-center cursor-pointer"
          onClick={() => {
            router.push(`/add-employee?id=${row.original._id}`);
          }}
        >
          <FiEdit className="text-[18px]" />
        </div>
        <div className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center">
          <RiDeleteBinLine
            className="text-[red] text-[18px] cursor-pointer"
            onClick={() =>
              deleteProduct(row.original._id, row.original.parent_vendor._id)
            }
          />
        </div>
        {row.original?.currentlocation?.coordinates && (
          <Link
            href={`https://www.google.com/maps?q=${row?.original?.currentlocation?.coordinates[1]},${row?.original?.currentlocation?.coordinates[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center"
          >
            <FaLocationDot className="text-indigo-800 text-[18px] cursor-pointer" />
          </Link>
        )}
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
        Header: "EMPLOYEE",
        accessor: "username",
        Cell: name,
      },
      {
        Header: "EMAIL",
        accessor: "email",
        Cell: email,
      },
      {
        Header: "JOINING DATE",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "SELLER",
        accessor: "parent_vendor.username",
        Cell: mobile,
      },
      {
        Header: "MOBILE",
        accessor: "number",
        Cell: mobile,
      },
      {
        Header: "ACTION",
        Cell: actionHandler,
      },
      //   {
      //     Header: "Info",
      //     // accessor: "view",
      //     Cell: info,
      //   },
    ],
    []
  );

  return (
    <section className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5 relative z-10">
      <p className="text-gray-800 font-bold  md:text-[32px] text-2xl">
        Seller Employees
      </p>
      {/* pl-2 */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {/* md:mt-9 */}
        {/* shadow-2xl  */}

        <div className="bg-white border mt-5 border-custom-lightGrayColor w-full rounded-[10px] md:py-0 py-5 md:px-0 px-5">
          <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full py-3">
            {/* <div className="flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor">
              <img className="w-[20px] h-[23px]" src="/filterImg.png" />
            </div> */}
            <div className="col-span-1 flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:pt-0 pt-5 md:pb-0 pb-3">
              <p className="text-gray-800 text-sm	font-bold">Filter By</p>
            </div>
            <div className="w-full col-span-9 flex md:flex-row flex-col md:justify-between justify-start md:items-center items-start">
              <div className="flex flex-wrap md:flex-nowrap gap-3 items-center md:pl-3">
                <div className="flex  items-center">
                  {/* <lable className="text-gray-800 md:pl-3 font-semibold text-sm">
                  Date
                </lable>  */}
                  <input
                    className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[160px] px-3 text-base font-normal text-black outline-none"
                    type="date"
                    placeholder="Date"
                    value={selctDate}
                    max={moment(new Date()).format("YYYY-MM-DD")}
                    onChange={(e) => {
                      setSelctDate(e.target.value);
                      getuserlist(currentPage, 10, e.target.value);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {/* <label className="text-gray-800 font-semibold text-base">
                Search
              </label> */}
                  <input
                    className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-full md:w-[280px] pl-3 text-base font-normal text-black outline-none"
                    type="text"
                    placeholder="Search by Seller Name"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 md:mt-0 mt-5 md:mr-5">
                <button
                  className="h-[38px] w-[93px] bg-custom-darkpurple text-white text-base	font-normal rounded-[8px] disabled:bg-custom-darkGrayColor/50"
                  disabled={search.length < 1}
                  onClick={() => {
                    getuserlist(currentPage, 10, "", search);
                    // setSelctDate("");
                    // setSelectedOptions([]);
                  }}
                >
                  Search
                </button>
                <button
                  className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px]"
                  onClick={() => {
                    setSearch("");
                    getuserlist();
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
            // maxWidth="md"
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

                {
                  <div className="flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
                    <div className="flex flex-col justify-start items-start md:pl-5 w-[50%]">
                      <div className="flex justify-between items-center w-full md:pt-0 pt-2">
                        <p className="text-sm font-normal text-gray-800">
                          Total Order
                        </p>
                        <p className="text-sm font-normal text-gray-800">
                          80
                        </p>
                      </div>
                      <div className="flex justify-between items-center w-full pt-2">
                        <p className="text-sm font-normal text-gray-800">
                          Total earning
                        </p>
                        <p className="text-sm font-normal text-gray-800">
                          150
                        </p>
                      </div>
                      <button
                        className="text-white bg-custom-darkpurple rounded w-36 h-[30px] mt-2"
                        onClick={() =>
                          router.push(
                            `/sellers-product?seller_id=${popupData?._id}`
                          )
                        }
                      >
                        Seller Products
                      </button>
                    </div>
                  </div>
                }
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

        <div className="">
          <Table
            columns={columns}
            data={sellersData}
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

export default isAuth(SellerEmployee);
