import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { MdDashboard } from "react-icons/md";
import { MdContentPaste } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { userContext } from "@/pages/_app";
import { BiSolidCategory } from "react-icons/bi";
import { IoBarbell, IoSettings } from "react-icons/io5";
import { AiFillProduct } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { BsCash } from "react-icons/bs";
import { PiHandWithdrawFill } from "react-icons/pi";
import Collapse from "@mui/material/Collapse";
import { FaChevronUp } from "react-icons/fa";

const SidePannel = ({ setOpenTab, openTab }) => {
  const [user, setUser] = useContext(userContext);
  const router = useRouter();

  const [open, setOpen] = React.useState(false);

  const handleCollapse = () => {
    setOpen(!open);
  };

  const logOutHandler = () => {
    localStorage.removeItem("PBuser");
    localStorage.removeItem("token");
    setUser({});
    router.push("/login");
  };

  const menuItems = [
    {
      href: "/",
      title: "Dashboard",
      img: <MdDashboard className="text-3xl" />,
      access: ["admin", "seller"],
    },
    {
      href: "/inventory",
      title: "Inventory",
      img: <AiFillProduct className="text-3xl" />,
      access: ["seller"],
    },
    {
      href: "/employees",
      title: "Employees",
      img: <AiFillProduct className="text-3xl" />,
      access: ["seller"],
    },
    // {
    //     href: "/add-product",
    //     title: "Add Product",
    //     img: <AiFillProduct className='text-3xl' />,
    //     access: ["ADMIN", "SELLER"],
    // },
    {
      href: "/queries",
      title: "Queries",
      img: <FaCircleQuestion className="text-3xl" />,
      access: ["admin", "seller"],
    },
    {
      href: "/orders",
      title: "Orders",
      img: <FaShoppingBag className="text-3xl" />,
      access: ["seller"],
    },
    {
      href: "/returned-orders",
      title: "Returned Orders",
      img: <FaShoppingBag className="text-3xl" />,
      access: ["seller"],
    },
    {
      href: "/sellers",
      title: "Sellers",
      img: <FaUserTie className="text-3xl" />,
      access: ["admin"],
      children: [
        { href: "/sellers", title: "Sellers List" },
        { href: "/sellers/seller-orders", title: "Seller Orders" },
        { href: "/sellers/returned-orders", title: "Returned Orders" },
        { href: "/sellers/seller-products", title: "Seller Products" },
        { href: "/sellers/seller-employee", title: "Seller Employee" },
      ],
    },
    {
      href: "/driver",
      title: "Drivers",
      img: <FaUserTie className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/categories",
      title: "Categories",
      img: <BiSolidCategory className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/SaleProduct",
      title: "Sale",
      img: <BiSolidCategory className='text-3xl' />,
      access: ["seller"],
    },
    {
      href: "/settings",
      title: "Settings",
      img: <IoSettings className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/notifications",
      title: "Notifications",
      img: <IoBarbell className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/contact",
      title: "Contact",
      img: <IoBarbell className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/ContentManagement",
      title: "Our Content",
      img: <MdContentPaste className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/cashreceive",
      title: "Cash Receive",
      img: <BsCash className="text-3xl" />,
      access: ["admin"],
    },
    {
      href: "/wallet",
      title: "Wallet",
      img: <IoSettings className='text-3xl' />,
      access: ["seller"],
    },
    {
      href: "/withdrawalrequest",
      title: "Withdrawal Request",
      img: <PiHandWithdrawFill className="text-3xl" />,
      access: ["admin"],
    },
  ];

  return (
    <>
      <div className="bg-custom-blue xl:w-[250px] fixed top-0 left-0 z-20  md:w-[250px] sm:w-[200px] hidden sm:grid grid-rows-5 h-screen overflow-hidden">
        <div className="bg-custom-blueoverflow-y-scroll h-screen  scrollbar-hide">
          <div className="bg-custom-blue min-h-screen h-full py-5 2xl:h-full">
            <div className="bg-white pt-5 pb-5 row-span-1 flex items-center justify-center cursor-pointer mx-5 rounded" onClick={() => router.push("/")}>
              <img className="object-contain w-[210px] h-[50px] lg:scale-150" src="/logo-1.png" alt="" />
            </div>

            <div className="flex flex-col justify-between row-span-4 pb-4 w-full">
              <ul className="w-full flex flex-col text-left mt-5 space-y-1">
                {menuItems.map((item, i) => {
                  if (!item.access.includes(user?.role)) return null;

                  if (item.title === "Sellers") {
                    return (
                      <div key={i}>
                        <div onClick={handleCollapse} className={`${item?.access?.includes(user?.role)
                          ? "flex"
                          : "hidden"
                          }  items-center mx-5 cursor-pointer group hover:bg-custom-yellow 
                          `}
                        >
                          <div className="py-3 ml-[40px] mr-6 text-white font-semibold flex justify-between w-full items-center gap-4">
                            <span className="font-semibold">{item.title}</span>
                            {open ? (
                              <FaChevronUp size={14} />
                            ) : (
                              <FaChevronDown size={14} />
                            )}
                          </div>
                        </div>

                        <Collapse in={open} timeout="auto" unmountOnExit>
                          {item.children?.map((child, index) => (
                            <Link
                              key={index}
                              href={child.href}
                              // passHref
                              className={`${item?.access?.includes(user?.role)
                                ? "flex"
                                : "hidden"
                                }  items-center mx-5 px-6 cursor-pointer group hover:bg-custom-yellow my-1
                                  ${router.pathname === child.href
                                  ? "bg-custom-yellow text-white rounded-[8px]"
                                  : "text-custom-blue"
                                }
                                `}
                            >
                              <div className="py-3 text-white font-semibold flex items-center gap-4">
                                <div className="w-3"></div>
                                {/* <div className="text-2xl">{item.img}</div> */}
                                <span className="font-semibold">
                                  {child.title}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </Collapse>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={i}
                      href={item.href}
                      passHref
                      className={`${item?.access?.includes(user?.role) ? "flex" : "hidden"
                        }  items-center mx-5 cursor-pointer group hover:bg-custom-yellow 
                          ${router.pathname === item.href
                          ? "bg-custom-yellow text-white rounded-[8px]"
                          : "text-custom-blue"
                        }
                        `}
                    >
                      <div className="py-3 text-white font-semibold flex items-center gap-4">
                        <div className="w-6"></div>
                        {item?.title}
                      </div>
                    </Link>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full absolute top-0 left-0 z-40 sm:hidden flex flex-col h-screen max-h-screen overflow-hidden  bg-custom-blue ${openTab ? "scale-x-100" : "scale-x-0"
          } transition-all duration-300 origin-left`}
      >
        <div className=" row-span-1  w-full text-white  relative ">
          <ImCross
            className="absolute top-4 right-4 z-40 text-2xl"
            onClick={() => setOpenTab(!openTab)}
          />
          <div className="flex items-center gap-3 w-full  p-3">
            <div className="bg-white p-1 rounded overflow-hidden">
              <img className="w-[182px] h-[44px] object-cover" src="/logo-1.png"alt="" />
            </div>
            <div className="flex flex-col text-left justify-center">
              <p className="-mt-2 text-sm">{user?.name}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start row-span-2 h-full  w-full">
          <ul className="w-full h-full flex flex-col text-left justify-start items-center border-t-2 border-white">
            {menuItems.map((item, i) => (
              <li key={i} className={`${item?.access?.includes(user?.role) ? "flex" : "hidden"
                } w-full items-center text-white cursor-pointer group hover:bg-custom-lightGray hover:text-custom-blue  border-b-2 border-white`}
              >
                <div className=" py-2 pl-6 font-semibold flex items-center gap-4 " onClick={() => setOpenTab(!openTab)}>
                  <div className="w-6">{item?.img}</div>
                  <Link href={item.href}>{item?.title}</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SidePannel;
