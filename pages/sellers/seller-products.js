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
  const [viewPopup, setViewPopup] = useState(false);
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

  const updateProductStatus = async (productId, status) => {
    try {
      props.loader(true);
      
      // Update the local state immediately for better UX
      setProductsList(prevProducts => 
        prevProducts.map(product => 
          product._id === productId 
            ? { 
                ...product, 
                status: status,
                is_verified: status === 'verified' // Update is_verified based on status
              }
            : product
        )
      );

      // Close the popup immediately
      setViewPopup(false);

      // Show success message immediately
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      props.toaster({
        type: "success",
        message: `Product ${statusText} successfully`,
      });

      // Make the API call
      const data = {
        id: productId,
        status: status
      };
      
      const res = await Api("post", "updateProductStatus", data, router);
      
      // If there was an error with the API, revert the local state
      if (!res?.status) {
        console.error("Error updating product status:", res?.data?.message);
        // Re-fetch to get the correct state from the server
        getProduct(currentPage, pageSize);
      }
      
    } catch (error) {
      console.error("Error updating product status:", error);
      // Re-fetch to get the correct state from the server
      getProduct(currentPage, pageSize);
    } finally {
      props.loader(false);
    }
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
          setViewPopup(false);
          getProduct(currentPage, pageSize);
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
      <div className="flex items-center justify-center">
        {imageUrl ? (
          <img
            className="h-[60px] w-[60px] rounded-[10px] object-cover"
            src={imageUrl}
            alt="Product"
          />
        ) : (
          <div className="h-[60px] w-[60px] rounded-[10px] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
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

  const price = ({ row }) => {
    const priceSlot = row.original?.price_slot?.[0];
    const variants = row.original?.varients || [];
    
    // Check if price_slot is empty or has no price
    const hasPriceSlot = priceSlot && (priceSlot.price > 0 || priceSlot.Offerprice > 0);
    
    // If price_slot is empty/invalid and variants exist, use variant price
    if (!hasPriceSlot && variants.length > 0) {
      const firstVariant = variants[0];
      const variantPrice = firstVariant?.Offerprice > 0 ? firstVariant.Offerprice : firstVariant?.price;
      
      return (
        <div className="flex flex-col items-center justify-center">
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
    
    // Otherwise use price_slot
    const showOfferPrice = priceSlot?.Offerprice > 0;
    const displayPrice = showOfferPrice ? priceSlot.Offerprice : (priceSlot?.price || 0);
    
    return (
      <div className="flex flex-col items-center justify-center">
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
            setViewPopup(true);
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

      // Update the local state immediately for better UX
      setProductsList(prevProducts => 
        prevProducts.map(product => 
          product._id === productId 
            ? { ...product, status: 'suspended', is_verified: false }
            : product
        )
      );

      // Close the popup immediately
      setViewPopup(false);

      // Show success message immediately
      props.toaster({
        type: "success",
        message: "Product suspended successfully",
      });

      // Make the API call
      const res = await Api("post", `suspend/${productId}`, null, router);
      
      // If there was an error with the API, revert the local state
      if (!res?.status) {
        console.error("Error suspending product:", res?.data?.message || 'Unknown error');
        // Re-fetch to get the correct state from the server
        getProduct(currentPage, pageSize);
      }
      
    } catch (error) {
      console.error("Error suspending product:", error);
      // Re-fetch to get the correct state from the server
      getProduct(currentPage, pageSize);
    } finally {
      props.loader(false);
    }
  };

  return (
    <div className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      {/* pb-[120px] */}
      {viewPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50 overflow-auto p-4">
          <div className="relative w-full max-w-[800px] max-h-[90vh] bg-white rounded-[15px] m-auto overflow-y-auto">
            <div
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-black w-8 h-8 cursor-pointer z-10"
              onClick={() => setViewPopup(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <div className="px-6 py-8">
              {/* Product Header */}
              <div className="w-full flex gap-4 pb-6 border-b">
                <img
                  src={
                    popupData?.varients?.[0]?.image?.[0] || 
                    popupData?.images?.[0] || 
                    '/placeholder-image.png'
                  }
                  className="h-[100px] w-[100px] rounded-[10px] object-cover"
                  alt={popupData?.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {popupData?.name}
                  </h2>
                  <p className="text-lg font-semibold text-green-600 mb-1">
                    {(() => {
                      const priceSlot = popupData?.price_slot?.[0];
                      const variants = popupData?.varients || [];
                      
                      // Check if price_slot has valid price
                      const hasPriceSlot = priceSlot && (priceSlot.price > 0 || priceSlot.Offerprice > 0);
                      
                      // If price_slot is empty/invalid and variants exist, show variant price range
                      if (!hasPriceSlot && variants.length > 0) {
                        const prices = variants.map(v => v?.Offerprice > 0 ? v.Offerprice : v?.price).filter(p => p > 0);
                        if (prices.length > 0) {
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          if (minPrice === maxPrice) {
                            return currencySign(minPrice);
                          }
                          return `${currencySign(minPrice)} - ${currencySign(maxPrice)}`;
                        }
                      }
                      
                      // Use price_slot
                      const displayPrice = priceSlot?.Offerprice > 0 ? priceSlot.Offerprice : (priceSlot?.price || 0);
                      return currencySign(displayPrice);
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-semibold ${popupData?.status === 'verified' ? 'text-green-600' : 'text-orange-600'}`}>
                      {popupData?.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Product Details */}
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Product Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Category:</p>
                      <p className="font-semibold text-black">{popupData?.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">SKU:</p>
                      <p className="font-semibold text-black">{popupData?.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Model:</p>
                      <p className="font-semibold text-black">{popupData?.model || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Stock:</p>
                      <p className="font-semibold text-black">
                        {(() => {
                          // If product has variants, calculate total stock from all variants
                          if (popupData?.varients && popupData.varients.length > 0) {
                            const totalStock = popupData.varients.reduce((sum, variant) => {
                              // First check if variant has direct stock field
                              if (variant?.stock !== undefined) {
                                return sum + (parseInt(variant.stock) || 0);
                              }
                              // Otherwise check selected array's total field
                              const variantStock = variant?.selected?.reduce((vSum, sel) => {
                                return vSum + (parseInt(sel?.total) || 0);
                              }, 0) || 0;
                              return sum + variantStock;
                            }, 0);
                            return `${totalStock} pcs`;
                          }
                          // Otherwise use direct stock field
                          return `${popupData?.stock || 0} pcs`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Origin:</p>
                      <p className="font-semibold text-black">{popupData?.origin || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Manufacturer:</p>
                      <p className="font-semibold text-black">{popupData?.manufacturername || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Manufacturer Address:</p>
                      <p className="font-semibold text-black">{popupData?.manufactureradd || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expiry Date:</p>
                      <p className="font-semibold text-black">
                        {popupData?.expirydate ? moment(popupData.expirydate).format('DD MMM YYYY') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sold Pieces:</p>
                      <p className="font-semibold text-black">{popupData?.sold_pieces || 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Description</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Short:</strong> {popupData?.short_description || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Long:</strong> {popupData?.long_description || 'N/A'}
                  </p>
                </div>

                {/* Variants Section */}
                {popupData?.varients && popupData.varients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Product Variants ({popupData.varients.length})</h3>
                    <div className="space-y-4">
                      {popupData.varients.map((variant, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-4">
                            {/* Variant Images */}
                            <div className="flex gap-2 flex-wrap">
                              {variant?.image?.slice(0, 3).map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={img}
                                  alt={`Variant ${index + 1} - Image ${imgIndex + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-300"
                                  onError={(e) => {
                                    e.target.src = '/placeholder-image.png';
                                  }}
                                />
                              ))}
                              {variant?.image?.length > 3 && (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded border border-gray-300 text-xs text-gray-600">
                                  +{variant.image.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Variant Details */}
                            <div className="flex-1">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">Color:</p>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-6 h-6 rounded border border-gray-300" 
                                      style={{ backgroundColor: variant?.color }}
                                    ></div>
                                    <span className="font-semibold text-black">{variant?.color}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-gray-600">Price:</p>
                                  <p className="font-semibold text-black">
                                    {currencySign(variant?.Offerprice || variant?.price || 0)}
                                    {variant?.Offerprice > 0 && variant?.price > variant?.Offerprice && (
                                      <span className="ml-2 text-gray-500 line-through text-xs">
                                        {currencySign(variant.price)}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Variant Stock - Show if available */}
                              {variant?.stock !== undefined && (
                                <div className="mt-3">
                                  <p className="text-gray-600 text-sm">Stock:</p>
                                  <span className={`inline-block mt-1 px-3 py-1 rounded text-xs font-semibold ${
                                    variant.stock > 10 ? 'bg-green-100 text-green-800' : 
                                    variant.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {variant.stock} units
                                  </span>
                                </div>
                              )}
                              
                              {/* Size/Stock Details */}
                              {variant?.selected && variant.selected.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-gray-600 text-sm mb-2">Available Sizes & Stock:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {variant.selected.map((sel, selIndex) => (
                                      <div key={selIndex} className="bg-white px-3 py-1 rounded border border-gray-300 text-xs">
                                        <span className="font-semibold">{sel?.value}</span>
                                        <span className="text-gray-600 ml-2">({sel?.total || 0} pcs)</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Seller Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name:</p>
                      <p className="font-semibold text-black">
                        {popupData?.userid?.firstName} {popupData?.userid?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-semibold text-black">{popupData?.userid?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Product Status Checkboxes */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-black mb-3">Product Status</h3>
                  <div className="space-y-3">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={popupData?.is_verified || false}
                          onChange={(e) =>
                            setPopupData({ ...popupData, is_verified: e.target.checked })
                          }
                        />
                      }
                      label="Verified Product"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={popupData?.is_quality || false}
                          onChange={(e) =>
                            setPopupData({ ...popupData, is_quality: e.target.checked })
                          }
                        />
                      }
                      label="Quality Product"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={popupData?.sponsered || false}
                          onChange={(e) =>
                            setPopupData({ ...popupData, sponsered: e.target.checked })
                          }
                        />
                      }
                      label="Sponsored Product"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  {/* <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    onClick={() => addNewItem()}
                  >
                    Update Product
                  </button> */}
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    onClick={() => updateProductStatus(popupData?._id, 'verified')}
                  >
                    Approve
                  </button>
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    onClick={() => suspendProduct(popupData?._id)}
                  >
                    Suspend
                  </button>
                  <button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                    onClick={() => updateProductStatus(popupData?._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
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
              src="/filterImg.png"
              alt="Filter"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => console.log('Open filter modal')}
            />
          </div>
        </div>
        <div className="px-2 md:pb-44 pb-28 bg-white h-full rounded-[12px] overflow-auto">
          <div>
            <Table
              columns={columns}
              data={productsList}
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default isAuth(SellerInventory);
