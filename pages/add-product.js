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
import isAuth from "@/components/isAuth";
import Compressor from "compressorjs";

const size = [
  {
    label: "XXS",
    value: "XXS",
    total: 0,
    sell: 0,
  },
  {
    label: "XS",
    value: "XS",
    total: 0,
    sell: 0,
  },
  {
    label: "S",
    value: "S",
    total: 0,
    sell: 0,
  },
  {
    label: "M",
    value: "M",
    total: 0,
    sell: 0,
  },
  {
    label: "L",
    value: "L",
    total: 0,
    sell: 0,
  },
  {
    label: "XL",
    value: "XL",
    total: 0,
    sell: 0,
  },
  {
    label: "XXL",
    value: "XXL",
    total: 0,
    sell: 0,
  },
  {
    label: "3xl",
    value: "3xl",
    total: 0,
    sell: 0,
  },
  {
    label: "4xl",
    value: "4xl",
    total: 0,
    sell: 0,
  },
  {
    label: "5xl",
    value: "5xl",
    total: 0,
    sell: 0,
  },
  {
    label: "For adult",
    value: "For adult",
    total: 0,
    sell: 0,
  },
];

function AddProduct(props) {
  const router = useRouter();
  console.log(router);
  console.log(router?.query?.id);

  const f = useRef(null);
  const unitData = [
    { name: "Gram", value: "gm" },
    { name: "Kg", value: "kg" },
    { name: "MiliLitre", value: "ml" },
    { name: "Litre", value: "litre" },
    { name: "Piece", value: "piece" },
    { name: "Pack", value: "pack" },
  ];
  const [addProductsData, setAddProductsData] = useState({
    name: "",
    category: [],
    // price: "",
    // offer: "",
    origin: "",
    unit: "",
    other_price: "",
    our_price: "",
    // selflife: "",
    expirydate: "",
    manufacturername: "",
    manufactureradd: "",
    short_description: "",
    // gender: "",
    long_description: "",
    price_slot: [
      {
        unit: "",
        value: 0,
        our_price: 0,
        other_price: 0,
      },
    ],
  });

  const [categoryData, setCategoryData] = useState([]);
  const [user, setUser] = useContext(userContext);
  // const [unitData, setUnitData] = useState([]);

  const [varients, setvarients] = useState([
    {
      color: "",
      image: [],
      selected: [],
    },
  ]);
  const [openPopup, setOpenPopup] = useState(false);
  const [color, setColor] = useColor("#000000");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [singleImg, setSingleImg] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleClose = () => {
    setOpenPopup(false);
  };

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (router?.query?.id) {
      getProductById();
    }
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getProductById = async (id) => {
    props.loader(true);
    Api("get", `getProductById/${router?.query?.id}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.status) {
          setAddProductsData({
            name: res?.data?.name,
            category: res?.data?.category._id,
            categoryName: res?.data?.category.name,
            // price: res?.data?.price,
            // offer: res?.data?.offer,
            short_description: res?.data?.short_description,
            // gender: res?.data?.gender,
            long_description: res?.data?.long_description,
            price_slot: res?.data?.price_slot,
            ...res.data,
            attributes: res?.data?.attributes,
            manufactureradd: res?.data?.manufactureradd,
            manufacturername: res?.data?.manufacturername,
            expirydate: res?.data?.expirydate,
            other_price: res?.data?.other_price,
            our_price: res?.data?.our_price,
            unit: res?.data?.price_slot[0]?.unit,
          });
          setvarients(res?.data?.varients);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  console.log("Add Products Data ::", addProductsData);
  // console.log("Add UNIT Data ::",addProductsData.unit);

  const getCategory = async () => {
    props.loader(true);
    Api("get", "getCategory", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        res.data.forEach((element, i) => {
          element.value = element._id;
          element.label = element.name;

          if (res.data.length === i + 1) {
            setCategoryData(res?.data);
            console.log("categorydata ::", res?.data);
          }
        });
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const createProduct = async (e) => {
    e.preventDefault();

    const data = {
      ...addProductsData,
      userid: user?._id,
      // category: addProductsData.category._id,
      // categoryName: addProductsData.category.name,
      varients,
    };
    console.log(data);
    console.log(addProductsData);

    props.loader(true);
    Api("post", "createProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================> careate Product :: ", res);
        if (res.status) {
          setAddProductsData({
            name: "",
            category: [],
            unit: "",
            our_price: "",
            other_price: "",
            // price: "",
            // offer: "",
            origin: "",
            selflife: "",
            expirydate: "",
            manufacturername: "",
            manufactureradd: "",
            short_description: "",
            // gender: "",
            long_description: "",
            price_slot: [
              {
                unit: "",
                value: 0,
                our_price: 0,
                other_price: 0,
              },
            ],
          });
          setvarients([
            {
              color: "",
              image: [],
              selected: [],
            },
          ]);
          router.push("/inventory");
          props.toaster({ type: "success", message: res.data?.message });
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

  const updateProduct = async (e) => {
    e.preventDefault();

    const data = {
      ...addProductsData,
      userid: user?._id,
      // category: addProductsData.category._id,
      // categoryName: addProductsData.category.name,
      varients,
      id: router?.query?.id,
    };

    console.log(data);
    console.log(addProductsData);

    props.loader(true);
    Api("post", "updateProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res.status) {
          setAddProductsData({
            name: "",
            category: [],
            unit: "",
            our_price: "",
            other_price: "",
            // price: "",
            // offer: "",
            origin: "",
            selflife: "",
            expirydate: "",
            manufacturername: "",
            manufactureradd: "",
            short_description: "",
            // gender: "",
            long_description: "",
            price_slot: [
              {
                value: 0,
                price: 0,
              },
            ],
          });
          setvarients([
            {
              color: "",
              image: [],
              selected: [],
            },
          ]);
          router.push("/inventory");
          props.toaster({ type: "success", message: res.data?.message });
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

  const handleImageChange = (event, i) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > 1) {
      props.toaster({ type: "error", message: "Too large file. Please upload a smaller image" });
      return;
    } else {
      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult) => {
          console.log(compressedResult)
          const data = new FormData()
          data.append('file', compressedResult)
          props.loader(true);
          ApiFormData("post", "auth/user/fileupload", data, router).then(
            (res) => {
              props.loader(false);
              console.log("res================>", res);
              if (res.status) {
                setvarients(
                  produce((draft) => {
                    draft[i].image.push(res.data.file);
                  })
                );
                // setvarients(res.data.file)
                setSingleImg(res.data.file)
                props.toaster({ type: "success", message: res.data.message });
              }
            },
            (err) => {
              props.loader(false);
              console.log(err);
              props.toaster({ type: "error", message: err?.message });
            }
          );
          // compressedResult has the compressed file.
          // Use the compressed file to upload the images to your server.        
          //   setCompressedFile(res)
        },
      });
    }
    const reader = new FileReader();
  };

  // const closeIcon = (item, i) => {
  //   const d = varients[i].image.filter((f) => f !== item);
  //   setvarients(
  //     produce((draft) => {
  //       draft[i].image = d;
  //     })
  //   );
  // };

  const closeIcon = (item, inx, imagesArr, i) => {
    const nextState = produce(imagesArr, draftState => {
      if (inx !== -1) {
        draftState.splice(inx, 1);
      }
    })
    setvarients(
      produce((draft) => {
        // console.log(draft)
        draft[i].image = nextState
      })
    );
  }

  const colorCloseIcon = (item, i) => {
    console.log(item, i);
    let data = varients;
    if (i > -1) {
      data.splice(i, 1);
    }
    console.log(data);
    setvarients([...varients]);
  };

  const priceSlotsCloseIcon = (item, i) => {
    console.log(item, i);
    let data = addProductsData.price_slot;
    if (i > -1) {
      data.splice(i, 1);
    }
    console.log(data);
    setAddProductsData({ ...addProductsData, price_slot: data });
  };

  return (
    <section className="w-full h-full  bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      <div className="md:pt-[0px] pt-[0px] h-full overflow-scroll no-scrollbar">
        <p className="text-custom-black font-bold md:text-[32px] text-2xl md:pb-0 pb-5">
          Add Product
        </p>

        <form
          className="pb-14"
          onSubmit={router?.query?.id ? updateProduct : createProduct}
        >
          <div className=" md:pb-10 bg-transparent h-full w-full md:mt-5">
            {/* md:mt-9 pt-5*/}
            <div className="md:px-10 px-5 pb-5 bg-white h-full w-full boxShadow">
              <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
                <div className="pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Product Name
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Product Name"
                      value={addProductsData.name}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          name: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>

                <div className="md:pt-5">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Category
                  </p>

                  {/* <MultiSelect className='w-full'
                                    hasSelectAll={false}
                                    options={categoryData}
                                    value={addProductsData?.category}
                                    onChange={((e) => {
                                        console.log('category=================>', e)
                                        setAddProductsData({ ...addProductsData, category: e })
                                    })}
                                    // required
                                    labelledBy="Select Staff"
                                    ClearSelectedIcon
                                /> */}

                  <div className="relative px-3 w-full bg-transparent border border-custom-newGray rounded-[10px]">
                    <select
                      value={addProductsData.category._id}
                      onChange={(newValue) => {
                        console.log(newValue);

                        const cat = categoryData.find(
                          (f) => f._id === newValue.target.value
                        );
                        setAddProductsData({
                          ...addProductsData,
                          category: newValue.target.value,
                          categoryName: cat.name,
                          attributes: cat.attributes,
                        });
                      }}
                      required
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-8 pr-5  outline-none text-custom-darkGrayColor text-base font-light"
                      placeholder="Category"
                    >
                      <option value={""} className="p-5">
                        Category
                      </option>
                      {categoryData?.map((item, i) => (
                        <option key={i} value={item._id} className="p-5">
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>



                {/* <div className="">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Self Life
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="text"
                      placeholder="Self Life"
                      value={addProductsData.selflife}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          selflife: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div> */}

                <div className="">
                  <p className="text-custom-darkGray text-base font-normal pb-1">
                    Expiry Date
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                      type="date"
                      placeholder=""
                      value={addProductsData.expirydate}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          expirydate: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
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
                      value={addProductsData.short_description}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          short_description: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
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
                      value={addProductsData.long_description}
                      onChange={(e) =>
                        setAddProductsData({
                          ...addProductsData,
                          long_description: e.target.value,
                        })
                      }
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
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
                      value={addProductsData.origin}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          origin: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
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
                      value={addProductsData.manufacturername}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          manufacturername: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
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
                      value={addProductsData.manufactureradd}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          manufactureradd: e.target.value,
                        });
                      }}
                      required
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>



              </div>

              {/* <div className="pt-5">
                <p className="text-custom-darkGray text-base font-normal pb-1">
                  Price Per unit
                </p>
                <div className="relative">
                  <input
                    className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                    type="text"
                    placeholder="Price per unit"
                    value={addProductsData.price}
                    onChange={(e) => {
                      setAddProductsData({
                        ...addProductsData,
                        price: e.target.value,
                      });
                    }}
                    required
                  />
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                </div>
              </div> */}

              {/* <div className="pt-5">
                <p className="text-custom-darkGray text-base font-normal pb-1">
                  Offer
                </p>
                <div className="relative">
                  <input
                    className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                    type="text"
                    placeholder="Offer"
                    value={addProductsData.offer}
                    onChange={(e) => {
                      setAddProductsData({
                        ...addProductsData,
                        offer: e.target.value,
                      });
                    }}
                    required
                  />
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                </div>
              </div> */}

              {/* <div className="pt-5">
                <p className="text-custom-darkGray text-base font-normal pb-1">
                  Gender
                </p>
                <div className="relative px-3 w-full bg-transparent border border-custom-newGray rounded-[10px]">
                  <select
                    value={addProductsData.gender}
                    onChange={(newValue) => {
                      setAddProductsData({
                        ...addProductsData,
                        gender: newValue.target.value,
                      });
                    }}
                    required
                    className="bg-transparent w-full md:h-[46px] h-[40px] pl-8 pr-5  outline-none text-custom-darkGrayColor text-base font-light"
                    placeholder="Select Gender"
                  >
                    <option value="" className="p-5">
                      Select Gender
                    </option>
                    <option value="Male" className="p-5">
                      Male
                    </option>
                    <option value="Female" className="p-5">
                      Female
                    </option>
                    <option value="Unisex" className="p-5">
                      Unisex
                    </option>
                  </select>
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                </div>
              </div> */}



              {/* **************************** Attribute code start */}

              {/* <div className="w-full">
                <p className="text-2xl font-medium text-custom-gray pt-5 pb-4">
                  Attributes
                </p>
                <div className="border-custom-newGrayColor border px-4 py-5 rounded-md ">
                  {addProductsData?.attributes?.map((attr, inx) => (
                    <div className="w-full" key={inx}>
                      <p className="text-custom-darkGray text-base font-normal pb-1">
                        {attr?.name}
                      </p>
                      <input
                        className="bg-transparent mb-5 w-full md:h-[46px] h-[40px] pl-6 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                        type="text"
                        placeholder="Value"
                        value={attr?.value}
                        onChange={(e) => {
                          attr.value = e.target.value;
                          setAddProductsData({ ...addProductsData });
                        }}

                      />
                    </div>
                  ))}
                </div>
              </div> */}

              {/* ************************* attribute code end */}

              {/* Varient color input code start */}
              <div className="w-full">
                <p className="text-2xl font-medium text-custom-gray pt-5">
                  Upload Image
                </p>
                {varients.map((item, i) => (
                  <div
                    key={i}
                    className="w-full bg-transparent border border-custom-newGrayColor mt-5 p-5 rounded-[10px] relative"
                  >
                    {/* <IoCloseCircleOutline
                      className="text-red-700 cursor-pointer h-5 w-5 absolute top-[20px] right-[20px]"
                      onClick={() => {
                        colorCloseIcon(item, i);
                      }}
                    /> */}

                    {Array.isArray(addProductsData?.attributes) &&
                      addProductsData.attributes.some(
                        (attribute) => attribute.name === "color"
                      ) && (
                        <div className="flex md:flex-row flex-col justify-between items-center">
                          <div className="md:w-[85%] w-full">
                            <p className="text-custom-darkGray text-base font-normal pb-1">
                              Color
                            </p>
                            <div className="relative">
                              <input
                                type="text"
                                className="bg-transparent w-full md:h-[46px] h-[40px] pl-5 pr-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                                value={item.color}
                                onChange={(e) => {
                                  setvarients(
                                    produce((draft) => {
                                      draft[i].color = e.target.value;
                                    })
                                  );
                                }}
                                required
                              />
                              <p
                                className="md:w-5 w-3 md:h-5 h-3 rounded-full absolute top-[13px] right-[10px] cursor-pointer border border-black"
                                style={{ backgroundColor: item.color }}
                                onClick={() => {
                                  setOpenPopup(true);
                                  setCurrentIndex(i);
                                }}
                              ></p>

                              <Dialog
                                open={openPopup}
                                onClose={handleClose}
                                aria-labelledby="draggable-dialog-title"
                              >
                                <div className="md:w-[400px] w-[330px]">
                                  <DialogTitle
                                    style={{ cursor: "move" }}
                                    id="draggable-dialog-title"
                                  >
                                    <p className="text-black font-bold text-xl text-center">
                                      Color Picker
                                    </p>
                                  </DialogTitle>
                                  <DialogContent>
                                    <ColorPicker
                                      color={color}
                                      onChange={setColor}
                                    />
                                  </DialogContent>
                                  <DialogActions className="!p-0 !flex !justify-center !items-center">
                                    <div className="!flex !justify-center !items-center px-[24px] pb-[24px] w-full gap-3">
                                      <button
                                        className="bg-custom-darkpurple h-[45px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                                        onClick={() => {
                                          setvarients(
                                            produce((draft) => {
                                              draft[i].color = color.hex;
                                            })
                                          );
                                          setOpenPopup(false);
                                        }}
                                      >
                                        Ok
                                      </button>
                                      <button
                                        className="bg-custom-darkpurple h-[45px] w-full rounded-[12px] NunitoSans text-white font-normal text-base"
                                        onClick={handleClose}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </DialogActions>
                                </div>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Upload image code start  */}
                    <div className="flex md:justify-start justify-start items-start md:items-center md:w-auto w-full pt-[25px]">
                      <div className="relative">
                        <div className="border-2 border-dashed border-custom-newGray md:h-[38px] w-[38px] rounded-[5px] flex flex-col justify-center items-center bg-white">
                          <input
                            className="outline-none bg-custom-light md:w-[90%] w-[85%]"
                            type="text"
                            value={singleImg}
                            onChange={(text) => {
                              setSingleImg(text.target.value);
                            }}
                          />
                        </div>

                        <div className="absolute md:top-[10px] top-[4px] md:left-[9px] left-[9px] cursor-pointer ">
                          <IoAddSharp
                            className="text-black w-[20px] h-[20px]"
                            onClick={() => {
                              f.current.click();
                            }}
                          />
                          <input
                            type="file"
                            ref={f}
                            className="hidden"
                            onChange={(event) => {
                              handleImageChange(event, i);
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-custom-darkGrayColor text-base font-normal ml-5">
                        Upload Photo
                      </p>
                    </div>

                    <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
                      {item?.image?.map((ig, inx) => (
                        <div className="relative" key={inx}>
                          <img
                            className="md:w-20 w-[85px] h-20 object-contain"
                            src={ig}
                          />
                          <IoCloseCircleOutline
                            className="text-red-700 cursor-pointer h-5 w-5 absolute left-[5px] top-[10px]"
                            onClick={() => {
                              closeIcon(ig, inx, item?.image, i)
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Size input code start******** */}
                    {Array.isArray(addProductsData?.attributes) &&
                      addProductsData.attributes.map((attribute, id) => (
                        <div key={id}>
                          {attribute.name === "size" && (
                            <div className="pt-2">
                              <p className="text-custom-darkGray  text-base font-normal pb-1">
                                Size
                              </p>
                              <MultiSelect
                                className="w-[85%] "
                                options={size}
                                value={item.selected}
                                onChange={(selected) => {
                                  setvarients(
                                    produce((draft) => {
                                      draft[i].selected = selected;
                                    })
                                  );
                                }}
                                required
                                labelledBy="Select Sizes"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}

                {/* Size input code********** end here */}

                {/* Add more Button code start */}

                {/* <div className="flex md:flex-row flex-col justify-start items-center w-full pt-5 md:gap-0 gap-5">
                  <div
                    className="relative flex justify-center items-center md:w-auto w-full"
                    onClick={() => {
                      setvarients([
                        ...varients,
                        {
                          color: "",
                          image: [],
                          selected: [],
                        },
                      ]);
                    }}
                  >
                    <p className="bg-custom-darkpurple cursor-pointer md:pr-8 md:h-[50px] h-[40px] md:w-[188px] w-full flex justify-center items-center rounded-[5px] md:text-xl text-base text-white font-normal">
                      Add more
                    </p>
                    <img
                      className="md:w-[8px] w-[7px] md:h-[17px] h-[15px] absolute md:top-[18px] top-[13px] md:right-8 right-4 object-contain"
                      src="/nextImg.png"
                    />
                  </div>
                </div> */}
              </div>

              {/* Pricing field code start from here */}
              <div className="pt-5">
                <p className="text-2xl font-medium text-custom-gray">Pricing</p>
                <div className="w-full bg-transparent border border-custom-newGrayColor mt-5 p-5 rounded-[10px]">
                  <div className="grid md:grid-cols-5 grid-cols-1 w-full gap-5">
                    {addProductsData?.price_slot?.map((slot, d) => (
                      <div
                        key={d}
                        className="border border-custom-newGrayColors rounded p-5 w-full"
                      >
                        <div className="flex justify-between items-center w-full">
                          <p className="text-xl font-medium text-custom-gray">
                            Slot {d + 1}
                          </p>
                          {d > 0 && (
                            <IoIosClose
                              className="w-[30px] h-[30px] text-custom-darkGrayColors"
                              onClick={() => {
                                priceSlotsCloseIcon(slot, d);
                              }}
                            />
                          )}
                        </div>

                        <div className="pt-5">
                          <p className="text-custom-gray text-base font-normal pb-1">
                            Qty
                          </p>
                          <input
                            className="bg-custom-offWhiteColors w-full h-[33px] px-2 outline-none text-custom-darkGrayColor text-base font-light"
                            type="number"
                            value={slot.value}
                            onChange={(e) => {
                              slot.value = e.target.value;
                              setAddProductsData({ ...addProductsData });
                            }}
                            required
                          />
                        </div>

                        {/* <div className="pt-5">
                          <p className="text-custom-gray text-base font-normal pb-1">
                            Price
                          </p>
                          <input
                            className="bg-custom-offWhiteColors w-full h-[33px] px-2 outline-none text-custom-darkGrayColor text-base font-light"
                            type="number"
                            value={slot.price}
                            onChange={(e) => {
                              slot.price = e.target.value;
                              setAddProductsData({ ...addProductsData });
                            }}
                            required
                          />
                        </div> */}

                        {/* New Field add here */}
                        <div className="mt-5">
                          <p className="text-custom-gray text-base font-normal pb-1">
                            Unit
                          </p>
                          <select className="bg-custom-offWhiteColors w-full h-[33px] px-2 outline-none text-custom-darkGrayColor text-base font-light"
                            name="unit"
                            value={slot.unit}
                            onChange={(e) => {
                              slot.unit = e.target.value,
                                setAddProductsData({ ...addProductsData })
                            }
                            }
                            required
                          >
                            <option value="">Select Unit</option>
                            {unitData.map((unit) => (
                              <option key={unit.value} value={unit.value}>
                                {unit.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-5">
                          <p className="text-custom-gray text-base font-normal pb-1">
                            Offer Price
                          </p>
                          <input
                            className="bg-custom-offWhiteColors w-full h-[33px] px-2 outline-none text-custom-darkGrayColor text-base font-light"
                            type="number"
                            value={slot.our_price}
                            onChange={(e) => {
                              slot.our_price = e.target.value;
                              setAddProductsData({ ...addProductsData });
                            }}
                            required
                          />
                        </div>

                        <div className="pt-5">
                          <p className="text-custom-gray text-base font-normal pb-1">
                            Price
                          </p>
                          <input
                            className="bg-custom-offWhiteColors w-full h-[33px] px-2 outline-none text-custom-darkGrayColor text-base font-light"
                            type="number"
                            value={slot.other_price}
                            onChange={(e) => {
                              slot.other_price = e.target.value;
                              setAddProductsData({ ...addProductsData });
                            }}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex md:flex-row flex-col justify-end items-end w-full pt-5 md:gap-0 gap-5">
                    <div
                      className="relative flex justify-center items-center md:w-auto w-full"
                      onClick={() => {
                        setAddProductsData({
                          ...addProductsData,
                          price_slot: [
                            ...addProductsData.price_slot,
                            {
                              unit: "",
                              value: "",
                              our_price: 0,
                              other_price: 0,
                            },
                          ],
                        });
                      }}
                    >
                      <button
                        type="button"
                        className="bg-custom-darkpurple md:pr-8 md:h-[50px] h-[40px] md:w-[188px] w-full rounded-[5px] md:text-xl text-base text-white font-normal"
                      >
                        Add more
                      </button>
                      <img
                        className="md:w-[8px] w-[7px] md:h-[17px] h-[15px] absolute md:top-[18px] top-[13px] md:right-8 right-4 object-contain"
                        src="/nextImg.png"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-row flex-col justify-between items-center w-full pt-20 md:gap-0 gap-5">
                <div className="relative flex justify-center items-center md:w-auto w-full">
                  {/* <button className='bg-transparent md:pl-8 md:h-[50px] h-[40px] md:w-[168px] w-full rounded-[5px] border border-custom-gray md:text-xl text-base text-custom-gray font-normal'>Cancel</button>
                                    <img className='md:w-[24px] w-[20px] md:h-[24px] h-[20px] absolute md:top-[12px] top-[9px] md:left-7 left-5' src='/deleteImg.png' /> */}
                </div>
                <div className="relative flex justify-center items-center md:w-auto w-full">
                  <button
                    className="bg-custom-darkpurple md:pr-8 md:h-[50px] h-[40px] md:w-[188px] w-full rounded-[5px] md:text-xl text-base text-white font-normal"
                    type="submit"
                  >
                    {router?.query?.id ? "Update" : "Submit"}
                  </button>
                  <img
                    className="md:w-[8px] w-[7px] md:h-[17px] h-[15px] absolute md:top-[18px] top-[13px] md:right-8 right-4 object-contain"
                    src="/nextImg.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default isAuth(AddProduct);
