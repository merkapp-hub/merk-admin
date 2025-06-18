import Layout from "@/components/layouts";
import Loader from "@/components/loader";
import Toaster from "@/components/toaster";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export const userContext = createContext();
export const dataContext = createContext()
export default function App({ Component, pageProps }) {

  const [user, setUser] = useState({});
  const [data,setData] = useState({})
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({
    type: "",
    message: "",
  });
  const router = useRouter();
  
  useEffect(() => {
    setToast(toast);
    if (!!toast.message) {
      setTimeout(() => {
        setToast({ type: "", message: "" });
      }, 5000);
    }
  }, [toast]);
  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = () => {
    const user = localStorage.getItem("userDetail");
    console.log("drfdtftfyfgyhftgytgfygf", user);
    if (user) {
      setUser(JSON.parse(user));
      // if (JSON.parse(user)?.id === "6450e9bef4d2cc08c2ec0431") {
      //   router.push("/festaevent");
      // } else {
      router.push("/");
      // }
    } else {
      if (router.route !== "/login" && router.route !== "/signup") {
        router.push("/login");
      }
    }
  };

  return (
    <> <dataContext.Provider value={[data,setData]}>
      <userContext.Provider value={[user, setUser]}>
       
          <Loader open={open} />
        <div className="fixed right-5 top-20 min-w-max z-50">
          {!!toast.message && (
            <Toaster type={toast.type} message={toast.message} />
          )}
        </div>
        <Layout loader={setOpen} toaster={setToast}>
          <Loader open={open} />
          <div className="fixed right-5 top-20 min-w-max">
            {!!toast.message && (
              <Toaster type={toast.type} message={toast.message} />
            )}
          </div>
          {user && <Component
            {...pageProps}
            loader={setOpen}
            toaster={setToast}
            user={user}
          />}
        </Layout>
      
      </userContext.Provider>  </dataContext.Provider>
    </>
  )
}
