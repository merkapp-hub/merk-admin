// import React, { useMemo, useState, useEffect, use } from "react";
// import Table, { indexID } from "@/components/table";
// import { Api } from "@/services/service";
// import { useRouter } from "next/router";
// import moment from "moment";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/effect-fade";
// import isAuth from "@/components/isAuth";
// import { Dialog, Drawer } from "@mui/material";
// import { IoCloseCircleOutline } from "react-icons/io5";
// import Swal from "sweetalert2";
// import currencySign from "@/utils/currencySign";
// import ActivityList from "@/components/activityList";
// import HistoryList from "@/components/historyList";

// function Withdralreq(props) {
//   const router = useRouter();
//   const [withdrawData, setWithdrawData] = useState([]);
//   const [sellerid, setsellerid] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [viewPopup, setviewPopup] = useState(false);
//   const [viewPopupData, setviewPopupData] = useState({});
//   const [popupLimit, setpopupLimit] = useState(10);
//   const [pageSize, setPageSize] = useState(10);
//   const [pagination, setPagination] = useState({
//     totalPages: 1,
//     currentPage: 1,
//     itemsPerPage: 10,
//   });

//   useEffect(() => {
//     GetPendingWithdrawreq(currentPage);
//   }, [currentPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [pageSize]);

//   useEffect(() => {
//     GetPendingWithdrawreq(currentPage, pageSize);
//   }, [pageSize]);

//   const getOrderBySeller = async (id, data) => {
//     props.loader(true);
//     Api(
//       "get",
//       `getWithdrawreqbysellerId/${id}?limit=${popupLimit}`,
//       "",
//       router
//     ).then(
//       (res) => {
//         props.loader(false);
//         console.log("res================>", res);
//         setviewPopup(true);
//         // setviewPopupData({
//         //   ...viewPopupData,
//         //   history: res?.data,
//         // });
//         console.log("viewPopupData", {
//           ...viewPopupData,
//           ...data,
//           history: res?.data,
//         });
//         setviewPopupData({
//           ...data,
//           history: res?.data,
//         });
//       },
//       (err) => {
//         props.loader(false);
//         console.log(err);
//         props.toaster({ type: "error", message: err?.message });
//       }
//     );
//   };

//   const GetPendingWithdrawreq = async (page = 1, limit = 10) => {
//     props.loader(true);
//     Api("get", `getWithdrawreq?page=${page}&limit=${limit}`, "", router).then(
//       (res) => {
//         props.loader(false);
//         console.log("res================>", res);
//         setWithdrawData(res?.data);
//         setPagination(res?.pagination);
//       },
//       (err) => {
//         props.loader(false);
//         console.log(err);
//         props.toaster({ type: "error", message: err?.message });
//       }
//     );
//   };
//   const approvereq = (id, sellerid) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You want to approve this payment ?",
//       icon: "warning",
//       showCancelButton: true,
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Approve",
//       zindex: 9999,
//     }).then(function (result) {
//       console.log(result);
//       if (result.isConfirmed) {
//         const data = {
//           id,
//           seller_id: sellerid,
//         };
//         props.loader(true);
//         Api("post", `updateWithdrawreq`, data, router).then(
//           (res) => {
//             console.log("res================>", res.data?.meaasge);
//             props.loader(false);

//             GetPendingWithdrawreq();
//             setsellerid(null);
//             setviewPopup(false);
//             setviewPopupData({});
//             setpopupLimit(10);
//           },
//           (err) => {
//             props.loader(false);
//             console.log(err);
//             props.toaster({ type: "error", message: err?.data?.meaasge });
//             props.toaster({ type: "error", message: err?.meaasge });
//           }
//         );
//       } else if (result.isDenied) {
//         // setFullUserDetail({})
//       }
//     });
//   };

//   function indexID({ value }) {
//     return (
//       <div>
//         <p className="text-custom-black text-base font-normal text-center">
//           {value}
//         </p>
//       </div>
//     );
//   }

//   function name({ value }) {
//     return (
//       <div>
//         <p className="text-custom-black text-base font-normal text-center">
//           {value}
//         </p>
//       </div>
//     );
//   }
//   function note({ value }) {
//     return (
//       <div>
//         <p className="text-custom-black text-base font-normal text-center whitespace-normal">
//           {value}
//         </p>
//       </div>
//     );
//   }

