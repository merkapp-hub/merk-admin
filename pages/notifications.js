import React, { useMemo, useState, useEffect, useRef, use } from "react";
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

function Notifications(props) {
  const router = useRouter();
  const [sellersData, setSellersData] = useState([]);
  const [sortValue, setSortValue] = useState("all");
  const [viewPopup, setviewPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(10); // default limit
   const [pagination, setPagination] = useState({
     totalPages: 1,
     currentPage: 1,
     itemsPerPage: pageSize,
   });
  const [selectedEmails, setSelectedEmails] = useState([]);
  const selectedEmailsRef = useRef([]);
  const sortValueData = useRef("all");

  useEffect(() => {
    selectedEmailsRef.current = selectedEmails;
  }, [selectedEmails]);

  useEffect(() => {
    getuserlist(currentPage,pageSize);
  }, [currentPage, sortValue,pageSize]);

  useEffect(() => {
    sortValueData.current = sortValue;
    console.log("sortValueData.current", sortValueData.current);
  }, [sortValue]);

  const handleClose = () => {
    setviewPopup(false);
  };

  const handleSelectAll = async () => {
    if (
      !Array.isArray(selectedEmailsRef.current) ||
      selectedEmailsRef.current.length === 0
    ) {
      props.loader(true);

      Api("get", `getuserlist/${sortValueData.current}?all=true`, "", router).then(
        (res) => {
          props.loader(false);
          console.log("res================>", res);
          setSelectedEmails(res.allUserIds || []);
          selectedEmailsRef.current = res.allUserIds || [];
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.message });
        }
      );
    } else {
      setSelectedEmails([]);
      selectedEmailsRef.current = [];
    }
  };

  const getuserlist = async (page = 1, limit = 10) => {
    props.loader(true);
    Api(
      "get",
      `getuserlist/${sortValue}?page=${page}&limit=${limit}`,
      "",
      router
    ).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setSellersData(res.data);
        setPagination({
          ...res?.pagination,
          itemsPerPage: pageSize, // force override to match dropdown
        });
        setSelectedEmails([]);
        selectedEmailsRef.current = [];
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handleSendNotification = async () => {
    setviewPopup(true);
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    handleSelectAll();
    setviewPopup(false);
    props.toaster({
      type: "success",
      message: "Please wait notification is sending",
    });

    const title = e.target.title.value;
    const description = e.target.description.value;
    let data = {
      title: title,
      description: description,
    };

    if (selectedEmails) {
      data = {
        ...data,
        userIds: selectedEmails,
      };
    }
    // props.loader(true);
    Api("post", `sendNotification`, data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        // setSelectedEmails(res.allUserIds || []);
        // selectedEmailsRef.current = res.allUserIds || [];
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

  function status({ row }) {
    const value = row.original?.status;
    console.log(row);

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
      <div className="flex items-center justify-center">
        <button
          className="h-[38px] px-3 bg-[#FE3E0020] text-custom-red text-sm	font-normal rounded-[8px]"
          onClick={() => {
            setviewPopup(true);
            setSelectedEmails([row.original.email]);
            // selectedEmailsRef.current = [row.original.email];
          }}
        >
          Send Notification
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
      //   {
      //     Header: "Status",
      //     accessor: "status",
      //     Cell: status,
      //   },
      {
        Header: "Action",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );

  return (
    <section className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
      <p className="text-gray-800 font-bold  md:text-[32px] text-2xl">
        Notifications
      </p>
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        <div className="flex gap-5 justify-between items-center pt-5">
          <div className="flex items-center h-[38px] w-auto px-3 text-black text-base font-normal rounded-[8px] mt-1">
            Select User Type:
            <select
              value={sortValue}
              onChange={(e) => setSortValue(e.target.value)}
              className="bg-transparent border border-custom-darkpurple p-2 rounded-md text-gray-800 outline-none font-normal text-base ml-2"
            >
              <option value="all">All</option>
              <option value="users">Customers</option>
              <option value="sellers">Sellers</option>
              <option value="drivers">Drivers</option>
            </select>
          </div>

          <button
            disabled={selectedEmails.length === 0}
            onClick={handleSendNotification}
            className="h-[38px] w-auto px-3 bg-custom-darkpurple text-white text-base	font-normal rounded-[8px] mt-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send Notification
          </button>
        </div>

        {viewPopup && (
          <Dialog open={viewPopup} onClose={handleClose} maxWidth="md">
            <div className="max-w-xl bg-white relative overflow-hidden overflow-y-scroll scrollbar-hide">
              <IoCloseCircleOutline
                className="text-black h-8 w-8 absolute right-2 top-2 cursor-pointer"
                onClick={handleClose}
              />
              <form
                onSubmit={sendNotification}
                className="flex w-full flex-col border rounded-lg bg-white p-8"
              >
                <h2 className="title-font mb-1 text-lg font-semibold text-gray-900">
                  Send Notification
                </h2>
                <p className="mb-5 leading-relaxed text-gray-600">
                  Write your message here. It will be sent to the selected
                  users.
                </p>
                <div className="mb-4">
                  <label
                    for="title"
                    className="text-sm leading-7 text-gray-600"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-custom-darkpurple focus:ring-2 focus:ring-violet-200"
                  />
                </div>
                <div className="mb-4">
                  <label
                    for="description"
                    className="text-sm leading-7 text-gray-600"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="h-32 w-full resize-none rounded border border-gray-300 bg-white py-1 px-3 text-base leading-6 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-custom-darkpurple focus:ring-2 focus:ring-violet-200"
                  ></textarea>
                </div>
                <button type="submit" className="rounded border-0 bg-custom-darkpurple border-custom-darkpurple py-2 px-6 text-lg text-white hover:bg-violet-950 focus:outline-none">
                  Send
                </button>
              </form>
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
            itemsPerPage={pagination?.itemsPerPage}
            enableRowSelect={true}
            pageSize={pageSize}
            setPageSize={setPageSize}
            handleSelectAll={handleSelectAll}
          />
        </div>
      </section>
    </section>
  );
}

export default isAuth(Notifications);
