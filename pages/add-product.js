import React, { useContext, useRef, useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import { IoAddSharp, IoCloseCircleOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { userContext } from "./_app";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { Api, ApiFormData } from "@/services/service";
import { useRouter } from "next/router";
import { produce } from "immer";
import { MdOutlineFileUpload } from "react-icons/md";
import isAuth from "@/components/isAuth";
import Compressor from "compressorjs";

const config = {
  controls: {
    fontsize: {
      list: {
        "12px": "12",
        "14px": "14",
        "16px": "16",
        "18px": "18",
        "20px": "20",
        "22px": "22",
        "24px": "24",
        "30px": "30",
        "36px": "36",
        "40px": "40",
        "48px": "48",
      },
    },
  },
};

const DEFAULT_SIZE = {
  id: Date.now() + Math.random(),
  label: "Size",
  value: "",
  total: 0,
  sell: 0,
};

const SIZE_LIST = [
  { id: 1, label: "XXS", value: "XXS", total: 0, sell: 0 },
  { id: 2, label: "XS", value: "XS", total: 0, sell: 0 },
  { id: 3, label: "S", value: "S", total: 0, sell: 0 },
  { id: 4, label: "M", value: "M", total: 0, sell: 0 },
  { id: 5, label: "L", value: "L", total: 0, sell: 0 },
  { id: 6, label: "XL", value: "XL", total: 0, sell: 0 },
  { id: 7, label: "XXL", value: "XXL", total: 0, sell: 0 },
  { id: 8, label: "3XL", value: "3XL", total: 0, sell: 0 },
  { id: 9, label: "4XL", value: "4XL", total: 0, sell: 0 },
  { id: 10, label: "5XL", value: "5XL", total: 0, sell: 0 },
  { id: 11, label: "For adult", value: "For adult", total: 0, sell: 0 },
];

const DEFAULT_CAPACITY = {
  id: Date.now() + Math.random(),
  label: "ML",
  value: 0,
  total: 0,
  sell: 0,
};

const DEFAULT_DIMENSIONS = {
  id: Date.now() + Math.random(),
  label: "Height (Inches)",
  label2: "Width (Inches)",
  Height: 0,
  Width: 0,
  total: 0,
  sell: 0,
};

const DEFAULT_WEIGHT = {
  id: Date.now() + Math.random(),
  label: "GR",
  value: 0,
  total: 0,
  sell: 0,
};

function AddProduct(props) {
  const router = useRouter();
  const fileInputRefs = useRef([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [variantImageFiles, setVariantImageFiles] = useState({});


  const [productData, setProductData] = useState({
    name: "",
    category: [],
    sku: "",
    model: "",
    origin: "",
    expirydate: "",
    hasExpiryDate: false,
    manufacturername: "",
    manufactureradd: "",
    short_description: "",
    long_description: "",
    price: 0,
    Offerprice: 0,
    stock: 0,
    hasVariants: false,
    images: [],
  });

  const [categoryData, setCategoryData] = useState([]);
  const [filteredCategoryData, setFilteredCategoryData] = useState([]);
  const [user, setUser] = useContext(userContext);
  const [variants, setVariants] = useState([
    {
      id: Date.now() + Math.random(), // Unique ID for initial variant
      color: "",
      image: [],
      selected: [],
      price: 0,
      Offerprice: 0,
    },
  ]);
  const [openPopup, setOpenPopup] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useColor("#000000");
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [singleImageUrl, setSingleImageUrl] = useState("");
  const [parameterType, setParameterType] = useState("");
  const [selectedParameterList, setSelectedParameterList] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (router?.query?.id) {
      fetchProductById();
    }
  }, [router?.query?.id]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchProductById = async () => {
    try {
      props.loader(true);
      const response = await Api(
        "get",
        `getProductById/${router.query.id}`,
        "",
        router
      );

      if (response?.status) {
        const productInfo = response.data;
        const hasVariants = productInfo.varients && productInfo.varients.length > 0;
        
        setProductData({
          name: productInfo.name || "",
          category: productInfo.category?._id || [],
          categoryName: productInfo.category?.name || "",
          sku: productInfo.sku || "",
          model: productInfo.model || "",
          short_description: productInfo.short_description || "",
          long_description: productInfo.long_description || "",
          attributes: productInfo.attributes || [],
          manufactureradd: productInfo.manufactureradd || "",
          manufacturername: productInfo.manufacturername || "",
          expirydate: productInfo.expirydate || "",
          hasExpiryDate: !!productInfo.expirydate,
          origin: productInfo.origin || "",
          hasVariants: hasVariants,
          price: hasVariants ? 0 : (productInfo.price_slot?.[0]?.price || 0),
          Offerprice: hasVariants ? 0 : (productInfo.price_slot?.[0]?.Offerprice || 0),
          images: productInfo.images || [],
        });

        if (hasVariants) {
          setVariants(productInfo.varients);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      props.toaster({
        type: "error",
        message: error?.message || "Failed to fetch product",
      });
    } finally {
      props.loader(false);
    }
  };

  const fetchCategories = async () => {
    try {
      props.loader(true);
      const response = await Api("get", "getCategory", "", router);

      if (response?.status) {
        const categoriesWithLabels = response.data.map((category) => ({
          ...category,
          value: category._id,
          label: category.name,
        }));
        setCategoryData(categoriesWithLabels);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      props.toaster({
        type: "error",
        message: error?.message || "Failed to fetch categories",
      });
    } finally {
      props.loader(false);
    }
  };

const handleCreateProduct = async (e) => {
    e.preventDefault();

    // Validation
    if (productData.hasVariants && variants.length === 0) {
        props.toaster({ type: "error", message: "Please add at least one variant" });
        return;
    }

    if (!productData.hasVariants && (!productData.price || productData.price <= 0)) {
        props.toaster({ type: "error", message: "Please enter product price" });
        return;
    }

    const formData = new FormData();
    
    // Add simple text fields
    formData.append('name', productData.name);
    formData.append('category', productData.category);
    formData.append('sku', productData.sku || '');
    formData.append('model', productData.model || '');
    formData.append('origin', productData.origin);
    formData.append('expirydate', productData.hasExpiryDate ? productData.expirydate : '');
    formData.append('manufacturername', productData.manufacturername);
    formData.append('manufactureradd', productData.manufactureradd);
    formData.append('short_description', productData.short_description);
    formData.append('long_description', productData.long_description);
    formData.append('userid', user?._id);
    formData.append('hasVariants', productData.hasVariants);
    
    // Handle pricing based on variant status
    if (productData.hasVariants) {
        // For products with variants, send empty price_slot
        formData.append('price_slot', JSON.stringify([]));
        formData.append('varients', JSON.stringify(variants));
    } else {
        // For normal products, create single price slot
        const priceSlot = [{
            value: 1,
            price: parseFloat(productData.price) || 0,
            Offerprice: parseFloat(productData.Offerprice) || 0,
        }];
        formData.append('price_slot', JSON.stringify(priceSlot));
        formData.append('varients', JSON.stringify([]));
        formData.append('stock', parseInt(productData.stock) || 0);
    }
    
    formData.append('attributes', JSON.stringify(productData.attributes || []));
    
    // Handle images for normal products
    if (!productData.hasVariants) {
        // Send image URLs as JSON
        if (productData.images && productData.images.length > 0) {
            formData.append('imageUrls', JSON.stringify(productData.images));
        }
    }
    
    // Add image files if any (for file uploads)
    if (selectedImageFiles && selectedImageFiles.length > 0) {
        selectedImageFiles.forEach(file => {
            formData.append('images', file);
        });
    }

    try {
        props.loader(true);
        const response = await ApiFormData("post", "createProduct", formData, router);
        
        if (response.status) {
            resetForm();
            router.push("/inventory");
            props.toaster({ type: "success", message: response.data?.message });
        } else {
            props.toaster({ type: "error", message: response?.data?.message });
        }
    } catch (error) {
        console.error("Error creating product:", error);
        props.toaster({
            type: "error",
            message: error?.message || "Failed to create product",
        });
    } finally {
        props.loader(false);
    }
};

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    // Validation
    if (productData.hasVariants && variants.length === 0) {
        props.toaster({ type: "error", message: "Please add at least one variant" });
        return;
    }

    if (!productData.hasVariants && (!productData.price || productData.price <= 0)) {
        props.toaster({ type: "error", message: "Please enter product price" });
        return;
    }

    const formData = new FormData();
    
    formData.append('name', productData.name);
    formData.append('category', productData.category);
    formData.append('sku', productData.sku || '');
    formData.append('model', productData.model || '');
    formData.append('origin', productData.origin);
    formData.append('expirydate', productData.hasExpiryDate ? productData.expirydate : '');
    formData.append('manufacturername', productData.manufacturername);
    formData.append('manufactureradd', productData.manufactureradd);
    formData.append('short_description', productData.short_description);
    formData.append('long_description', productData.long_description);
    formData.append('userid', user?._id);
    formData.append('id', router?.query?.id);
    formData.append('hasVariants', productData.hasVariants);
    
    // Handle pricing based on variant status
    if (productData.hasVariants) {
        formData.append('price_slot', JSON.stringify([]));
        formData.append('varients', JSON.stringify(variants));
    } else {
        const priceSlot = [{
            value: 1,
            price: parseFloat(productData.price) || 0,
            Offerprice: parseFloat(productData.Offerprice) || 0,
        }];
        formData.append('price_slot', JSON.stringify(priceSlot));
        formData.append('varients', JSON.stringify([]));
        formData.append('stock', parseInt(productData.stock) || 0);
    }
    
    formData.append('attributes', JSON.stringify(productData.attributes || []));
    
    // Handle images for normal products
    if (!productData.hasVariants) {
        // Send image URLs as JSON
        if (productData.images && productData.images.length > 0) {
            formData.append('imageUrls', JSON.stringify(productData.images));
        }
    }
    
    // Add image files if any (for file uploads)
    if (selectedImageFiles && selectedImageFiles.length > 0) {
        selectedImageFiles.forEach(file => {
            formData.append('images', file);
        });
    }
    
    try {
        props.loader(true);
        const response = await ApiFormData("post", "updateProduct", formData, router);
        
        if (response.status) {
            resetForm();
            router.push("/inventory");
            props.toaster({ type: "success", message: response.data?.message });
        } else {
            props.toaster({ type: "error", message: response?.data?.message });
        }
    } catch (error) {
        console.error("Error updating product:", error);
        props.toaster({
            type: "error",
            message: error?.message || "Failed to update product",
        });
    } finally {
        props.loader(false);
    }
};

  const resetForm = () => {
    setProductData({
      name: "",
      category: [],
      sku: "",
      model: "",
      origin: "",
      expirydate: "",
      hasExpiryDate: false,
      manufacturername: "",
      manufactureradd: "",
      short_description: "",
      long_description: "",
      price: 0,
      Offerprice: 0,
      hasVariants: false,
      images: [],
    });

    setVariants([
      {
        color: "",
        image: [],
        selected: [],
        price: 0,
        Offerprice: 0,
      },
    ]);
    setParameterType("");
    setSelectedParameterList([]);
    setSelectedImageFiles([]);
    setSingleImageUrl("");
  };

  // Simple input that never re-renders
  const ParameterInput = ({ 
    initialValue,
    onValueChange,
    type = "number",
    className,
    min
  }) => {
    const inputRef = React.useRef(null);
    
    React.useEffect(() => {
      if (inputRef.current && initialValue !== undefined) {
        inputRef.current.value = initialValue;
      }
    }, []);
    
    const handleChange = (e) => {
      onValueChange(e.target.value);
    };
    
    return (
      <input
        ref={inputRef}
        type={type}
        className={className}
        defaultValue={initialValue}
        onChange={handleChange}
        min={min}
      />
    );
  };

  const ParameterTypeComponent = ({ item = [], variantIndex }) => {
    return (
      <div className="col-span-4 grid md:grid-cols-6 grid-cols-1 w-full gap-3">
        {item.map((slot, slotIndex) => (
          <div
            key={slot.id || slotIndex}
            className="flex flex-col justify-start items-start border border-custom-lightGrays rounded-[8px] md:p-5 p-[12px]  relative"
          >
            <IoCloseCircleOutline
              className="text-red-700 cursor-pointer h-5 w-5 absolute top-[20px] right-[20px]"
              onClick={() => removeParameterSlot(variantIndex, slotIndex)}
            />

            {!slot?.label2 && slot?.label !== "Size" && (
              <div className="flex flex-col justify-start items-start w-full mt-5">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  {slot?.label}
                </p>
                <ParameterInput
                  initialValue={slot?.value || ""}
                  onValueChange={(value) =>
                    updateParameterSlot(
                      variantIndex,
                      slotIndex,
                      "value",
                      value
                    )
                  }
                  className="md:w-[126px] w-[87px] md:h-[42px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                  min={1}
                />
              </div>
            )}

            {!slot?.label2 && slot?.label === "Size" && (
              <div className="flex flex-col justify-start items-start w-full mt-5">
                <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                  {slot?.label}
                </p>
                <select
                  onChange={(e) =>
                    updateParameterSlot(
                      variantIndex,
                      slotIndex,
                      "value",
                      e.target.value
                    )
                  }
                  defaultValue={slot?.value || ""}
                  className="md:w-[126px] w-[87px] md:h-[42px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                >
                  <option value="">Select</option>
                  {SIZE_LIST.map((sizeItem, sizeIndex) => (
                    <option key={sizeIndex} value={sizeItem.value}>
                      {sizeItem.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {slot?.label2 && (
              <>
                <div className="flex flex-col justify-start items-start w-full mt-5">
                  <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                    {slot?.label}
                  </p>
                  <ParameterInput
                    initialValue={slot.Height || ""}
                    onValueChange={(value) =>
                      updateParameterSlot(
                        variantIndex,
                        slotIndex,
                        "Height",
                        value
                      )
                    }
                    className="md:w-[126px] w-[87px] md:h-[42px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                    min={1}
                  />
                </div>
                <div className="flex flex-col justify-start items-start w-full mt-5">
                  <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                    {slot?.label2}
                  </p>
                  <ParameterInput
                    initialValue={slot?.Width || ""}
                    onValueChange={(value) =>
                      updateParameterSlot(
                        variantIndex,
                        slotIndex,
                        "Width",
                        value
                      )
                    }
                    className="md:w-[126px] w-[87px] md:h-[42px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                    min={1}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col justify-start items-start w-full mt-5">
              <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                Qty
              </p>
              <ParameterInput
                initialValue={slot?.total || ""}
                onValueChange={(value) =>
                  updateParameterSlot(
                    variantIndex,
                    slotIndex,
                    "total",
                    value
                  )
                }
                className="md:w-[126px] w-[87px] md:h-[42px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                min={1}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end items-end w-full">
          <button
            type="button"
            className="bg-[#E59013] flex justify-center items-center cursor-pointer md:h-[45px] h-[40px] md:w-[177px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
            onClick={() => addParameterSlot(variantIndex)}
          >
            Add more
          </button>
        </div>
      </div>
    );
  };

  const updateParameterSlot = React.useCallback((variantIndex, slotIndex, field, value) => {
    setVariants(prevVariants => {
      const newVariants = [...prevVariants];
      if (newVariants[variantIndex]?.selected[slotIndex]) {
        newVariants[variantIndex] = {
          ...newVariants[variantIndex],
          selected: newVariants[variantIndex].selected.map((slot, idx) => 
            idx === slotIndex ? { ...slot, [field]: value } : slot
          )
        };
      }
      return newVariants;
    });
  }, []);

  const addParameterSlot = React.useCallback((variantIndex) => {
    if (selectedParameterList.length > 0) {
      setVariants(prevVariants => {
        const updatedVariants = produce(prevVariants, (draft) => {
          draft[variantIndex].selected.push({ 
            ...selectedParameterList[0],
            id: Date.now() + Math.random() // Unique ID for each slot
          });
        });
        return updatedVariants;
      });
    }
  }, [selectedParameterList]);

  const removeParameterSlot = React.useCallback((variantIndex, slotIndex) => {
    setVariants(prevVariants => {
      const updatedVariants = produce(prevVariants, (draft) => {
        draft[variantIndex].selected.splice(slotIndex, 1);
      });
      return updatedVariants;
    });
  }, []);

const handleImageChange = async (event, variantIndex) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    props.loader(true);
    
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        
        const response = await ApiFormData("post", "uploadImages", formData, router);
        
        if (response?.status && response?.data?.images) {
            // Create a new array with the existing images plus the new ones
            setVariants(prevVariants => 
                prevVariants.map((variant, idx) => {
                    if (idx === variantIndex) {
                        return {
                            ...variant,
                            image: [...variant.image, ...response.data.images]
                        };
                    }
                    return variant;
                })
            );
            
            // Reset the file input
            event.target.value = null;
            
            props.toaster({ type: "success", message: "Images uploaded successfully" });
        } else {
            props.toaster({ type: "error", message: "Failed to upload images" });
        }
    } catch (error) {
        console.error("Error uploading images:", error);
        props.toaster({ 
            type: "error", 
            message: error?.message || "Failed to upload images" 
        });
    } finally {
        props.loader(false);
    }
};

  const removeImage = (imageUrl, imageIndex, variantIndex) => {
    const updatedVariants = produce(variants, (draft) => {
      draft[variantIndex].image.splice(imageIndex, 1);
    });
    setVariants(updatedVariants);
  };

  const removePriceSlot = (slotIndex) => {
    if (productData.price_slot.length > 1) {
      const updatedSlots = [...productData.price_slot];
      updatedSlots.splice(slotIndex, 1);
      setProductData({ ...productData, price_slot: updatedSlots });
    }
  };

  const removeVariant = (variantIndex) => {
    if (variants.length > 1) {
      const updatedVariants = [...variants];
      updatedVariants.splice(variantIndex, 1);
      setVariants(updatedVariants);
    }
  };

  const handleParameterTypeChange = (selectedType) => {
    setParameterType(selectedType);
    const filteredCategories = categoryData.filter(
      (category) => category.parameter_type === selectedType
    );
    setFilteredCategoryData(filteredCategories);

    const parameterDefaults = {
      size: [DEFAULT_SIZE],
      weight: [DEFAULT_WEIGHT],
      dimensions: [DEFAULT_DIMENSIONS],
      capacity: [DEFAULT_CAPACITY],
    };

    const defaultParameters = parameterDefaults[selectedType] || [];
    setSelectedParameterList(defaultParameters);

    const updatedVariants = produce(variants, (draft) => {
      draft[0].selected = [...defaultParameters];
    });
    setVariants(updatedVariants);
  };

  const handleColorPickerClose = () => {
    setIsColorPickerOpen(false);
  };

  const handleColorConfirm = () => {
    const updatedVariants = produce(variants, (draft) => {
      draft[currentVariantIndex].color = selectedColor.hex;
    });
    setVariants(updatedVariants);
    setIsColorPickerOpen(false);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now() + Math.random(), // Unique ID for variant
        color: "",
        image: [],
        selected: [],
        price: 0,
        Offerprice: 0,
      },
    ]);
    // Add a new ref for the new variant
    fileInputRefs.current = [...fileInputRefs.current, React.createRef()];
  };

  useEffect(() => {
    fileInputRefs.current = variants.map((_, i) => fileInputRefs.current[i] || React.createRef());
  }, [variants.length]);

  return (
    <section className="w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      <div className="md:pt-[0px] pt-[0px] h-full overflow-scroll no-scrollbar">
        <p className="text-gray-800 font-bold md:text-[32px] text-2xl md:pb-0 pb-5">
          {router?.query?.id ? "Edit Product" : "Add Product"}
        </p>

        <form
          className="pb-14"
          onSubmit={
            router?.query?.id ? handleUpdateProduct : handleCreateProduct
          }
        >
          <div className="md:pb-10 bg-transparent h-full w-full md:mt-5">
            <div className="md:px-10 px-5 pb-5 bg-white h-full w-full boxShadow">
              <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
                <div className="pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Parameter Type
                  </p>
                  <div className="relative w-full bg-custom-light rounded">
                    <select
                      disabled={productData?._id ? true : false}
                      onChange={(e) =>
                        handleParameterTypeChange(e.target.value)
                      }
                      value={parameterType}
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-10 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                    >
                      <option value="">Select Parameter Type</option>
                      <option value="size">Size</option>
                      <option value="capacity">Capacity</option>
                      <option value="dimensions">Dimensions</option>
                      <option value="weight">Weight</option>
                    </select>

                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Product Name
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Product Name"
                      value={productData.name}
                      onChange={(e) =>
                        setProductData({ ...productData, name: e.target.value })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="md:pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    SKU (Optional)
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="SKU (Auto-generated if empty)"
                      value={productData.sku}
                      onChange={(e) =>
                        setProductData({ ...productData, sku: e.target.value })
                      }
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="md:pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Model (Optional)
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Model"
                      value={productData.model}
                      onChange={(e) =>
                        setProductData({ ...productData, model: e.target.value })
                      }
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="md:pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Category
                  </p>
                  <div className="relative px-3 w-full bg-transparent border border-custom-newGray rounded-[10px]">
                    <select
                      value={productData.category?._id || productData.category}
                      onChange={(e) => {
                        const selectedCategory = categoryData.find(
                          (cat) => cat._id === e.target.value
                        );
                        setProductData({
                          ...productData,
                          category: e.target.value,
                          categoryName: selectedCategory?.name || "",
                          attributes: selectedCategory?.attributes || [],
                        });
                      }}
                      required
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-8 pr-5 outline-none text-custom-darkGrayColor text-base font-light"
                    >
                      <option value="">Select Category</option>
                      {categoryData?.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center gap-3 pb-2">
                    <input
                      type="checkbox"
                      id="hasExpiryDate"
                      checked={productData.hasExpiryDate}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          hasExpiryDate: e.target.checked,
                          expirydate: e.target.checked ? productData.expirydate : "",
                        })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="hasExpiryDate" className="text-custom-darkGray text-base font-normal cursor-pointer">
                      Product has Expiry Date
                    </label>
                  </div>
                  {productData.hasExpiryDate && (
                    <div className="relative">
                      <input
                        className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                        type="date"
                        value={productData.expirydate}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            expirydate: e.target.value,
                          })
                        }
                      />
                      <img
                        className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                        src="/box-add.png"
                        alt="icon"
                      />
                    </div>
                  )}
                </div>

                <div className="">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Short Description
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Short Description"
                      value={productData.short_description}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          short_description: e.target.value,
                        })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Country of Origin
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Country of Origin"
                      value={productData.origin}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          origin: e.target.value,
                        })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Manufacturer Name
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Manufacturer Name"
                      value={productData.manufacturername}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          manufacturername: e.target.value,
                        })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Manufacturer Address
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Manufacturer Address"
                      value={productData.manufactureradd}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          manufactureradd: e.target.value,
                        })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Long Description
                  </p>
                  <div className="relative">
                    <textarea
                      className="bg-transparent w-full pl-12 pr-5 py-2 border border-custom-newGrayColor rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      rows={4}
                      placeholder="Long Description"
                      value={productData.long_description}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          long_description: e.target.value,
                        })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>
              </div>

              {/* Variants Section - Only show if hasVariants is true */}
              {productData.hasVariants && (
                <div className="border border-custom-lightGrays rounded-[8px] md:mt-10 mt-5 px-5 pt-5">
                  <p className="text-black text-2xl font-bold NunitoSans pb-5">
                    Product Variants
                  </p>

                  {variants.map((item, i) => (
                    <div key={item.id || i} className="w-full" id={i}>
                      <div className="border border-custom-lightGrays rounded-[8px] p-5 mb-5 relative">
                        {variants.length > 1 && (
                          <IoCloseCircleOutline
                            className="text-red-700 cursor-pointer h-5 w-5 absolute top-[20px] right-[20px]"
                            onClick={() => removeVariant(i)}
                          />
                        )}

                        <div className="w-full">
                          <div className="grid md:grid-cols-3 grid-cols-1 gap-5 mb-5">
                            <div className="">
                              <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                                Variant #{i + 1} - Color
                              </p>
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  className="w-full md:h-[50px] h-[40px] bg-custom-light border border-custom-offWhite rounded outline-none pl-5 pr-12 text-black"
                                  value={item.color}
                                  onChange={(e) => {
                                    const updatedVariants = produce(variants, (draft) => {
                                      draft[i].color = e.target.value;
                                    });
                                    setVariants(updatedVariants);
                                  }}
                                  placeholder="Enter color name"
                                  required
                                />
                                <p
                                  className="md:w-5 w-3 md:h-5 h-3 rounded-full absolute top-[13px] right-[10px] cursor-pointer border border-black"
                                  style={{ backgroundColor: item.color }}
                                  onClick={() => {
                                    setIsColorPickerOpen(true);
                                    setCurrentVariantIndex(i);
                                  }}
                                ></p>
                              </div>
                            </div>

                            <div className="">
                              <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                                Regular Price ($) *
                              </p>
                              <input
                                type="number"
                                className="w-full md:h-[50px] h-[40px] bg-custom-light border border-custom-offWhite rounded outline-none px-3 text-black"
                                value={item.price || ""}
                                onChange={(e) => {
                                  const updatedVariants = produce(variants, (draft) => {
                                    draft[i].price = e.target.value;
                                  });
                                  setVariants(updatedVariants);
                                }}
                                placeholder="Enter price"
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>

                            <div className="">
                              <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                                Offer Price ($)
                              </p>
                              <input
                                type="number"
                                className="w-full md:h-[50px] h-[40px] bg-custom-light border border-custom-offWhite rounded outline-none px-3 text-black"
                                value={item.Offerprice || ""}
                                onChange={(e) => {
                                  const updatedVariants = produce(variants, (draft) => {
                                    draft[i].Offerprice = e.target.value;
                                  });
                                  setVariants(updatedVariants);
                                }}
                                placeholder="Enter offer price"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Parameter Type Component */}
                        <div className="mt-2">
                          <ParameterTypeComponent
                            item={item?.selected || []}
                            variantIndex={i}
                          />
                        </div>

                      {/* Image Upload Section */}
                      <div className="w-full mt-5">
                        <div className="relative w-full">
                          <div className="w-full">
                            <p className="text-gray-800 text-lg font-semibold pb-1">
                              Images
                            </p>
                            <div className="border rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                              <input
                                className="outline-none bg-white text-black md:w-[90%] w-[85%]"
                                type="text"
                                placeholder="Carousel Images"
                                value={singleImageUrl}
                                onChange={(e) => {
                                  setSingleImageUrl(e.target.value);
                                }}
                              />
                            </div>
                          </div>

                          <div className="absolute top-[32px] md:right-[10px] right-[10px]">
                            <MdOutlineFileUpload
                              className="text-black h-8 w-8 cursor-pointer"
                              onClick={() => {
                                if (fileInputRefs.current[i]) {
                                  fileInputRefs.current[i].current.click();
                                }
                              }}
                            />
                            <input
                              type="file"
                              ref={fileInputRefs.current[i]}
                              className="hidden"
                              onChange={(event) => handleImageChange(event, i)}
                              accept="image/*"
                              multiple
                            />
                          </div>
                        </div>

                        <div className="flex justify-end items-end mt-5">
                          <button
                            type="button"
                            className="text-white bg-[#E59013] rounded-[10px] text-center text-md py-2 w-36 cursor-pointer"
                            onClick={() => {
                              if (singleImageUrl === "") {
                                props.toaster({
                                  type: "error",
                                  message: "Image URL is required",
                                });
                                return;
                              }
                              const updatedVariants = produce(variants, (draft) => {
                                draft[i].image.push(singleImageUrl);
                              });
                              setVariants(updatedVariants);
                              setSingleImageUrl("");
                            }}
                          >
                            Add
                          </button>
                        </div>

                        <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
                          {item?.image?.map((imageUrl, imageIndex) => (
                            <div className="relative" key={imageIndex}>
                              <img
                                className="md:w-20 w-[85px] h-20 object-contain"
                                src={imageUrl}
                                alt={`Product image ${imageIndex + 1}`}
                              />
                              <IoCloseCircleOutline
                                className="text-red-700 cursor-pointer h-5 w-5 absolute left-[5px] top-[10px]"
                                onClick={() =>
                                  removeImage(imageUrl, imageIndex, i)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>


                    </div>
                  </div>
                ))}

                  {/* Add More Variants Button */}
                  <div className="w-full md:mt-5 mt-5 flex justify-end mb-5 gap-2">
                    <button
                      type="button"
                      className="bg-[#E59013] flex justify-center items-center cursor-pointer md:h-[45px] h-[40px] md:w-[177px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                      onClick={() => {
                        setVariants([
                          ...variants,
                          {
                            color: "",
                            image: [],
                            selected:
                              selectedParameterList.length > 0
                                ? [selectedParameterList[0]]
                                : [],
                            price: 0,
                            Offerprice: 0,
                          },
                        ]);
                      }}
                    >
                      Add More Variant
                    </button>
                  </div>
                </div>
              )}

              {/* Product Type Selection */}
              <div className="md:col-span-2 w-full mt-5">
                <div className="flex items-center gap-5 mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={!productData.hasVariants}
                      onChange={() => setProductData({ ...productData, hasVariants: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-800 text-base font-semibold">Normal Product (Single Price)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={productData.hasVariants}
                      onChange={() => setProductData({ ...productData, hasVariants: true })}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-800 text-base font-semibold">Product with Variants</span>
                  </label>
                </div>

                {/* Normal Product Pricing */}
                {!productData.hasVariants && (
                  <div className="border border-custom-lightGrays rounded-[8px] px-5 py-5">
                    <p className="text-gray-800 text-lg font-bold NunitoSans pb-4">
                      Product Pricing
                    </p>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-5 mb-5">
                      <div className="flex flex-col">
                        <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                          Regular Price ($) *
                        </p>
                        <input
                          type="number"
                          className="w-full md:h-[46px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                          value={productData.price || ""}
                          onChange={(e) =>
                            setProductData({ ...productData, price: e.target.value })
                          }
                          required={!productData.hasVariants}
                          min="0"
                          step="0.01"
                          placeholder="Enter regular price"
                        />
                      </div>

                      <div className="flex flex-col">
                        <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                          Offer Price ($)
                        </p>
                        <input
                          type="number"
                          className="w-full md:h-[46px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                          value={productData.Offerprice || ""}
                          onChange={(e) =>
                            setProductData({ ...productData, Offerprice: e.target.value })
                          }
                          min="0"
                          step="0.01"
                          placeholder="Enter offer price (optional)"
                        />
                      </div>
                      
                      {/* Stock Field */}
                      <div className="flex flex-col">
                        <p className="text-gray-800 text-sm font-semibold NunitoSans pb-2">
                          Stock Quantity
                        </p>
                        <input
                          type="number"
                          className="w-full md:h-[46px] h-[40px] bg-custom-light border border-custom-offWhite px-3 rounded outline-none font-normal text-sm text-black NunitoSans"
                          value={productData.stock || ""}
                          onChange={(e) =>
                            setProductData({ ...productData, stock: e.target.value })
                          }
                          min="0"
                          placeholder="Enter stock quantity"
                        />
                      </div>
                    </div>

                    {/* Image Upload for Normal Products */}
                    <div className="w-full mt-5 border-t border-custom-lightGrays pt-5">
                      <p className="text-gray-800 text-lg font-bold NunitoSans pb-3">
                        Product Images
                      </p>
                      <div className="relative w-full">
                        <div className="w-full">
                          <div className="border rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                            <input
                              className="outline-none bg-white text-black md:w-[90%] w-[85%] px-2"
                              type="text"
                              placeholder="Enter image URL or upload"
                              value={singleImageUrl}
                              onChange={(e) => {
                                setSingleImageUrl(e.target.value);
                              }}
                            />
                          </div>
                        </div>

                        <div className="absolute top-[8px] md:right-[10px] right-[10px]">
                          <MdOutlineFileUpload
                            className="text-black h-8 w-8 cursor-pointer"
                            onClick={() => {
                              if (fileInputRefs.current[0]) {
                                fileInputRefs.current[0].current.click();
                              }
                            }}
                          />
                          <input
                            type="file"
                            ref={fileInputRefs.current[0]}
                            className="hidden"
                            onChange={async (event) => {
                              const files = Array.from(event.target.files);
                              if (files.length === 0) return;
                              
                              props.loader(true);
                              try {
                                const formData = new FormData();
                                files.forEach(file => {
                                  formData.append('images', file);
                                });
                                
                                const response = await ApiFormData("post", "uploadImages", formData, router);
                                
                                if (response?.status && response?.data?.images) {
                                  setProductData({
                                    ...productData,
                                    images: [...(productData.images || []), ...response.data.images]
                                  });
                                  props.toaster({ type: "success", message: "Images uploaded successfully" });
                                } else {
                                  props.toaster({ type: "error", message: "Failed to upload images" });
                                }
                              } catch (error) {
                                console.error("Error uploading images:", error);
                                props.toaster({ type: "error", message: error?.message || "Failed to upload images" });
                              } finally {
                                props.loader(false);
                                event.target.value = null;
                              }
                            }}
                            accept="image/*"
                            multiple
                          />
                        </div>
                      </div>

                      <div className="flex justify-end items-end mt-3">
                        <button
                          type="button"
                          className="text-white bg-[#E59013] rounded-[10px] text-center text-md py-2 px-4 cursor-pointer"
                          onClick={() => {
                            if (singleImageUrl === "") {
                              props.toaster({
                                type: "error",
                                message: "Image URL is required",
                              });
                              return;
                            }
                            setProductData({
                              ...productData,
                              images: [...(productData.images || []), singleImageUrl]
                            });
                            setSingleImageUrl("");
                          }}
                        >
                          Add URL
                        </button>
                      </div>

                      <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
                        {productData.images?.map((imageUrl, imageIndex) => (
                          <div className="relative" key={imageIndex}>
                            <img
                              className="md:w-20 w-[85px] h-20 object-contain border border-gray-300 rounded"
                              src={imageUrl}
                              alt={`Product image ${imageIndex + 1}`}
                            />
                            <IoCloseCircleOutline
                              className="text-red-700 cursor-pointer h-5 w-5 absolute -top-2 -right-2 bg-white rounded-full"
                              onClick={() => {
                                const updatedImages = [...(productData.images || [])];
                                updatedImages.splice(imageIndex, 1);
                                setProductData({
                                  ...productData,
                                  images: updatedImages
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex md:flex-row flex-col justify-between items-center w-full pt-20 md:gap-0 gap-5">
                <div className="relative flex justify-center items-center md:w-auto w-full"></div>
                <div className="relative flex justify-center items-center md:w-auto w-full">
                  <button
                    className="bg-[#E59013] md:pr-8 md:h-[50px] h-[40px] md:w-[188px] w-full rounded-[5px] md:text-xl text-base text-white font-normal"
                    type="submit"
                  >
                    {router?.query?.id ? "Update" : "Submit"}
                  </button>
                  <img
                    className="md:w-[8px] w-[7px] md:h-[17px] h-[15px] absolute md:top-[18px] top-[13px] md:right-8 right-4 object-contain"
                    src="/nextImg.png"
                    alt="Next"
                  />
                </div>
              </div>

              {/* Color Picker Dialog */}
              <Dialog
                open={isColorPickerOpen}
                onClose={handleColorPickerClose}
                aria-labelledby="color-picker-dialog-title"
              >
                <div className="md:w-[400px] w-[330px]">
                  <DialogTitle id="color-picker-dialog-title">
                    <p className="text-black font-bold text-xl text-center">
                      Color Picker
                    </p>
                  </DialogTitle>
                  <DialogContent>
                    <ColorPicker
                      color={selectedColor}
                      onChange={setSelectedColor}
                    />
                  </DialogContent>
                  <DialogActions className="!p-0 !flex !justify-center !items-center">
                    <div className="!flex !justify-center !items-center px-[24px] pb-[24px] w-full gap-3">
                      <button
                        type="button"
                        className="bg-[#127300] h-[45px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                        onClick={handleColorConfirm}
                      >
                        Ok
                      </button>
                      <button
                        type="button"
                        className="bg-[#127300] h-[45px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                        onClick={handleColorPickerClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </DialogActions>
                </div>
              </Dialog>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default isAuth(AddProduct);
