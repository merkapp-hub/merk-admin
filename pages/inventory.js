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
          console.log("res================> form data :: ", res);
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
    // Get image from variants first, then from images array, then fallback to placeholder
    let imageUrl = null;
    
    if (row.original?.varients && row.original.varients.length > 0 && row.original.varients[0]?.image?.[0]) {
      imageUrl = row.original.varients[0].image[0];
    } else if (row.original?.images && row.original.images.length > 0) {
      imageUrl = row.original.images[0];
    } else if (row.original?.image) {
      imageUrl = row.original.image;
    }
    
    return (
      <div className="p-4 flex items-center justify-center">
        {imageUrl ? (
          <img
            className="h-[76px] w-[76px] rounded-[10px] object-cover"
            src={imageUrl}
            alt="Product"
          />
        ) : (
          <div className="h-[76px] w-[76px] rounded-[10px] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
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

  const price = ({ row }) => {
    const priceSlot = row.original?.price_slot?.[0];
    const variants = row.original?.varients || [];
    
    // If price_slot is empty and variants exist, use variant price
    if (!priceSlot && variants.length > 0) {
      const firstVariant = variants[0];
      const variantPrice = firstVariant?.Offerprice > 0 ? firstVariant.Offerprice : firstVariant?.price;
      
      return (
        <div className="p-4 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <span className="text-black text-base font-medium">
              {currencySign(variantPrice || 0)}
            </span>
            {firstVariant?.Offerprice > 0 && firstVariant?.price > 0 && (
              <span className="text-gray-500 text-sm line-through">
                {currencySign(firstVariant.price)}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    // Otherwise use price_slot as before
    const showOfferPrice = priceSlot?.Offerprice > 0;
    const displayPrice = showOfferPrice ? priceSlot.Offerprice : (priceSlot?.price || 0);
    
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="text-black text-base font-medium">
            {currencySign(displayPrice)}
          </span>
          {showOfferPrice && priceSlot?.price > 0 && (
            <span className="text-gray-500 text-sm line-through">
              {currencySign(priceSlot.price)}
            </span>
          )}
        </div>
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
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl my-8">
            {/* Close Button */}
            <div
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-black cursor-pointer z-10"
              onClick={() => setviewPopup(false)}
            >
              <RxCrossCircled className="h-6 w-6" />
            </div>

            {/* Product Details */}
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-3">
                Product Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Images */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Product Images</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Show images from images array */}
                    {popupData?.images && popupData.images.length > 0 ? (
                      popupData.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                      ))
                    ) : null}
                    
                    {/* Show images from variants */}
                    {popupData?.varients && popupData.varients.length > 0 ? (
                      popupData.varients.map((variant, vIdx) =>
                        variant?.image && Array.isArray(variant.image) ? (
                          variant.image.map((img, iIdx) => (
                            <img
                              key={`v-${vIdx}-${iIdx}`}
                              src={img}
                              alt={`Variant ${vIdx + 1}`}
                              className="w-full h-40 object-cover rounded-lg border"
                            />
                          ))
                        ) : null
                      )
                    ) : null}
                    
                    {/* If no images at all */}
                    {(!popupData?.images || popupData.images.length === 0) && 
                     (!popupData?.varients || popupData.varients.length === 0 || 
                      !popupData.varients.some(v => v.image && v.image.length > 0)) && (
                      <div className="col-span-2 text-center text-gray-500 py-8">
                        No images available
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      <p><span className="font-semibold">Name:</span> {popupData?.name || 'N/A'}</p>
                      <p><span className="font-semibold">Slug:</span> {popupData?.slug || 'N/A'}</p>
                      <p><span className="font-semibold">Category:</span> {popupData?.category?.name || 'N/A'}</p>
                      <p><span className="font-semibold">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          popupData?.status === 'verified' ? 'bg-green-100 text-green-800' : 
                          popupData?.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {popupData?.status || 'N/A'}
                        </span>
                      </p>
                      <p><span className="font-semibold">Verified:</span> {popupData?.is_verified ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Stock & Sales</h3>
                    <div className="space-y-2 text-sm text-gray-700 bg-blue-50 p-3 rounded">
                      <p><span className="font-semibold">Available Stock:</span> 
                        {popupData?.varients && popupData.varients.length > 0 
                          ? (() => {
                              const totalVariantStock = popupData.varients.reduce((sum, v) => sum + (v.stock || 0), 0);
                              return totalVariantStock > 0 ? totalVariantStock : (popupData?.stock || 0);
                            })()
                          : (popupData?.stock || 0)
                        }
                      </p>
                      <p><span className="font-semibold">Sold Pieces:</span> {popupData?.sold_pieces || 0}</p>
                    </div>
                  </div>

                  {/* Pricing - Only if price_slot exists and has data */}
                  {popupData?.price_slot && popupData.price_slot.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Pricing</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        {popupData.price_slot.map((slot, idx) => (
                          <div key={idx} className="bg-green-50 p-3 rounded">
                            <p><span className="font-semibold">Price:</span> ${slot?.price || 0}</p>
                            {slot?.Offerprice > 0 && (
                              <p><span className="font-semibold">Offer Price:</span> ${slot.Offerprice}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {popupData?.short_description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-700">
                      {popupData.short_description}
                    </p>
                  </div>
                </div>
              )}

              {/* Variants */}
              {popupData?.varients && popupData.varients.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Variants ({popupData.varients.length})</h3>
                  <div className="space-y-3">
                    {popupData.varients.map((variant, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <p className="font-semibold mb-3 text-gray-700">Variant #{idx + 1}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                          {variant?.color && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Color:</span>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded border border-gray-300" 
                                  style={{ backgroundColor: variant.color }}
                                ></div>
                                <span>{variant.color}</span>
                              </div>
                            </div>
                          )}
                          <p><span className="font-semibold">Price:</span> ${variant?.price || 0}</p>
                          {variant?.Offerprice > 0 && (
                            <p><span className="font-semibold">Offer Price:</span> ${variant.Offerprice}</p>
                          )}
                          
                          {/* Stock - Show if available */}
                          {variant?.stock !== undefined && (
                            <p className="col-span-2">
                              <span className="font-semibold">Stock:</span> 
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                variant.stock > 10 ? 'bg-green-100 text-green-800' : 
                                variant.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {variant.stock} units
                              </span>
                            </p>
                          )}
                          
                          {variant?.selected && variant.selected.length > 0 && (
                            <div className="col-span-2">
                              <p className="font-semibold mb-1">Parameters:</p>
                              {variant.selected.map((param, pIdx) => (
                                <p key={pIdx} className="ml-4 text-xs text-gray-700">
                                  • {param?.label}: {param?.value} {param?.total && `(Qty: ${param.total})`}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              {popupData?.createdAt && (
                <div className="mt-6 text-sm text-gray-700 border-t pt-4">
                  <p><span className="font-semibold">Created:</span> {new Date(popupData.createdAt).toLocaleString()}</p>
                </div>
              )}
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
