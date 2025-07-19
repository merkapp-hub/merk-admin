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
import Swal from "sweetalert2";

function Withdralreq(props) {
  const router = useRouter();
  const [withdrawData, setWithdrawData] = useState([]);
  const [sellerid, setsellerid] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    GetPendingWithdrawreq(currentPage);
  }, [currentPage]);

  const GetPendingWithdrawreq = async (page = 1, limit = 10) => {
    props.loader(true);
    Api("get", `getWithdrawreq?page=${page}&limit=${limit}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setWithdrawData(res?.data);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };
  const approvereq = (id, sellerid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to approve this payment ?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonText: "Approve",
    }).then(function (result) {
      console.log(result);
      if (result.isConfirmed) {
        const data = {
          id,
          seller_id: sellerid,
        };
        props.loader(true);
        Api("post", `updateWithdrawreq`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);

            GetPendingWithdrawreq();
            setsellerid(null);
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
  function note({ value }) {
    return (
      <div>
        <p className="text-gray-800 text-base font-normal text-center whitespace-normal">
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
          className="h-[38px] w-[93px] bg-green-500 text-white text-base	font-normal rounded-[8px]"
          onClick={() => {
            // setviewPopup(true)
            // console.log(row.original)
            approvereq(row.original._id, row.original.request_by._id);
            // setsellerid(row.original.request_by._id)
          }}
        >
          Approve
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
        accessor: "request_by.username",
        Cell: name,
      },
      {
        Header: "Mobile",
        accessor: "request_by.number",
        Cell: mobile,
      },
      {
        Header: "Status",
        accessor: "settle",
        Cell: status,
      },
      {
        Header: "Note",
        accessor: "note",
        Cell: note,
      },
      {
        Header: "Amount",
        accessor: "amount",
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
    <section  className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
      <p className="text-gray-800 font-bold md:text-[32px] text-2xl">
        Seller Withdrawal Request
      </p>
      {/* pl-2  */}
      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        <div className="">
          <Table
            columns={columns}
            data={withdrawData}
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

export default isAuth(Withdralreq);
