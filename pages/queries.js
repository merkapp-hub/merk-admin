import React, { useMemo, useState, useEffect } from "react";
import Table from "@/components/table";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import { RxCrossCircled } from "react-icons/rx";
import isAuth from "@/components/isAuth";

function Queries(props) {
  const router = useRouter();
  const [GetInTouchData, setGetInTouchData] = useState([]);
  const [filter, setFilter] = useState("");
  const [cond, setCond] = useState("");
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [selctDate, setSelctDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(10); // default limit
   const [pagination, setPagination] = useState({
     totalPages: 1,
     currentPage: 1,
     itemsPerPage: pageSize,
   });

  // useEffect(() => {
  //     getInTouch();
  // }, []);

  useEffect(() => {
    getInTouch(null, currentPage,pageSize);
  }, [currentPage,pageSize]);

  const getInTouch = async (selectedDate, page = 1, limit = 10, filter) => {
    const data = {};

    if (selectedDate) {
      data.curDate = moment(new Date(selectedDate)).format();
    }

    if (filter) {
      data.status = filter;
    }

    props.loader(true);

    Api(
      "post",
      `get-getInTouch?page=${page}&limit=${limit}`,
      data,
      router
    ).then(
      (res) => {
        props.loader(false);

        if (res?.status) {
          setGetInTouchData(res?.data);
          setPagination({
          ...res?.pagination,
          itemsPerPage: pageSize, // force override to match dropdown
        });
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateGetInTouch = async (id, type) => {
    props.loader(true);

    const status = {
      status: type,
    };

    Api("patch", `getInTouch/${id}`, status, router).then(
      (res) => {
        props.loader(false);

        if (res?.status) {
          props.toaster({
            type: "success",
            message: "Query updated successfully.",
          });
          getInTouch(null, currentPage);
          setviewPopup(false);
          setCond("");
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
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
          className={`${value === "pending"
              ? "text-red-500"
              : value === "processing"
                ? "text-yellow-600"
                : value === "resolved"
                  ? "text-green-500"
                  : value === "refunded"
                    ? "text-blue-500"
                    : value === "reissued"
                      ? "text-purple-500"
                      : value === "reinstated"
                        ? "text-orange-500"
                        : value === "returned"
                          ? "text-teal-500"
                          : value === "re-ordered"
                            ? "text-pink-500"
                            : "text-gray-500"
            } text-base font-normal text-center capitalize`}
        >
          {value}
        </p>
      </div>
    );
  }

  function type({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center">
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
            setviewPopup(true);
            setPopupData(row.original);
          }}
        >
          See
        </button>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      // {
      //   Header: "ID",
      //   accessor: "indexNo",
      //   Cell: indexID,
      // },
      {
        Header: "NAME",
        accessor: "first_name",
        Cell: name,
      },
      {
        Header: "E-mail",
        accessor: "email",
        Cell: email,
      },
      {
        Header: "Mobile",
        accessor: "phone",
        Cell: mobile,
      },
      {
        Header: "Reason",
        accessor: "reason",
        Cell: type,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: status,
      },
      {
        Header: "DATE",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "Queries",
        // accessor: "view",
        Cell: info,
      },
    ],
    [pagination]
  );

  return (
    <section className="w-full h-full bg-transparent md:pt-5 pt-5 pb-24 pl-5 pr-5">
      <p className=" text-gray-800 font-bold md:text-[32px] text-2xl">
        Quries
      </p>

      <div className="bg-white border mt-5 border-custom-lightGrayColor w-full md:h-[70px] rounded-[10px] md:py-0 py-5 md:px-0 px-5">
        <div className="md:grid md:grid-cols-10 grid-cols-1 w-full h-full ">
          {/* <div className="flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor">
            <img className="w-[20px] h-[23px]" src="/filterImg.png" />
          </div> */}
          <div className="flex md:justify-center justify-start items-center md:border-r md:border-r-custom-lightGrayColor md:pt-0 pt-5 md:pb-0 pb-3">
            <p className="text-gray-800 text-sm	font-bold">Filter By</p>
          </div>
          <div className="col-span-8 flex md:flex-row flex-col md:justify-between justify-start md:items-center items-start">
            <div className="flex items-center">
              <lable className="text-gray-800 md:pl-3 font-semibold text-sm">
                Date
              </lable>
              <input
                className="text-gray-800 pl-3"
                type="date"
                placeholder="Date"
                value={selctDate}
                onChange={(e) => {
                  setSelctDate(e.target.value);
                  getInTouch(e.target.value);
                }}
              />
              <select
                className="bg-white border border-custom-lightGrayColor rounded-[10px] h-[40px] w-[150px] md:ml-5 ml-3 text-base font-normal text-black outline-none"
                name="status"
                value={filter}
                onChange={(e) => {
                  getInTouch(null, currentPage, 10, e.target.value);
                  setFilter(e.target.value);
                }}
              >
                {/* refunded , reissued , reinstated , returned , re-ordered  */}
                <option value="">Select</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="refunded">Refunded</option>
                <option value="reissued">Reissued</option>
                <option value="reinstated">Reinstated</option>
                <option value="returned">Returned</option>
                <option value="re-ordered">Re-Ordered</option>
              </select>
            </div>
            <button
              className="h-[38px] w-[93px] bg-[#00000020] text-black text-base	font-normal rounded-[8px] md:mr-5 md:mt-0 mt-5"
              onClick={() => {
                getInTouch();
                setSelctDate("");
                setFilter("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {/* md:mt-9 */}
        {/* shadow-2xl */}

        {viewPopup && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
            <div className="relative w-[300px] md:w-[360px] h-auto  bg-white rounded-[15px] m-auto">
              <div
                className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
                onClick={() => setviewPopup(!viewPopup)}
              >
                <RxCrossCircled className="h-full w-full font-semibold " />
              </div>

              <div className="px-5 w-full py-3">
                <p className="text-center mt-2 font-semibold text-xl text-gray-800">
                  Query
                </p>
                <p className="text-base mt-3 pb-3 text-center font-bold text-custom-newGray max-h-40 overflow-y-auto scrollbar-hide">
                  {popupData.description}
                </p>
                <div className="flex items-center gap-3">
                  <select
                    className="w-full bg-white justify-center mx-auto border border-custom-lightGrayColor rounded h-[40px] text-base font-normal text-black outline-none mt-3"
                    name="status"
                    value={cond}
                    onChange={(e) => {
                      setCond(e.target.value);
                      // updateGetInTouch(popupData?._id, e.target.value);
                    }}
                  >
                    {/* refunded , reissued , reinstated , returned , re-ordered  */}
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="refunded">Refunded</option>
                    <option value="reissued">Reissued</option>
                    <option value="reinstated">Reinstated</option>
                    <option value="returned">Returned</option>
                    <option value="re-ordered">Re-Ordered</option>
                  </select>
                  <buton
                    onClick={() => updateGetInTouch(popupData?._id, cond)}
                    className="text-white bg-custom-darkpurple hover:bg-custom-darkpurple/90 px-5 py-2 rounded justify-center mx-auto grid w-32 cursor-pointer mt-3"
                  >
                    Update
                  </buton>
                </div>
                {/* {popupData.status !== "resolved" && (
                <div className="flex items-center gap-3">
                <buton onClick={()=>updateGetInTouch(popupData?._id, "resolved")} className="text-white bg-custom-darkpurple hover:bg-custom-darkpurple/90 px-5 py-2 rounded justify-center mx-auto grid w-48 cursor-pointer">
                  Resolved
                </buton>
                {popupData.status !== "processing" && (
                <buton onClick={()=>updateGetInTouch(popupData?._id, "processing")} className="text-white bg-custom-darkGrayColors hover:bg-custom-darkGrayColors/90 px-5 py-2 rounded justify-center mx-auto grid w-48 cursor-pointer">
                  Processing
                </buton>
                )}
                </div>
                )} */}
              </div>
            </div>
          </div>
        )}

        <div className="">
          <Table
            columns={columns}
            data={GetInTouchData}
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

export default isAuth(Queries);
