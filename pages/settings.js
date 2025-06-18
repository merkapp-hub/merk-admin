import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { useRouter } from "next/router";
import { IoCloseCircleOutline } from "react-icons/io5";
import { Api, ApiFormData } from "@/services/service";
import isAuth from "@/components/isAuth";
import Compressor from "compressorjs";
import { userContext } from "./_app";
import { TiTimes } from "react-icons/ti";
import { BiChevronDown } from "react-icons/bi";

function Settings(props) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const f = useRef(null);
  const [carouselImg, setCarouselImg] = useState([]);
  const [singleImg, setSingleImg] = useState("");
  const [product_id, setproduct_id] = useState("");
  const [settingsId, setSettingsId] = useState("");
  const [productlist, setproductlist] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [user, setUser] = useContext(userContext);
  const [tax, setTax] = useState("");
  const [ServiceFee, setServiceFee] = useState("");
  const [taxPlaceholder, setTaxPlaceholder] = useState("0.00%");
  const [ServiceFeePlaceHolder, setServiceFeePlaceHolder] = useState("0.00");
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [adminPhone, setAdminPhone] = useState(user?.number || "");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [timeSlot, setTimeSlot] = useState({
    startTime: "",
    endTime: "",
  });
  const [timeSlots, setTimeSlots] = useState([
    { _id: 1, startTime: "09:00 AM", endTime: "10:00 AM" },
    { _id: 2, startTime: "10:00 AM", endTime: "11:00 AM" },
    { _id: 3, startTime: "11:00 AM", endTime: "12:00 PM" },
    { _id: 4, startTime: "12:00 PM", endTime: "01:00 PM" },
    { _id: 5, startTime: "01:00 PM", endTime: "02:00 PM" },
    { _id: 6, startTime: "02:00 PM", endTime: "03:00 PM" },
    { _id: 7, startTime: "03:00 PM", endTime: "04:00 PM" },
    { _id: 8, startTime: "04:00 PM", endTime: "05:00 PM" },
    { _id: 9, startTime: "05:00 PM", endTime: "06:00 PM" },
    { _id: 10, startTime: "06:00 PM", endTime: "07:00 PM" },
    { _id: 11, startTime: "07:00 PM", endTime: "08:00 PM" },
    { _id: 12, startTime: "08:00 PM", endTime: "09:00 PM" },
    { _id: 13, startTime: "09:00 PM", endTime: "10:00 PM" },
    { _id: 14, startTime: "10:00 PM", endTime: "11:00 PM" },
    { _id: 15, startTime: "11:00 PM", endTime: "12:00 AM" },
    { _id: 16, startTime: "12:00 AM", endTime: "01:00 AM" },
    { _id: 17, startTime: "01:00 AM", endTime: "02:00 AM" },
    { _id: 18, startTime: "02:00 AM", endTime: "03:00 AM" },
    { _id: 19, startTime: "03:00 AM", endTime: "04:00 AM" },
    { _id: 20, startTime: "04:00 AM", endTime: "05:00 AM" },
    { _id: 21, startTime: "05:00 AM", endTime: "06:00 AM" },
    { _id: 22, startTime: "06:00 AM", endTime: "07:00 AM" },
    { _id: 23, startTime: "07:00 AM", endTime: "08:00 AM" },
    { _id: 24, startTime: "08.00 AM", endTime: "09.00 AM" },
  ]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [tips, setTips] = useState([]);
  const [deliveryChargePlaceholder, setDeliveryChargePlaceholder] =
    useState("0.00");

  const [newTips, setNewTips] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    getsetting();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > 1) {
      props.toaster({ type: "success", message: res.data.message });
      return;
    } else {
      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult) => {
          console.log(compressedResult);
          const data = new FormData();
          data.append("file", compressedResult);
          props.loader(true);
          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              props.loader(false);
              console.log("res================>", res);
              if (res.status) {
                setSingleImg(res.data.file);
                props.toaster({
                  type: "info",
                  message: "Carousel image added locally. Click Submit to save in the database.",
                });

              }
            },
            (err) => {
              props.loader(false);
              console.log(err);
              props.toaster({ type: "error", message: err?.message });
            }
          );
        },
      });
    }
    // const data = new FormData()
    // data.append('file', file)
    // props.loader(true);
    // ApiFormData("post", "/user/fileupload", data, router).then(
    //     (res) => {
    //         props.loader(false);
    //         console.log("res================>", res);
    //         if (res.status) {
    //             setSingleImg(res.data.file)
    //             props.toaster({ type: "success", message: res.data.message });
    //         }
    //     },
    //     (err) => {
    //         props.loader(false);
    //         console.log(err);
    //         props.toaster({ type: "error", message: err?.message });
    //     }
    // );
    const reader = new FileReader();
  };

  const submit = (e) => {
    e.preventDefault();
    console.log(carouselImg);
    props.loader(true);
    let data = {
      carousel: carouselImg,
    };
    if (settingsId) {
      data.id = settingsId;
    }
    console.log(data);
    props.loader(true);
    Api(
      "post",
      `${settingsId ? `updatesetting` : `createsetting`}`,
      data,
      router
    ).then(
      (res) => {
        console.log("res================>", res);
        props.loader(false);

        if (res?.success) {
          setSubmitted(false);
          props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const createTax = (e) => {
    e.preventDefault();
    console.log(carouselImg);
    props.loader(true);
    let data = {
      userId: user?._id,
      taxRate: tax,
    };
    console.log(data);
    props.loader(true);
    Api("post", `addOrUpdateTax`, data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);

        if (res?.status === true) {
          console.log(res?.data?.message);
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };


  const createServiceFee = (e) => {
    e.preventDefault();

    props.loader(true);
    let data = {
      userId: user?._id,
      Servicefee: ServiceFee,
    };
    console.log(data);
    props.loader(true);
    Api("post", `addOrUpdateServicefee`, data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);

        if (res?.status === true) {
          console.log(res?.data?.message);
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateAdminProfile = (e) => {
    e.preventDefault();
    props.loader(true);

    const email = adminEmail?.trim();
    const password = adminPassword;
    const confirmPassword = adminConfirmPassword;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!email || !emailRegex.test(email)) {
      props.loader(false);
      props.toaster({ type: "error", message: "Invalid email address" });
      return;
    }

    if (password !== confirmPassword) {
      props.loader(false);
      props.toaster({ type: "error", message: "Passwords do not match" });
      return;
    }

    // if (!passwordRegex.test(password)) {
    //   props.loader(false);
    //   props.toaster({
    //     type: "error",
    //     message:
    //       "Password must be at least 6 characters long and contain at least one letter and one number",
    //   });
    //   return;
    // }

    Api(
      "patch",
      `updateAdminDetails/${user._id}`,
      { email, password },
      router
    ).then(
      (res) => {
        console.log("res================>", res);
        props.loader(false);

        if (res?.status === true) {
          props.loader(false);
          // setSubmitted(false);
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getTax = useCallback(() => {
    Api("get", `getTax`, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.data);
        console.log(res?.data[0]?.taxRate)
        if (res?.data[0]?.taxRate === undefined || res?.data[0]?.taxRate === "") {
          setTaxPlaceholder("0.00");
        } else {
          setTaxPlaceholder(res?.data[0]?.taxRate);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        // props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  }, [props.loader, router]);

  const getFee = useCallback(() => {
    Api("get", `getServiceFee`, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.data);
        if (res?.data[0]?.Servicefee === undefined || res?.data[0]?.Servicefee === "") {
          setServiceFeePlaceHolder("0.00");
        } else {
          setServiceFeePlaceHolder(res?.data[0]?.Servicefee);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        // props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  }, [props.loader, router]);


  const getTimeSlot = useCallback(() => {
    Api("get", `get-timeslot?type=admin`, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);
        if (res?.status === true) {
          console.log(res?.data?.timeSlots);
          setAvailableTimeSlots(res?.data?.timeSlots);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        // props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  }, [props.loader, router]);

  const getDeliveryCharge = useCallback(() => {
    Api("get", `getDeliveryCharge`, router).then(
      (res) => {
        props.loader(false);
        console.log(res?.data);
        setDeliveryChargePlaceholder(res?.data?.deliveryCharge);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        // props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  }, [props.loader, router]);

  const getDeliveryPartnerTip = useCallback(() => {
    Api("get", `getDeliveryPartnerTip`, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);
        if (res?.status === true) {
          console.log(res?.data?.timeSlots);
          setTips(res?.data?.deliveryPartnerTip);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        // props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  }, [props.loader, router]);

  const createTimeSlot = (e) => {
    e.preventDefault();
    props.loader(true);
    let data = {
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
    };
    console.log(data);
    props.loader(true);
    Api("post", `create-timeslot`, data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);
        setTimeSlot({
          startTime: "",
          endTime: "",
        });
        if (res?.status === true) {
          console.log(res?.data?.message);
          getTimeSlot();
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: "Failed to add" });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const deleteTimeSlot = (id) => {
    props.loader(true);
    Api("delete", `delete-timeslot/${id}`, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);
        if (res?.status === true) {
          console.log(res?.data?.message);
          setAvailableTimeSlots((prevSlots) =>
            prevSlots.filter((slot) => slot._id !== id)
          );
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateTimeSlot = (id, status) => {
    props.loader(true);
    Api("patch", `update-timeslot/${id}`, { status }, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);
        if (res?.status === true) {
          console.log(res?.data?.message);
          getTimeSlot();
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const deleteTip = (tip) => {
    props.loader(true);
    Api("delete", `deleteDeliveryTip`, { tips: [tip] }, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);
        if (res?.status === true) {
          console.log(res?.data?.message);
          setTips(res?.data?.deliveryPartnerTip);
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const createDeliveryCharge = (e) => {
    e.preventDefault();
    props.loader(true);
    let data = {
      deliveryCharge: deliveryCharge,
    };
    console.log(data);
    props.loader(true);
    Api("post", `createDeliveryCharge`, data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);

        if (res?.status === true) {
          console.log(res?.data?.message);
          setDeliveryCharge("");
          setDeliveryChargePlaceholder(res?.data?.deliveryCharge);
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const createDeliveryPartnerTip = (e) => {
    e.preventDefault();

    const tipArray = newTips
      .split(",")
      .map((t) => parseFloat(t.trim()))
      .filter((t) => !isNaN(t));

    if (tipArray.length === 0) return alert("Enter valid numeric tips.");

    props.loader(true);
    let data = {
      tips: tipArray,
    };
    console.log(data);
    props.loader(true);
    Api("post", `createDeliveryPartnerTip`, data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.status);

        if (res?.status === true) {
          console.log(res?.data?.message);
          setNewTips("");
          setTips(res?.data?.deliveryPartnerTip);
          props.toaster({ type: "success", message: res?.data?.message });
        } else {
          console.log(res?.data?.message);
          setNewTips("");
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        // props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  useEffect(() => {
    getTax();
    getFee();
    getDeliveryCharge();
    getDeliveryPartnerTip();
  }, []);

  useEffect(() => {
    getTimeSlot();
  }, [getTimeSlot]);

  const searchproduct = async (text) => {
    // props.loader(true);
    Api("get", `productSearch?key=${text}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.status) {
          setproductlist(res?.data);
          setIsOpen(true);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
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
  const getsetting = async () => {
    props.loader(true);
    Api("get", "getsetting", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          if (res?.setting.length > 0) {
            setSettingsId(res?.setting[0]._id);
            setCarouselImg(res?.setting[0].carousel);
          }
          // setCarouselImg(res?.setting)
          // props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
          console.log(res?.data?.message);
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

  const closeIcon = (item) => {
    const d = carouselImg.filter((f) => f.image !== item.image);
    setCarouselImg(d);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    searchproduct(value);
  };

  const handleOptionClick = (option) => {
    setInputValue(option.name); // Set selected value
    setproduct_id(option._id); // Set selected id
    setIsOpen(false); // Close dropdown
  };

  return (
    <>
      <section className=" w-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5 h-[90vh] overflow-scroll no-scrollbar">
        <p className="text-custom-black font-bold  md:text-[32px] text-2xl">
          Carousel
        </p>

        <section className="px-5 pt-5 pb-5 bg-white rounded-[12px] overflow-scroll md:mt-5 mt-5 no-scrollbar">
          <form className="w-full" onSubmit={submit}>
            <div className="relative w-full">
              <div className="w-full">
                <p className="text-custom-gray text-lg font-semibold">
                  Carousel Images
                </p>
                <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                  <input
                    className="outline-none bg-custom-light md:w-[90%] w-[85%] text-black"
                    type="text"
                    placeholder="Carousel Images"
                    value={singleImg}
                    onChange={(text) => {
                      setSingleImg(text.target.value);
                    }}
                  // required
                  />
                </div>
                {submitted && carouselImg.carousel_image === "" && (
                  <p className="text-red-700 mt-1">
                    Carousel Images is required
                  </p>
                )}
              </div>

              <div className="absolute top-[32px] md:right-[10px]  right-[10px]">
                <MdOutlineFileUpload
                  className="text-black h-8 w-8"
                  onClick={() => {
                    f.current.click();
                  }}
                />
                <input
                  type="file"
                  ref={f}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="w-full relative">
              <p className="text-custom-gray text-lg font-semibold my-2">
                Product
              </p>
              <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                <input
                  className="outline-none bg-custom-light md:w-[90%] w-[85%] text-black"
                  type="text"
                  placeholder="Product Name"
                  value={inputValue}
                  onChange={handleInputChange}
                // required
                />
              </div>
            </div>
            {isOpen && (
              <ul className="relative top-0 bg-gray-400 max-h-[12rem] overflow-y-scroll">
                {productlist.map((option) => (
                  <li
                    key={option._id}
                    onClick={() => handleOptionClick(option)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end items-end mt-5">
              <p
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (singleImg === "") {
                    props.toaster({
                      type: "error",
                      message: "Carousel Images is required",
                    });
                    return;
                  }

                  const newImageObj = {
                    image: singleImg,
                    ...(product_id && { product_id }),
                  };
                  props.toaster({
                    type: "info",
                    message: "Carousel image added locally. Click Submit to save in the database.",
                  });

                  setCarouselImg([...carouselImg, newImageObj]);
                  setSingleImg("");
                  setInputValue("");
                }}

              >
                Add
              </p>
            </div>
            <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
              {carouselImg?.map((item, i) => (
                <div className="relative" key={i}>
                  <img
                    className="md:w-20 w-[85px] h-20 object-contain"
                    src={item.image}
                  />
                  <IoCloseCircleOutline
                    className="text-red-700 cursor-pointer h-3 w-3 absolute left-[5px] top-[10px]"
                    onClick={() => {
                      closeIcon(item);
                    }}
                  />
                </div>
              ))}
            </div>
            {carouselImg.length > 0 && (
              <p className="text-gray-600 text-sm mt-2">
                If You have added carousel images. Please click <strong>Submit</strong> to save them in the database.
                if not submitted, the images are only stored locally and will be lost on page reload.
              </p>
            )}

            <div className="flex justify-between mt-4 gap-5">
              <button
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px]  text-md py-21 w-36 h-10"
              >
                Submit
              </button>
            </div>
          </form>
        </section>

        {/* Tax Calculation and function */}
        <p className="text-custom-black font-bold  md:text-[32px] text-2xl mt-12 mb-1">
          Tax
        </p>

        <section className="px-5 pt-5 pb-5 bg-white rounded-[12px] overflow-scroll md:mt-5 mt-5 no-scrollbar">
          {/* md:mt-9 */}
          <form className="w-full" onSubmit={createTax}>
            <div className="w-full relative">
              <p className="text-custom-gray text-lg font-semibold my-2">
                Tax Percentage
              </p>
              <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                <input
                  className="outline-none bg-custom-light md:w-[90%] w-[85%] text-black"
                  type="text"
                  placeholder={taxPlaceholder + "%"}
                  value={tax}
                  onChange={(text) => {
                    const regex = /^[0-9]*\.?[0-9]*$/;
                    if (regex.test(text.target.value)) {
                      setTax(text.target.value);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end items-end mt-5">
              <button
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>
        </section>
        <p className="text-custom-black font-bold  md:text-[32px] text-2xl mt-12 mb-1">
          Service fee
        </p>

        <section className="px-5 pt-5 pb-5 bg-white rounded-[12px] overflow-scroll md:mt-5 mt-5 no-scrollbar">
          {/* md:mt-9 */}
          <form className="w-full" onSubmit={createServiceFee}>
            <div className="w-full relative">
              <p className="text-custom-gray text-lg font-semibold my-2">
                Service fee
              </p>
              <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                <input
                  className="outline-none bg-custom-light md:w-[90%] w-[85%] text-black"
                  type="text"
                  placeholder={ServiceFeePlaceHolder}
                  value={ServiceFee}
                  onChange={(text) => {
                    const regex = /^[0-9]*\.?[0-9]*$/;
                    if (regex.test(text.target.value)) {
                      setServiceFee(text.target.value);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end items-end mt-5">
              <button
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>
        </section>

        {/* Time Slot Calculation and function */}
        <p className="text-custom-black font-bold  md:text-[32px] text-2xl mt-12 mb-1">
          Time Slots
        </p>

        <section className="px-5 pt-5 pb-5 bg-white rounded-[12px] overflow-scroll md:mt-5 mt-5 no-scrollbar">
          {/* md:mt-9 */}
          <form className="w-full" onSubmit={createTimeSlot}>
            <div className="grid grid-cols-12 gap-4 w-full relative">
              <div className="col-span-6">
                <p className="text-custom-gray text-lg font-semibold my-2">
                  Store Opening Time
                </p>
                <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                  {/* <input
                    className="outline-none bg-custom-light text-black w-full"
                    type="text"
                    placeholder={taxPlaceholder + "%"}
                    value={tax}
                    onChange={(text) => {
                      const regex = /^[0-9]*\.?[0-9]*$/;
                      if (regex.test(text.target.value)) {
                        setTax(text.target.value);
                      }
                    }}
                  />
                </div> */}
                  <select
                    className="outline-none bg-custom-light text-black w-full"
                    value={timeSlot.startTime}
                    onChange={(e) =>
                      setTimeSlot({ ...timeSlot, startTime: e.target.value })
                    }
                  >
                    <option value="">Select Opening Time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot._id} value={slot.startTime}>
                        {slot.startTime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-span-6">
                <p className="text-custom-gray text-lg font-semibold my-2">
                  Store Closing Time
                </p>
                <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                  <select
                    className="outline-none bg-custom-light text-black w-full"
                    value={timeSlot.endTime}
                    onChange={(e) =>
                      setTimeSlot({ ...timeSlot, endTime: e.target.value })
                    }
                  >
                    <option value="">Select Closing Time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot._id} value={slot.endTime}>
                        {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-end mt-5">
              <button
                disabled={
                  timeSlot.startTime === "" || timeSlot.endTime === ""
                    ? true
                    : false
                }
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>

          {/* <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
            {availableTimeSlots?.map((item, i) => (
              <div
                className="relative bg-gray-200 px-3 py-1 rounded-sm"
                key={i}
              >
                <p className="text-custom-black font-bold text-base">
                  {item.startTime} - {item.endTime}
                </p>
                <TiTimes
                  className="text-red-700 cursor-pointer h-5 w-5 absolute -right-[7px] -top-[7px]"
                  onClick={() => {
                    deleteTimeSlot(item._id);
                  }}
                />
              </div>
            ))}
          </div> */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {availableTimeSlots?.map((item, i) => (
              <li key={i} className="px-4 py-3 w-60 border border-gray-200 rounded-lg shadow">
                <div className="">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base leading-6 font-bold text-gray-900">
                      {item.startTime} - {item.endTime}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="flex items-center text-sm font-medium text-gray-500">
                      Status:
                      <span onClick={() => {
                        updateTimeSlot(item._id, item.status ? false : true);
                      }} className={`${item.status ? "text-green-600" : "text-red-600"} cursor-pointer`}>
                        {item.status ? "Active" : "Inactive"}
                      </span> <BiChevronDown className={`${item.status ? "text-green-600" : "text-red-600"} size-4 cursor-pointer`} />
                    </p>
                    <button
                      onClick={() => {
                        deleteTimeSlot(item._id);
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-custom-black font-bold  md:text-[32px] text-2xl mt-12 mb-1">
          Delivery Charges
        </p>

        <section className="px-5 pt-5 pb-5 bg-white rounded-[12px] overflow-scroll md:mt-5 mt-5 no-scrollbar">
          {/* md:mt-9 */}
          <form className="w-full" onSubmit={createDeliveryCharge}>
            <div className="grid grid-cols-12 gap-4 w-full relative">
              <div className="col-span-6">
                <p className="text-custom-gray text-lg font-semibold my-2">
                  Delivery Charges
                </p>
                <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                  <input
                    className="outline-none bg-custom-light text-black w-full"
                    type="text"
                    placeholder={deliveryChargePlaceholder || "Delivery Charge"}
                    name="deliveryCharge"
                    value={deliveryCharge}
                    onChange={(e) => {
                      const regex = /^[0-9]*\.?[0-9]*$/;
                      if (regex.test(e.target.value)) {
                        setDeliveryCharge(e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-end mt-5">
              <button
                disabled={deliveryChargePlaceholder === deliveryCharge || deliveryCharge === ""}
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>

          {/* md:mt-9 */}
          <form className="w-full" onSubmit={createDeliveryPartnerTip}>
            <div className="grid grid-cols-12 gap-4 w-full relative">
              <div className="col-span-6">
                <p className="text-custom-gray text-lg font-semibold my-2">
                  Delivery Partner Tip
                </p>
                <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                  <input
                    className="outline-none bg-custom-light text-black w-full"
                    type="text"
                    placeholder="Delivery Partner Tip"
                    name="deliveryPartnerTip"
                    value={newTips}
                    onChange={(e) => {
                      const regex = /^(\d+(\.\d+)?(,\s*\d*(\.\d*)?)*)?$/;
                      if (regex.test(e.target.value)) {
                        setNewTips(e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end items-end mt-5">
              <button
                disabled={newTips === ""}
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>

          <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
            {tips?.map((item, i) => (
              <div
                className="relative bg-gray-200 px-3 py-1 rounded-sm"
                key={i}
              >
                <p className="text-custom-black font-bold text-base">{item}</p>
                <TiTimes
                  className="text-red-700 cursor-pointer h-5 w-5 absolute -right-[7px] -top-[7px]"
                  onClick={() => {
                    deleteTip(item);
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Tax Calculation and function */}
        <p className="text-custom-black font-bold  md:text-[32px] text-2xl mt-12">
          Update Admin Profile
        </p>

        <section className="px-5 pt-5 pb-5 bg-white rounded-[12px] overflow-scroll md:mt-5 mt-5 no-scrollbar">
          {/* md:mt-9 */}
          <form className="w-full" onSubmit={updateAdminProfile}>
            <div className="w-full relative">
              <div className="w-full bg-custom-light flex justify-start items-center gap-6">
                <div className="md:w-[90%] w-[85%]">
                  <p className="text-custom-gray text-lg font-semibold mt-2 mb-1">
                    Email Address
                  </p>
                  <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                    <input
                      className="outline-none bg-custom-light text-black w-full"
                      type="email"
                      placeholder="Email Address"
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="md:w-[90%] w-[85%]">
                  <p className="text-custom-gray text-lg font-semibold mt-2 mb-1">
                    Phone Number
                  </p>
                  <div className="border border-gray-400 rounded-md p-2 w-full bg-custom-light flex justify-start items-center">
                    <input
                      className="outline-none bg-custom-light text-black w-full"
                      type="tel"
                      placeholder="Phone Number"
                      value={adminPhone}
                      onChange={(e) => {
                        setAdminPhone(e.target.value.replace(/\D/g, ""));
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-custom-gray text-lg font-semibold mt-4 mb-1">
                Password
              </p>
              <div className="w-full bg-custom-light flex justify-start items-center gap-6">
                <input
                  className="border p-2 rounded-md outline-none bg-custom-light md:w-[90%] w-[85%] text-black"
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                  }}
                />
                <input
                  className="border p-2 rounded-md outline-none bg-custom-light md:w-[90%] w-[85%] text-black"
                  type="passwored"
                  placeholder="Confirm Password"
                  value={adminConfirmPassword}
                  onChange={(e) => {
                    setAdminConfirmPassword(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end items-end mt-5">
              <button
                type="submit"
                className="text-white bg-custom-darkpurple rounded-[10px] text-center  text-md py-2 w-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </form>
        </section>
      </section>
    </>
  );
}

export default isAuth(Settings);
