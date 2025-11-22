import React, { useMemo, useState, useEffect } from "react";
import Table, { indexID } from "@/components/table";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import isAuth from "@/components/isAuth";
import { Drawer } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import currencySign from "@/utils/currencySign";

function Cashreceive(props) {
  const router = useRouter();
  const [driverData, setDriverData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [walletamount, setwalletamount] = useState(null);
  const [driverid, setdriverid] = useState("");
  const [openCart, setOpenCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const closeDrawer = async () => {
    setOpenCart(false);
  };

  useEffect(() => {
    getDriverList(currentPage);
  }, [currentPage]);

  const getDriverList = async (page = 1, limit = 10) => {
    props.loader(true);
    Api("get", `getdriveramount?page=${page}&limit=${limit}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setDriverData(res?.data);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };
  const getdriverpendingamount = async (id) => {
    props.loader(true);
    Api("get", `getdriverpendingamount/${id}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res.status) {
          setOrdersData(res.data);
          setOpenCart(true);
        }
        // setDriverData(res?.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };
  const collectcash = async (id) => {
    props.loader(true);
    Api("get", `collectcash/${id}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res.status) {
          setOpenCart(false);
          getDriverList();
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateStatus = async (id, status) => {
    props.loader(true);
    Api("post", "updateStatus", { id, status }, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        getDriverList();
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
            // setviewPopup(true)
            getdriverpendingamount(row.original._id);
            setdriverid(row.original._id);
            setwalletamount(row.original.wallet);
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
        Header: "Wallet",
        accessor: "wallet",
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
    <section className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      <p className="text-gray-800 font-bold md:text-[32px] text-2xl">
        Driver Cash Receive
      </p>
      {/* pl-2  */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        <Drawer
          className=""
          open={openCart}
          onClose={closeDrawer}
          anchor={"right"}
        >
          <div className="w-[380px] relative cursor-pointer">
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

              {ordersData &&
                ordersData.length > 0 &&
                ordersData?.map((mainitem, i) => (
                  <div
                    className="w-full border-[1px] border-black rounded-lg  mb-[10px]"
                    key={i}
                  >
                    {mainitem?.productDetail?.map((item) => (
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

                          <div className="flex justify-start items-center gap-1">
                            <p className="text-[#1A1A1A70] text-xs font-normal mr-2">
                              Quantaty:
                            </p>
                            <p className="text-black text-base font-normal">
                              {item?.qty}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-start items-center">
                          <p className="text-black text-xs font-normal pt-5">
                            {currencySign(item?.total) ||
                              currencySign(item?.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div>
                      <div className="h-[1px] bg-black mb-[10px]"></div>
                      <div className="flex justify-between items-center text-black text-xs font-semibold px-[30px] mb-[10px]">
                        <div>Total</div>
                        <div>{currencySign(mainitem?.total)}</div>
                      </div>
                    </div>
                  </div>
                ))}

              <div className="mt-5 !z-50 fixed bottom-0  flex flex-col justify-center items-center ">
                <button
                  className="bg-custom-darkpurple !w-[270px] h-[50px] rounded-[60px] text-white text-lg font-bold flex justify-center items-center mb-5 ml-[40px]"
                  onClick={() => collectcash(driverid)}
                >
                  {/* ${walletamount} */}
                  Cash collected
                </button>
              </div>
            </div>
          </div>
        </Drawer>

        <div className="">
          <Table
            columns={columns}
            data={driverData}
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

export default isAuth(Cashreceive);
