import { userContext } from "@/pages/_app";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { PiSignOutFill } from "react-icons/pi";

const Navbar = ({ setOpenTab, openTab }) => {
  const [user, setUser] = useContext(userContext);
  console.log(user)
  const router = useRouter();

  const logOut = () => {
    setUser({});
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const imageOnError = (event) => {
    event.currentTarget.src = "/userprofile.png";
    // event.currentTarget.className = "error";
  };

  return (
    <nav className="w-full z-[100] text-white rounded-b-[30px] sticky top-0 max-w-screen bg-white">
      <div className="w-full md:py-3 py-1 px-5 flex items-center justify-between">
        {/* shadow-2xl */}
        <div className="md:hidden bg-white rounded">
          {/* w-14 */}
          <img
            className="object-contain w-[110px] h-[50px] mt-2"
            src="/logo-1.png"
            alt=""
          />
          {/* <p className="py-2 text-5xl md:text-4xl lg:text-5xl font-semibold text-gray-800">Logo</p> */}
        </div>
        {user?.token && (
          <div className=" w-full md:flex items-center gap-3 hidden  justify-between  cursor-pointer">
            <div className="flex items-center gap-3  cursor-pointer">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-custom-yellow">
                <img
                  src={user?.profile || "/userprofile.png"}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={imageOnError}
                />
              </div>
              <div className="flex flex-col text-left justify-center p-0">
                <p className="text-lg font-semibold text-black uppercase">{user?.role}</p>
              </div>
            </div>
            {user?.token ? (
              <div
                className="flex gap-2 items-center cursor-pointer"
                onClick={logOut}
              >
                <div className="text-gray-800 text-center flex justify-center items-center">
                  <p>Sign Out</p>
                  {/* <p className="text-sm text-custom-newGray">Admin</p> */}
                </div>
                <div className="bg-custom-darkpurple rounded-full p-2">
                  <PiSignOutFill className='text-3xl text-white' />
                  {/* <img className="w-10" src="/dp.png" /> */}
                </div>
              </div>
            ) : (
              <Link href={"/login"}>
                <div className="p-3 items-center">
                  <p>LogIn</p>
                </div>
              </Link>
            )}
          </div>
        )}
        <div className="md:hidden">
          <GiHamburgerMenu
            className="text-2xl text-black "
            onClick={() => setOpenTab(!openTab)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
