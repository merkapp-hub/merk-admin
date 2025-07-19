import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { FaCarSide } from "react-icons/fa";
import { Api } from "@/services/service";
import { Line } from "react-chartjs-2";
import Table from "@/components/table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import isAuth from "@/components/isAuth";
import LineChart from "@/components/LineChart";
import PieChart from "@/components/PieChart";
import currencySign from "@/utils/currencySign";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Home(props) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [pieData, setpieData] = useState([]);
  const [offerData, setOfferData] = useState([]);
  const [labels, setLables] = useState([]);
  const [opt, setOpt] = useState({});
  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  console.log(props);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "All Users",
      },
    },
  };

  useEffect(() => {
    // getUsers()
    // getPieChartData();
    // getoffer()
  }, []);

  const getStats = async () => {
    props.loader(true);
    Api("get", "getDashboardStats", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setData(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getSales = async () => {
    props.loader(true);
    Api("get", "getSalesStats", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setSalesData(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getPieChartData = async () => {
    props.loader(true);
    Api("get", "getTopProductSales", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setpieData(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getDailyTopSellingProduct = async () => {
    props.loader(true);
    Api("get", "getDailyTopSellingProduct", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setProducts(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  useEffect(() => {
    getStats();
    getSales();
    getPieChartData();
    // getDailyTopSellingProduct();
  }, []);

  const image = ({ value, row }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        {row.original &&
          row.original.varients &&
          row.original.varients.length > 0 && (
            <img
              className="h-[76px] w-[76px] rounded-[10px]"
              src={row.original.varients[0].image[0]}
            />
          )}
      </div>
    );
  };

  const productName = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const category = ({ row, value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const price = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const piece = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-gray-800 text-sm font-semibold">{value}</p>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Product Name",
        accessor: "productInfo.name",
        Cell: productName,
      },
      {
        Header: "Category",
        accessor: "productInfo.categoryName",
        Cell: category,
      },
      {
        Header: "Piece",
        accessor: "totalQty",
        Cell: price,
      },
      // {
      //     Header: "Sponsore Item",
      //     accessor: "sponsered",
      //     Cell: bestSeller,
      // },
      {
        Header: "Date",
        accessor: "date",
        Cell: piece,
      },
    ],
    [products]
  );

  return (
    <section className=" w-full h-full  bg-transparent md:pt-5 pt-5 pb-24 pl-5 pr-5">
      <div className="md:pt-[0px] pt-[0px] pb-10 sm:pb-0 h-full overflow-scroll no-scrollbar">
        <p className=" text-gray-800 font-bold md:text-[32px] text-2xl">
          Dashboard
        </p>
        {/* mt-5  */}
        {/* <div className="md:pb-10">
          <section className="bg-transparent md:px-5 md:py-5 py-5 h-full w-full">
            <div className="grid md:grid-cols-4 grid-cols-1 w-full gap-5">

              <div className="w-full bg-white boxShadow p-5 rounded-[20px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col justify-start items-start">
                    <p className="text-gray-800 text-base font-normal">Total User</p>
                    <p className="text-gray-800 md:text-[28px] text-xl font-bold pt-2">40,689</p>
                  </div>
                  <img className="md:w-[60px]  w-[50px] md:h-[60px] h-[50px]" src="/totalUserImg.png" />
                </div>
                <div className="md:pt-5 pt-3 flex justify-start items-center">
                  <img className="w-[20px] h-[12px] " src="/totalUserImg-1.png" />
                  <p className="text-base font-normal text-custom-green ml-3">8.5%<span className="text-gray-800 ml-2">Up from yesterday</span></p>
                </div>
              </div>

              <div className="w-full bg-white boxShadow p-5 rounded-[20px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col justify-start items-start">
                    <p className="text-gray-800 text-base font-normal">Total Profit</p>
                    <p className="text-gray-800 md:text-[28px] text-xl font-bold pt-2">10293</p>
                  </div>
                  <img className="md:w-[60px]  w-[50px] md:h-[60px] h-[50px]" src="/totalProfitImg.png" />
                </div>
                <div className="md:pt-5 pt-3 flex justify-start items-center">
                  <img className="w-[20px] h-[12px] " src="/totalUserImg-1.png" />
                  <p className="text-base font-normal text-custom-green ml-3">1.3%<span className="text-gray-800 ml-2">Up from past week</span></p>
                </div>
              </div>

              <div className="w-full bg-white boxShadow p-5 rounded-[20px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col justify-start items-start">
                    <p className="text-gray-800 text-base font-normal">Total transactions</p>
                    <p className="text-gray-800 md:text-[28px] text-xl font-bold pt-2">$89,000</p>
                  </div>
                  <img className="md:w-[60px]  w-[50px] md:h-[60px] h-[50px]" src="/totalTransactionsImg.png" />
                </div>
                <div className="md:pt-5 pt-3 flex justify-start items-center">
                  <img className="w-[20px] h-[12px] " src="/totalTransactionsImg-1.png" />
                  <p className="text-base font-normal text-custom-lightRed ml-3">4.3%<span className="text-gray-800 ml-2">Down from yesterday</span></p>
                </div>
              </div>

              <div className="w-full bg-white boxShadow p-5 rounded-[20px]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col justify-start items-start">
                    <p className="text-gray-800 text-base font-normal">Queries</p>
                    <p className="text-gray-800 md:text-[28px] text-xl font-bold pt-2">12599</p>
                  </div>
                  <img className="md:w-[60px]  w-[50px] md:h-[60px] h-[50px]" src="/queriesImg.png" />
                </div>
              </div>

            </div>
          </section>
        </div> */}

        <div className="flex flex-col w-full overflow-y-auto">
          <main>
            <div className="grid">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                  <div className="px-4">
                    <div className="mt-12">
                      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
                          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute -mt-4 grid h-12 w-12 place-items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                              className="w-6 h-6 text-white"
                            >
                              <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                              <path
                                fillRule="evenodd"
                                d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
                                clipRule="evenodd"
                              />
                              <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
                            </svg>
                          </div>
                          <div className="p-4 text-right">
                            <p className="block antialiased text-black text-sm leading-normal font-normal text-blue-gray-600">
                              Total transactions
                            </p>
                            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
                              {currencySign(data?.transactions?.total)}
                            </h4>
                          </div>
                          <div className="border-t border-blue-gray-50 p-4">
                            <p className="block antialiased text-black text-base leading-relaxed font-normal text-blue-gray-600">
                              <strong
                                className={`${parseFloat(data?.transactions?.change) > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                                  }`}
                              >
                                {data?.transactions?.change}
                              </strong>
                              &nbsp;than last week
                            </p>
                          </div>
                        </div>
                        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
                          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-pink-600 to-pink-400 text-white shadow-pink-500/40 shadow-lg absolute -mt-4 grid h-12 w-12 place-items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-6"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="p-4 text-right">
                            <p className="block antialiased text-black text-sm leading-normal font-normal text-blue-gray-600">
                              Total Orders
                            </p>
                            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
                              {data?.orders?.total}
                            </h4>
                          </div>
                          <div className="border-t border-blue-gray-50 p-4">
                            <p className="block antialiased text-black text-base leading-relaxed font-normal text-blue-gray-600">
                              <strong
                                className={`${parseFloat(data?.orders?.change) > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                                  }`}
                              >
                                {data?.orders?.change}
                              </strong>
                              &nbsp;than last month
                            </p>
                          </div>
                        </div>
                        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
                          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-12 w-12 place-items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                              className="w-6 h-6 text-white"
                            >
                              <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
                            </svg>
                          </div>
                          <div className="p-4 text-right">
                            <p className="block antialiased text-black text-sm leading-normal font-normal text-blue-gray-600">
                              Total{" "}
                              {props?.user?.type === "ADMIN"
                                ? "Users"
                                : "Employees"}
                            </p>
                            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
                              {data?.users?.total}
                            </h4>
                          </div>
                          <div className="border-t border-blue-gray-50 p-4">
                            <p className="block antialiased text-black text-base leading-relaxed font-normal text-blue-gray-600">
                              <strong
                                className={`${parseFloat(data?.users?.change) > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                                  }`}
                              >
                                {data?.users?.change}
                              </strong>
                              &nbsp;than last month
                            </p>
                          </div>
                        </div>
                        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
                          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-orange-500/40 shadow-lg absolute -mt-4 grid h-12 w-12 place-items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                              className="w-6 h-6 text-white"
                            >
                              <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                            </svg>
                          </div>
                          <div className="p-4 text-right">
                            <p className="block antialiased text-black text-sm leading-normal font-normal text-blue-gray-600">
                              Products
                            </p>
                            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
                              {data?.products?.total}
                            </h4>
                          </div>
                          <div className="border-t border-blue-gray-50 p-4">
                            <p className="block antialiased text-black text-base leading-relaxed font-normal text-blue-gray-600">
                              <strong
                                className={`${parseFloat(data?.products?.change) > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                                  }`}
                              >
                                {data?.products?.change}
                              </strong>
                              &nbsp;than last month
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="col-span-12 mt-2 grid gap-2 grid-cols-1 lg:grid-cols-2">
                  <div className="bg-white shadow-lg p-4" id="chartline">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Sales Overview
                    </h2>
                    <LineChart data={salesData} />
                  </div>
                  <div className="bg-white shadow-lg p-4" id="chartpie">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Top Products
                    </h2>
                    <PieChart data={pieData} />
                  </div>
                </div>

                {/* Top Selling Products */}
                {props?.user?.type === "SELLER" && (
                  <div className="col-span-12 mt-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Daily Top Selling Products
                    </h2>
                    <Table
                      columns={columns}
                      data={products}
                      pagination={pagination}
                      onPageChange={(page) => setCurrentPage(page)}
                      currentPage={currentPage}
                      itemsPerPage={pagination.itemsPerPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default isAuth(Home);