//   function date({ value }) {
//     return (
//       <div>
//         <p className="text-custom-black text-base font-normal text-center">
//           {moment(value).format("DD MMM YYYY")}
//         </p>
//       </div>
//     );
//   }

//   function mobile({ value }) {
//     return (
//       <div>
//         <p className="text-custom-black text-base font-normal text-center">
//           {currencySign(value)}
//         </p>
//       </div>
//     );
//   }

//   function status({ value }) {
//     return (
//       <div>
//         <p
//           className={`text-custom-black text-base font-normal text-center 
//                      ${value == "Verified" ? "text-green-500" : ""}
//                      ${value == "Suspend" ? "text-red-500" : ""}
//                      ${value == "Pending" ? "text-yellow-500" : ""}
//                      `}
//         >
//           {value}
//         </p>
//       </div>
//     );
//   }

//   const info = ({ value, row }) => {
//     // console.log(row.original)
//     return (
//       <div className="flex gap-2 items-center justify-center">
//         <button
//           className="h-[38px] w-[93px] bg-custom-darkpurple text-white text-base	font-normal rounded-[8px]"
//           onClick={() => {
//             getOrderBySeller(row.original.request_by._id, row.original);
//             // setviewPopupData((prev) => ({
//             //   ...prev,
//             //   ...row.original,
//             // }));
//             // setviewPopup(true);
//             // // setviewPopupData(row.original);
//             // console.log(row.original);
//           }}
//         >
//           View
//         </button>
//         <button
//           className="h-[38px] w-[93px] bg-green-500 text-white text-base	font-normal rounded-[8px]"
//           onClick={() => {
//             // setviewPopup(true)
//             // console.log(row.original)
//             approvereq(row.original._id, row.original.request_by._id);
//           }}
//         >
//           Approve
//         </button>
//       </div>
//     );
//   };

//   const columns = useMemo(
//     () => [
//       {
//         Header: "No.",
//         accessor: (row, i) => i + 1,
//         Cell: indexID,
//       },
//       {
//         Header: "Name",
//         accessor: "request_by.username",
//         Cell: name,
//       },
//       {
//         Header: "Mobile",
//         accessor: "request_by.number",
//         Cell: mobile,
//       },
//       {
//         Header: "Status",
//         accessor: "settle",
//         Cell: status,
//       },
//       {
//         Header: "Note",
//         accessor: "note",
//         Cell: note,
//       },
//       {
//         Header: "Amount",
//         accessor: "amount",
//         Cell: mobile,
//       },
//       {
//         Header: "Info",
//         // accessor: "view",
//         accessor: (row) => row,
//         Cell: info,
//       },
//     ],
//     []
//   );

//   return (
//     <section className=" w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
//       <p className="text-custom-black font-bold md:text-[32px] text-2xl">
//         Seller Withdrawal Request
//       </p>
//       {/* pl-2  */}
//       {viewPopup && (
//         <Dialog
//           open={viewPopup}
//           onClose={() => {
//             setviewPopup(false);
//             setviewPopupData({});
//             setpopupLimit(2);
//           }}
//           //  maxWidth="md"
//           fullScreen
//         >
//           <div className="p-5  bg-white relative overflow-y-auto">
//             <IoCloseCircleOutline
//               className="text-black h-8 w-8 absolute right-2 top-2"
//               onClick={() => {
//                 setviewPopup(false);
//                 setviewPopupData({});
//                 setpopupLimit(2);
//               }}
//             />
//             <div className="md:flex justify-between border-b-2 border-b-gray-300 py-2">
//               <div className="">
//                 <div className="md:flex flex-row justify-start items-start">
//                   <div className="flex flex-col justify-start items-start md:pl-5">
//                     <p className="text-base font-bold text-custom-black md:pt-0 pt-2">
//                       {viewPopupData?.request_by?.username}
//                     </p>
//                     <p className="text-sm font-semibold text-custom-black pt-2">
//                       {viewPopupData?.request_by?.number}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="col-span-6 flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
//                 <div className="grid grid-cols-4 gap-x-4 w-full justify-between items-center md:pl-5">
//                   <div className="col-span-2 flex gap-2 justify-start items-center w-full">
//                     <p className="text-sm font-semibold text-gray-600">
//                       Withdrawal Date:
//                     </p>
//                     <p className="text-sm font-normal text-custom-black">
//                       {viewPopupData?.createdAt
//                         ? moment(viewPopupData?.createdAt).format("DD MMM YYYY")
//                         : "N/A"}
//                     </p>
//                   </div>
//                   <div className="col-span-2 flex gap-2 justify-start items-center w-full">
//                     <p className="text-sm font-semibold text-gray-600">
//                       Withdrawal Amount:
//                     </p>
//                     <p className="text-sm font-normal text-custom-black">
//                       {currencySign(viewPopupData?.amount?.toFixed(2))}
//                     </p>
//                   </div>
//                   <div className="col-span-2 flex gap-2 justify-start items-center w-full">
//                     <p className="text-sm font-semibold text-gray-600">
//                       Wallet Balance:
//                     </p>
//                     <p className="text-sm font-normal text-custom-black">
//                       {currencySign(
//                         viewPopupData?.request_by?.wallet?.toFixed(2)
//                       )}
//                     </p>
//                   </div>
//                   {/* <div className="col-span-2 flex gap-2 justify-start items-center w-full">
//                     <p className="text-sm font-semibold text-gray-600">
//                       Wallet Balance:
//                     </p>
//                     <p className="text-sm font-normal text-custom-black">
//                       {currencySign(viewPopupData?.wallet?.toFixed(2))}
//                     </p>
//                   </div> */}
//                 </div>
//               </div>

