import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { userContext } from "../_app";
import isAuth from "@/components/isAuth";
import { FaEye } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { IoFilterOutline } from "react-icons/io5";
import currencySign from "@/utils/currencySign";
import moment from "moment";

function SellerInventory(props) {
  const router = useRouter();
  const [productsList, setProductsList] = useState([]);
  const [user, setUser] = useContext(userContext);

  const [selectedNewSeller, setSelectedNewSeller] = useState([]);
  const [popupData, setPopupData] = useState({});
  const [viewPopup, setviewPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default limit
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: pageSize,
  });

  const [searchText, setSearchText] = useState("");
  
  useEffect(() => {
    // Whenever pageSize changes, reset page to 1
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (user?._id) {
      console.log("Fetching products for page:", currentPage, "pageSize:", pageSize); // Debug log
      getProduct(currentPage, pageSize);
    }
  }, [user, searchText, currentPage, pageSize]); 


const getProduct = async (page = 1, limit = 10) => {
  console.log("API call with page:", page, "limit:", limit);
  props.loader(true);
  
  let url = "";
  
  if (user?.role === "admin") {
    url = `getSellerProductByAdmin?page=${page}&limit=${limit}`;
  } else if (user?.role === "seller") {
    url = `getSellerProductByAdmin?seller_id=${user?._id}&page=${page}&limit=${limit}`;
  } else {
    console.error("Invalid user type:", user?.role);
    props.loader(false);
    props.toaster({ type: "error", message: "Invalid user type" });
    return;
  }

  if (searchText.trim() !== "") {
    url += `&search=${encodeURIComponent(searchText.trim())}`;
  }

  console.log("Final URL:", url);

  Api("get", url, router).then(
    (res) => {
      props.loader(false);
      console.log("res================>", res);

    
      if (res && res.data && Array.isArray(res.data)) {
        setProductsList(res.data);
        
        const selectednewIds = res.data.filter(f => f.sponsered && f._id).map(f => f._id);
        setSelectedNewSeller(selectednewIds);
        
        // Handle pagination properly
        if (res.pagination) {
          setPagination({
            ...res.pagination,
            itemsPerPage: pageSize, 
          });
        } else {
          // Default pagination if not provided
          setPagination({
            totalItems: res.data.length,
            totalPages: Math.ceil(res.data.length / pageSize),
            currentPage: page,
            itemsPerPage: pageSize,
          });
        }
      } else {
        console.error("Invalid response data:", res);
        setProductsList([]);
        setPagination({
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: pageSize,
        });
      }
    },
    (err) => {
      props.loader(false);
      console.log("API Error:", err);
      
      // Handle error properly
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      props.toaster({ type: "error", message: errorMessage });
      
      // Set empty state
      setProductsList([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: pageSize,
      });
    }
  );
};

  const deleteProduct = (_id) => {
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
        };

        Api("delete", `deleteProduct/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);

            if (res?.status) {
              getProduct();
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

  const addNewItem = async () => {
    const { _id, sponsered, is_verified, is_quality } = popupData;
    const data = {
      sponsered,
      is_verified,
      is_quality,
      id: _id,
    };
    props.loader(true);
    Api("post", "updateProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res.status) {
          props.toaster({
            type: "success",
            message: "Item updated successfully",
          });
          setPopupData({});
          setviewPopup(false);
          getProduct();
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const image = ({ value, row }) => {
    return (
      <div className="flex items-center justify-center">
        {row.original &&
          row.original.varients &&
          row.original.varients.length > 0 && (
            <img
              className="h-[60px] w-[60px] rounded-[10px]"
              src={row.original.varients[0].image[0]}
            />
          )}
      </div>
    );
  };

  const productName = ({ value }) => {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

const category = ({ row, value }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-black text-base font-normal">
        {row.original.category?.name || 'N/A'}
      </p>
    </div>
  );
};

  const seller = ({ row, value }) => {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const price = ({ value }) => {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">
          {currencySign(value)}
        </p>
      </div>
    );
  };

  const bestSeller = ({ value, row }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        <input
          className="h-5 w-5 text-black"
          type="checkbox"
          checked={selectedNewSeller.includes(row?.original?._id)}
          onChange={(e) => {
            console.log(e);
            console.log(selectedNewSeller);
            if (!selectedNewSeller.includes(row?.original?._id)) {
              selectedNewSeller.push(row?.original?._id);
              setSelectedNewSeller([...selectedNewSeller]);
              addNewItem(row?.original?._id, true);
            } else {
              const newData = selectedNewSeller.filter(
                (f) => f !== row?.original?._id
              );
              console.log(newData);
              setSelectedNewSeller(newData);
              addNewItem(row?.original?._id, false);
            }
          }}
        />
      </div>
    );
  };

  const piece = ({ value }) => {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-gray-800 text-sm font-semibold">63</p>
      </div>
    );
  };

  const availableColor = ({ value }) => {
    return (
      <div className="p-4 flex  items-center justify-center gap-2">
        {value.map((item, i) => (
          <p
            key={i}
            className=" text-base font-normal  rounded-full h-5 w-5 border border-black"
            style={{ background: item?.color }}
          ></p>
        ))}
      </div>
    );
  };

  const actionHandler = ({ value, row }) => {
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
      {
        Header: "Image",
        accessor: "username",
        Cell: image,
      },
      {
        Header: "Product Name",
        accessor: "name",
        Cell: productName,
      },
      {
        Header: "Category",
       accessor: "category.name",
        Cell: category,
      },
      {
        Header: "Price",
      accessor: "price_slot[0].price",
        Cell: price,
      },
      {
        Header: "Seller",
        accessor: "userid.username",
        Cell: seller,
      },
      // {
      //     Header: "Sponsore Item",
      //     accessor: "sponsered",
      //     Cell: bestSeller,
      // },
      // {
      //     Header: "Piece",
      //     accessor: "pieces",
      //     Cell: piece,
      // },
      //   {
      //     Header: "Available Color",
      //     accessor: "varients",
      //     Cell: availableColor,
      //   },
      {
        Header: "Other",
        Cell: actionHandler,
      },
    ],
    [selectedNewSeller]
  );

  const suspendProduct = async (productId) => {
    try {
      props.loader(true);

      Api("post", `suspend/${productId}`, null, router).then((res) => {
        console.log("res================>", res.data);
        props.loader(false);

        if (res?.status) {
          props.toaster({
            type: "success",
            message: "Item Suspended successfully",
          });
          setviewPopup(false);
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      });
    } catch (error) {
      props.loader(false);
      console.error("Error suspending product:", error);
      props.toaster({
        type: "error",
        message: "An error occurred while suspending the product.",
      });
    }
  };

  return (
    <div className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      {/* pb-[120px] */}
      {viewPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
          <div className="relative w-[300px] md:w-[450px] h-auto  bg-white rounded-[15px] m-auto">
            <div
              className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
              onClick={() => setviewPopup(!viewPopup)}
            >
              <RxCrossCircled className="h-full w-full font-semibold " />
            </div>

            <div className="px-5 py-10">
              {/* <div className=" w-full flex gap-2 pb-5">
                <img
                  src={popupData?.varients[0].image[0]}
                  className="h-[60px] w-[60px] rounded-[10px]"
                />
                <div className="col-span-2 w-full flex flex-col justify-start items-start">
                  <p className="text-base font-bold text-black">
                    {popupData?.name}
                  </p>
                  <p className="text-base font-semibold text-black pt-2">
                    {popupData?.email}
                  </p>
                  <p className="text-sm font-semibold text-black pt-2">
                    {popupData?.number}
                  </p>
                </div>
              </div> */}

              <div className="bg-white overflow-hidden">
                <div className="p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Manufacturer Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {popupData?.manufacturername}
                      </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Manufacturer Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {popupData?.manufactureradd}
                      </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Expiry Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {moment(popupData?.expirydate).format("YYYY-MM-DD")}
                      </dd>
                    </div>
                    <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Short Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {popupData?.short_description}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* <div className="mx-auto max-w-screen-lg">
                <div className="divide-y divide-stone-100 overflow-hidden rounded-lg border border-indigo-200 bg-white shadow-sm">
                  <details className="group" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-lg font-medium text-indigo-900 group-open:bg-indigo-50">
                      Is it possible to live on Mars?
                      <div className="text-indigo-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="block h-5 w-5 transition-all duration-300 group-open:rotate-180"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </summary>
                    <div className="border-t border-t-stone-100 dark:border-t-stone-700 p-4 text-indigo-500">
                      While it's not currently possible, scientists and space
                      agencies are working on technologies to make human
                      habitation on Mars a reality in the future. Significant
                      challenges like radiation protection, sustainable food and
                      water supplies, and creating a breathable atmosphere need
                      to be overcome.
                    </div>
                  </details>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-lg font-medium text-indigo-900 group-open:bg-indigo-50">
                      How long would it take to travel to Mars?
                      <div className="text-indigo-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="block h-5 w-5 transition-all duration-300 group-open:rotate-180"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </summary>
                    <div className="border-t border-t-stone-100 dark:border-t-stone-700 p-4 text-indigo-500">
                      Using current technology, a one-way trip to Mars would
                      take about 6-8 months. The exact duration depends on the
                      positions of Earth and Mars in their orbits, as well as
                      the propulsion technology used for the spacecraft.
                    </div>
                  </details>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-lg font-medium text-indigo-900 group-open:bg-indigo-50">
                      What are the main challenges of living on Mars?
                      <div className="text-indigo-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="block h-5 w-5 transition-all duration-300 group-open:rotate-180"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </summary>
                    <div className="border-t border-t-stone-100 dark:border-t-stone-700 p-4 text-indigo-500">
                      The main challenges include: protecting against harmful
                      radiation, creating a sustainable food and water supply,
                      generating breathable air, dealing with extreme
                      temperature fluctuations, maintaining physical and mental
                      health in a low-gravity environment, and overcoming
                      communication delays with Earth.
                    </div>
                  </details>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}

      <div className="md:pt-[0px] pt-[0px] h-full">
        <p className="text-black font-bold md:text-[32px] text-2xl">
          Seller Products
        </p>
        <div className="flex items-center justify-between mb-2 gap-3 mt-5">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by product, category or seller"
              className="border border-gray-300 text-black rounded-[8px] px-4 py-2 pr-12 w-full focus:outline-none "
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {/* Filter icon */}
            <img
              src="/filterImg.png" // Replace with your actual filter icon path
              alt="Filter"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => console.log('Open filter modal')}
            />
          </div>
        </div>
        <div className="px-2  md:pb-44 pb-28 bg-white h-full rounded-[12px] overflow-auto ">
          <div className="">


            <Table
              columns={columns}
              data={productsList}
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
            // itemsPerPage={pagination.itemsPerPage}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default isAuth(SellerInventory);
