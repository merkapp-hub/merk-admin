import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { userContext } from "./_app";

function AddSale(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [productsList, setProductsList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (user?._id) {
      getProduct();
      // Check if editing existing sale
      if (router.query.id) {
        getSaleById(router.query.id);
      }
    }
  }, [user, router.query.id]);

  const [formData, setFormData] = useState({
    startDateTime: "",
    endDateTime: "",
    price: "",
    products: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getProduct = async () => {
    props.loader(true);
    
    Api("get", `getSellerProducts?seller_id=${user?._id}`, router).then(
      (res) => {
        console.log("Seller products response:", res);
        console.log("Products with categories:", res.data?.map(p => ({
          name: p.name,
          category: p.category,
          hasCategory: !!p.category
        })));
        props.loader(false);
        setProductsList(res.data || []);
      },
      (err) => {
        props.loader(false);
        console.log("Get products error:", err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const productOptions = productsList.map((product) => {
    // Get price with proper fallback logic
    const getPrice = () => {
      // Try price_slot first
      if (product?.price_slot?.[0]) {
        return product.price_slot[0].Offerprice || product.price_slot[0].price || 'N/A';
      }
      // Try variants
      if (product?.varients?.[0]) {
        return product.varients[0].Offerprice || product.varients[0].price || 'N/A';
      }
      return 'N/A';
    };

    const verificationStatus = product?.is_verified ? '✓ Verified' : '⚠️ Not Verified';

    return {
      value: product._id,
      label: `${product.name} - ${product.category?.name || 'No Category'} - $${getPrice()} - ${verificationStatus}`,
      isDisabled: !product?.is_verified, // Disable unverified products
    };
  });

  const handleProductChange = (selectedOptions) => {
    const productIds = selectedOptions.map((option) => option.value);

    setSelectedProducts(selectedOptions);
    setFormData((prev) => ({
      ...prev,
      products: productIds,
    }));
  };

  const getSaleById = async (saleId) => {
    props.loader(true);
    try {
      const response = await Api("get", `getSaleById/${saleId}`, "", router);
      props.loader(false);
      
      if (response.status && response.data) {
        const sale = response.data;
        
        // Format dates for datetime-local input
        const formatDateTime = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };
        
        setFormData({
          startDateTime: formatDateTime(sale.startDateTime),
          endDateTime: formatDateTime(sale.endDateTime),
          price: sale.price,
          products: sale.products.map(p => p._id || p),
        });
        
        // Set selected products for the dropdown
        const selected = sale.products.map(product => ({
          value: product._id,
          label: `${product.name} - ${product.category?.name || 'No Category'}`,
        }));
        setSelectedProducts(selected);
      }
    } catch (err) {
      props.loader(false);
      console.log(err);
      props.toaster({ type: "error", message: err?.message || "Failed to load sale" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.startDateTime || !formData.endDateTime) {
      props.toaster({ type: "error", message: "Please select start and end date" });
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      props.toaster({ type: "error", message: "Please enter a valid price" });
      return;
    }
    
    if (!formData.products || formData.products.length === 0) {
      props.toaster({ type: "error", message: "Please select at least one product" });
      return;
    }

    // Check if all selected products are verified
    const unverifiedProducts = formData.products
      .map(productId => productsList.find(p => p._id === productId))
      .filter(product => !product?.is_verified);

    if (unverifiedProducts.length > 0) {
      const productNames = unverifiedProducts.map(p => p?.name).join(', ');
      props.toaster({ 
        type: "error", 
        message: `Cannot create flash sale. Following products are not verified by admin: ${productNames}. Please wait for admin verification.` 
      });
      return;
    }
    
    props.loader(true);

    const formattedData = {
      ...formData,
      startDateTime: new Date(formData.startDateTime).toISOString(),
      endDateTime: new Date(formData.endDateTime).toISOString(),
      SellerId: user._id
    };

    const isEditMode = router.query.id && router.query.id !== 'undefined';
    const apiEndpoint = isEditMode ? "updateSale" : "createSale";
    
    // Only add saleId if it's a valid ID
    const apiData = isEditMode 
      ? { ...formattedData, saleId: router.query.id } 
      : formattedData;
    
    console.log('Submit Data:', { isEditMode, apiEndpoint, apiData });
    console.log('Products being sent:', apiData.products);
    console.log('FormData products:', formData.products);

    try {
      const response = await Api("post", apiEndpoint, apiData, router);
      props.loader(false);
      
      // Check for successful response
      if (response.success === true || response.status === true) {
        const message = isEditMode ? "Sale updated successfully!" : "Sale added successfully!";
        props.toaster({ type: "success", message });
        setFormData({
          startDateTime: "",
          endDateTime: "",
          price: "",
          products: [],
        });
        setSelectedProducts([]);
        router.push("/SaleProduct");
      } else {
        // Handle error response from backend
        props.toaster({ 
          type: "error", 
          message: response?.message || "Failed to save sale" 
        });
      }
    } catch (error) {
      props.loader(false);
      console.error('Submit Error:', error);
      props.toaster({
        type: "error",
        message: error?.response?.data?.message || error?.message || "An error occurred",
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg h-full shadow-lg max-w-2xl mx-auto py-8 my-12 overflow-y-scroll  scrollbar-hide overflow-scroll pb-44 border border-gray-100">
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-1 h-6 bg-[#26004d] rounded mr-3"></span>
          {router.query.id ? 'Edit Sale' : 'Create Sale'}
        </h2>
        <p className="text-gray-500 text-[13px] mt-1">
          {router.query.id ? 'Update your promotional sale details' : 'Add a new promotional sale for selected products'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product Selection */}
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#26004d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Select Products
          </label>
          <div className="relative">
            <Select
              isMulti
              options={productOptions}
              value={selectedProducts}
              onChange={handleProductChange}
              className="text-gray-700"
              classNamePrefix="select"
              placeholder="Select products..."
              required
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#e5e7eb",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "#26004d",
                  },
                  padding: "2px",
                  borderRadius: "0.5rem",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "rgba(243, 133, 41, 0.1)",
                  borderRadius: "0.375rem",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#26004d",
                  fontWeight: "500",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#26004d",
                  ":hover": {
                    backgroundColor: "#26004d",
                    color: "white",
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#26004d"
                    : state.isFocused
                    ? "rgba(243, 133, 41, 0.1)"
                    : null,
                  color: state.isDisabled ? "#9ca3af" : base.color,
                  cursor: state.isDisabled ? "not-allowed" : "pointer",
                  ":active": {
                    backgroundColor: "#26004d",
                  },
                }),
              }}
            />
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            ✓ Only verified products can be added to flash sale. ⚠️ Unverified products are disabled.
          </p>
        </div>

        {/* Sale Start Date & Time */}
        <div className="mb-6">
          <label
            htmlFor="startDateTime"
            className="block font-medium text-gray-700 mb-2 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#26004d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Sale Start Date & Time
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#26004d]/20 focus:border-[#26004d] transition-colors"
            />
          </div>
        </div>

        {/* Sale End Date & Time */}
        <div className="mb-6">
          <label
            htmlFor="endDateTime"
            className="block font-medium text-gray-700 mb-2 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#26004d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Sale End Date & Time
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#26004d]/20 focus:border-[#26004d] transition-colors"
            />
          </div>
        </div>

        {/* Price */}
        <div className="mb-8">
          <label
            htmlFor="price"
            className="block font-medium text-gray-700 mb-2 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#26004d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Sale Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0.00"
              className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-8 pr-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#26004d]/20 focus:border-[#26004d] transition-colors"
            />
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            Enter the promotional price for selected products
          </p>
        </div>

        {/* Submit Button */}
        <div className="relative">
          <button
            type="submit"
            className="w-full bg-[#26004d] text-white py-3 px-4 rounded-lg hover:bg-[#26004d] transition-colors font-medium flex items-center justify-center"
          >
            <span>{router.query.id ? 'Update Sale' : 'Create Sale'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>

          {/* Decorative elements */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#26004d] opacity-50 rounded-full"></div>
        </div>

        {/* Optional promotional info */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-[13px] text-gray-500">
            Sales will automatically become active and inactive based on the
            dates provided
          </p>
        </div>
      </form>
    </div>
  );
}

export default isAuth(AddSale);
