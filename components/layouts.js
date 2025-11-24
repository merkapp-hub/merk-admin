/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { useState } from "react";
import SidePannel from "./SidePannel";
import Navbar from "./Navbar";

const Layout = ({ children, loader, toaster }) => {
  const router = useRouter();
  const [openTab, setOpenTab] = useState(false)

  return (
    <div className="h-screen max-w-screen bg-custom-lightGray">

      <div className="md:h-[10vh] h-[8vh] w-full bg-white"
      // style={{
      //   backgroundImage: `url("/headerBackground.png")`,
      //   backgroundSize: "cover",
      // }}
      >

        <div className="max-w-screen flex  relative ">
          {
            !(router.pathname.includes('/login') || router.pathname.includes('/signup') ||
              router.pathname.includes('/privacy-policy') ||
              router.pathname.includes('/terms-condition')) &&
            <SidePannel setOpenTab={setOpenTab} openTab={openTab} />
          }
          <div className={
            !(router.pathname.includes('/login') || router.pathname.includes('/signup') ||
              router.pathname.includes('/privacy-policy') ||
              router.pathname.includes('/terms-condition')) ? "w-full xl:pl-[300px] md:pl-[250px] sm:pl-[200px]" : "w-full"}>
            <main className={"w-full h-screen relative overflow-y-auto"}>
              {
                !(router.pathname.includes('/login') || router.pathname.includes('/signup') ||
                  router.pathname.includes('/privacy-policy') ||
                  router.pathname.includes('/terms-condition')) &&
                <Navbar setOpenTab={setOpenTab} openTab={openTab} />
              }
              {children}
            </main>
          </div>
          {/* <div className="w-full xl:pl-[300px] md:pl-[250px] sm:pl-[200px]">
            <main className={"w-full min-h-screen relative overflow-hidden z-90"}>
              {
                !(router.pathname.includes('/login') || router.pathname.includes('/signup') ||
                  router.pathname.includes('/privacy-policy') ||
                  router.pathname.includes('/terms-condition')) &&
                <Navbar setOpenTab={setOpenTab} openTab={openTab} />
              }
            </main>
          </div> */}
        </div>
      </div>
      {/* <div className="w-full xl:pl-[300px] md:pl-[250px] sm:pl-[200px] ">
            <main className={"w-full min-h-screen relative overflow-hidden md:pt-[70px] z-0"}>
              {children}
            </main>
          </div> */}

    </div>
  );
};

export default Layout;
