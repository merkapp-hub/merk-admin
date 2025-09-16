import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";
import { FaEye } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { IoFilterOutline } from "react-icons/io5";
import currencySign from "@/utils/currencySign";

function Inventory(props) {
  const router = useRouter();
  const [productsList, setProductsList] = useState([]);
  const [user, setUser] = useContext(userContext);

  const [selectedNewSeller, setSelectedNewSeller] = useState([]);
  const [popupData, setPopupData] = useState({});
  const [viewPopup, setviewPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    if (user?._id) {
      getProduct(currentPage);
    }
  }, [user, currentPage]);

  const getProduct = async (page = 1, limit = 10) => {
    props.loader(true);
    let url;
    if (user?.role === "admin") {
      url = `getProduct?page=${page}&limit=${limit}`;
      
      Api("get", url, router).then(
        (res) => {
          handleProductResponse(res);
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.message });
        }
      );
    } else if (user?.role === "seller") {
      // Use the new endpoint for sellers
      url = `getSellerProducts?seller_id=${user?._id}&page=${page}&limit=${limit}`;
      
      Api("get", url, router).then(
        (res) => {
          handleProductResponse(res);
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.message });
        }
      );
    }
  };

  const handleProductResponse = (res) => {
    props.loader(false);
  

    if (res.data && Array.isArray(res.data)) {
      setProductsList(res.data);
      
      const selectednewIds = res.data
        .filter(f => f.sponsered && f._id)
        .map(f => f._id);
        
      console.log("Sponsored product IDs:", selectednewIds);
      setSelectedNewSeller(selectednewIds);
      setPagination(res?.pagination);
    } else {
      console.log("No products found or invalid response format");
      setProductsList([]);
      setSelectedNewSeller([]);
    }
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
      <p className="text-black text-base font-normal">{row.original?.category?.name || 'N/A'}</p>
    </div>
  );
};

  const price = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
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
      <div className="p-4 flex flex-col items-center justify-center">
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
      <div className="bg-custom-offWhiteColor flex items-center  justify-evenly  border border-custom-offWhite rounded-[10px] mr-[10px]">
        <div
          className="py-[10px] w-[50%] items-center flex justify-center cursor-pointer"
          onClick={() => {
            router.push(`add-product?id=${row.original._id}`);
          }}
        >
          <FiEdit className="text-[22px]  " />
        </div>
        <div className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center">
          <RiDeleteBinLine
            className="text-[red] text-[24px] cursor-pointer"
            onClick={() => deleteProduct(row.original._id)}
          />
        </div>
      </div>
    );
  };

  const actionHandler2 = ({ value, row }) => {
    return (
      <div className="bg-custom-offWhiteColor flex items-center  justify-evenly  border border-custom-offWhite rounded-[10px] mr-[10px]">
        <div
          className="py-[10px] w-[50%] items-center flex justify-center cursor-pointer"
          onClick={() => {
            router.push(`add-product?id=${row.original._id}`);
          }}
        >
          <FiEdit className="text-[22px]  " />
        </div>
        <div className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center">
          <RiDeleteBinLine
            className="text-[red] text-[24px] cursor-pointer"
            onClick={() => deleteProduct(row.original._id)}
          />
        </div>
        <div className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center">
          <FaEye
            className="text-black text-[24px] cursor-pointer"
            onClick={() => {
              setPopupData(row.original);
              setviewPopup(true);
            }}
          />
        </div>
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
        accessor: "price_slot[0].Offerprice",
        Cell: price,
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
      {
        Header: "Available Color",
        accessor: "varients",
        Cell: availableColor,
      },
      {
        Header: "ACTION",
        Cell: actionHandler,
      },
    ],
    [selectedNewSeller]
  );

  const columns1 = useMemo(
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
       accessor: "price_slot[0].Offerprice",
        Cell: price,
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
      {
          Header: "Available Color",
          accessor: "varients",
          Cell: availableColor,
      },
      {
        Header: "ACTION",
        Cell: actionHandler2,
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
    <div className="w-full h-full bg-transparent pt-1 pb-5 pl-5 pr-5">
      {/* pb-[120px] */}
      {viewPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
          <div className="relative w-[300px] md:w-[360px] h-auto  bg-white rounded-[15px] m-auto">
            <div
              className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
              onClick={() => setviewPopup(!viewPopup)}
            >
              <RxCrossCircled className="h-full w-full font-semibold " />
            </div>

            <div className="px-5 py-10">
              <div className=" w-full flex gap-2 pb-5">
                <img
                  src={popupData?.varients[0].image[0]}
                  className="h-[76px] w-[76px] rounded-[10px]"
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
              </div>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={popupData?.sponsered}
                      onChange={(e, sponsered) => {
                        setPopupData({ ...popupData, sponsered });
                      }}
                    />
                  }
                  label="is sponsered?"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={popupData?.is_verified}
                      onChange={(e, is_verified) => {
                        setPopupData({ ...popupData, is_verified });
                      }}
                    />
                  }
                  label="is verified?"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={popupData?.is_quality}
                      onChange={(e, is_quality) => {
                        setPopupData({ ...popupData, is_quality });
                      }}
                    />
                  }
                  label="is quality?"
                />
              </FormGroup>

              <div className="flex flex-row justify-start items-start pt-5 gap-5">
                <button
                  className="text-white text-lg font-bold w-full h-[50px] rounded-[12px] bg-custom-darkpurple"
                  onClick={() => {
                    addNewItem();
                  }}
                >
                  Submit
                </button>

                <button
                  className="text-white text-lg font-bold w-full h-[50px] rounded-[12px] bg-custom-darkRed"
                  onClick={() => suspendProduct(popupData?._id)}
                >
                  Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="md:pt-[0px] pt-[0px] h-full">
        <p className="text-black font-bold md:text-[32px] text-2xl">
          Inventory
        </p>
        {/* mt-3 */}
        <div className="bg-white h-full pt-5 md:pb-32 pb-28  px-5  rounded-[12px] overflow-scroll md:mt-5 mt-5">
          <div className="">
            <div className="flex md:flex-row flex-col md:justify-end md:items-end gap-3">
              <button
                className="text-white bg-custom-yellow px-5 py-2 rounded"
                onClick={() => router.push("/add-product")}
              >
                Add Product
              </button>

              {/* <button
                className="text-white bg-custom-yellow px-5 py-2 rounded capitalize"
                onClick={() => router.push("/upload-product-from-file")}
              >
                Add inventory from excel
              </button> */}
            </div>

            <Table
              columns={user?.type === "SELLER" ? columns : columns1}
              data={productsList}
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              itemsPerPage={pagination.itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Inventory);