//               <div className="flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
//                 <div className="flex flex-col justify-start items-start md:pl-5 w-[50%]">
//                   <div className="flex justify-between items-center w-full md:pt-0 pt-2">
//                     {/* <p className="text-sm text-custom-black font-bold">
//                       Wallet Balance :{" "}
//                       <span className="text-custom-darkGrayColor">
//                         {viewPopupData?.numberPlate || "N/A"}
//                       </span>
//                     </p> */}
//                     <button
//                       className="h-[38px] w-[93px] bg-green-500 text-white text-base	font-normal rounded-[8px]"
//                       onClick={() => {
//                         // setviewPopup(true)
//                         // console.log(row.original)
//                         approvereq(
//                           viewPopupData?._id,
//                           viewPopupData?.request_by?._id
//                         );
//                       }}
//                     >
//                       Approve
//                     </button>
//                     {/* <p className="text-sm font-normal text-custom-black">Licences : {" "} <span>{viewPopupData?. }</span></p> */}
//                     {/* <p className="text-sm font-normal text-custom-black">Total Order</p>
//                                             <p className="text-sm font-normal text-custom-black">80</p> */}
//                   </div>
//                   <div className="flex justify-between items-center w-full pt-2">
//                     {/* <p className="text-sm font-normal text-custom-black">Total earning</p>
//                                             <p className="text-sm font-normal text-custom-black">150</p> */}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <p className="text-custom-black text-base font-bold pt-4">
//               Withdrawal Request Amount:{" "}
//               <span className="text-custom-darkGrayColor">
//                 {currencySign(viewPopupData?.amount?.toFixed(2))}
//               </span>
//             </p>
//             {/* Table */}
//             <div className="mt-5 w-full">
//               {/* <Table
//                 columns={columns}
//                 data={viewPopupData?.history || []}
//                 pagination={{
//                   totalPages: 1,
//                   currentPage: 1,
//                   itemsPerPage: 10,
//                 }}
//                 onPageChange={() => {}}
//                 currentPage={1}
//                 itemsPerPage={10}
//               /> */}
//               {viewPopupData?.history?.map((item, index) => (
//                 <HistoryList {...props} data={item} key={index} />
//               ))}

//               <button
//                 className="h-[38px] w-[110px] bg-custom-darkpurple text-white text-base	font-normal rounded-[8px] mt-5 justify-center items-center mx-auto block"
//                 onClick={() => {
//                   setpopupLimit(popupLimit + 10);
//                   getOrderBySeller(
//                     viewPopupData?.request_by?._id,
//                     viewPopupData
//                   );
//                 }}
//               >
//                 Load More
//               </button>
//             </div>
//           </div>
//         </Dialog>
//       )}
//       <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
//         <div className="">
//           <Table
//             columns={columns}
//             data={withdrawData}
//             pagination={pagination}
//             onPageChange={(page) => setCurrentPage(page)}
//             currentPage={currentPage}
//             itemsPerPage={pagination.itemsPerPage}
//             pageSize={pageSize}
//             setPageSize={setPageSize}
//           />
//         </div>
//       </section>
//     </section>
//   );
// }

// export default isAuth(Withdralreq);
