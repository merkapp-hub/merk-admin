import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { MdArrowForward, MdEmail, MdPassword } from "react-icons/md";
import { useContext, useState } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { userContext } from "./_app";
import Swal from "sweetalert2";

export default function Login(props) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [userDetail, setUserDetail] = useState({
    email: "",
    password: "",
  });
  const [user, setUser] = useContext(userContext);

  // Step 1: Send credentials and get OTP
  const submit = async (e) => {
    e.preventDefault();

    if (userDetail.email && userDetail.password) {
      props.loader(true);
      Api("post", "auth/admin/sendLoginOTP", { 
        email: userDetail.email, 
        password: userDetail.password 
      }, router).then(
        (res) => {
          props.loader(false);
          console.log("OTP sent response:", res);
          
          if (res.success) {
            setTempToken(res.tempToken);
            setShowOtpStep(true);
            Swal.fire({
              icon: "success",
              title: "OTP Sent!",
              text: "Please check your email for the verification code.",
              confirmButtonColor: "#12344D",
            });
          }
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.message || "Login failed" });
        }
      );
    } else {
      props.toaster({ type: "error", message: "Missing credentials" });
    }
  };

  // Step 2: Verify OTP and complete login
  const verifyOtpAndLogin = async (e) => {
    e.preventDefault();

    const trimmedOtp = otp.trim();
    
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      props.toaster({ type: "error", message: "Please enter a valid 6-digit OTP" });
      return;
    }

    props.loader(true);
    Api("post", "auth/admin/verifyLoginOTP", { 
      otp: trimmedOtp, 
      tempToken: tempToken 
    }, router).then(
      (res) => {
        props.loader(false);
        console.log("Login response:", res);
        
        if (res.success) {
          // Check seller status
          if (res.user.role === "seller" && res.user.status && res.user.status !== "Verified") {
            Swal.fire({
              text: "Your account hasn't been verified. Please wait by 2-7 working days. Thanks.",
              icon: "warning",
              showCancelButton: false,
              confirmButtonText: "OK"
            });
            setShowOtpStep(false);
            setOtp("");
            setTempToken("");
            return; 
          }

          // Save user data and redirect
          localStorage.setItem("userDetail", JSON.stringify(res.user));
          setUser(res.user);
          setUserDetail({
            email: "",
            password: "",
          });
          setOtp("");
          setTempToken("");
          setShowOtpStep(false);
          localStorage.setItem("token", res.token);
          props.toaster({ type: "success", message: "Login Successful" });
          router.push("/");
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message || "Invalid OTP" });
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-custom-lightGray justify-center items-center ">
      <div className="border-2 rounded-3xl border-custom-darkpurple bg-custom-creame md:p-10 p-5 sm:w-1.5 md:w-1/3  ">
        <p className="text-black text-center md:text-4xl text-2xl font-semibold mb-10">
          {showOtpStep ? "Verify OTP" : "Welcome"}
        </p>

        {!showOtpStep ? (
          // Step 1: Email & Password Form
          <form onSubmit={submit}>
            <div className="flex bg-white py-2 mt-4 rounded-md border  border-custom-gray md:h-14 sm:h-10 w-64 md:min-w-full ">
              <div className="flex md:mx-4 mx-2.5 justify-center md:h-10 sm:h-8 items-center ">
                <div className="md:w-5 md:h-5 w-4 h-4 relative">
                  <MdEmail className="text-xl text-custom-darkpurple " />
                </div>
              </div>
              <input
                placeholder="Username"
                className="bg-white w-full outline-none px-2 text-black text-xs md:text-base border-l-2 border-custom-gray md:h-10 h-5"
                value={userDetail.email}
                autoComplete="false"
                onChange={(text) => {
                  setUserDetail({ ...userDetail, email: text.target.value });
                }}
              />
            </div>
            {submitted && userDetail.email === "" && (
              <p className="text-red-700 mt-1">Email is required</p>
            )}

            <div className="flex bg-white py-2 mt-4 rounded-md  border  border-custom-gray md:h-14 sm:h-10 min-w-full relative items-center w-64 md:min-w-full ">
              <div className="flex md:mx-4 mx-2.5  justify-center md:h-10 sm:h-8 items-center ">
                <div className="md:w-5 md:h-5 w-4 h-4 relative">
                  <MdPassword className="text-xl text-custom-darkpurple " />
                </div>
              </div>
              <input
                placeholder="Password"
                type={showPass ? "text" : "password"}
                className="bg-white w-full outline-none px-2 text-black text-xs md:text-base border-l-2 border-custom-gray md:h-10 h-5"
                value={userDetail.password}
                autoComplete="new-password"
                onChange={(text) => {
                  setUserDetail({ ...userDetail, password: text.target.value });
                }}
              />
            </div>
            {submitted && userDetail.password === "" && (
              <p className="text-red-700 mt-1">Password is required</p>
            )}

            <div className=" mt-10 grid grid-cols-2 gap-8">
              <div className="items-start">
                <p className="text-black text-left md:text-4xl text-2xl font-semibold ">
                  Sign in
                </p>
              </div>
              <button type="submit" className="flex justify-end">
                <div className="md:w-10 md:h-10 w-8 h-8 relative bg-custom-darkpurple rounded-full flex justify-center items-center">
                  <MdArrowForward className="text-white w-5 h-5" />
                </div>
              </button>
            </div>
          </form>
        ) : (
          // Step 2: OTP Verification Form - Same styling as login
          <form onSubmit={verifyOtpAndLogin}>
            <p className="text-gray-600 text-center text-sm mb-6">
              Check your email for the 6-digit code
            </p>

            <div className="flex bg-white py-2 mt-4 rounded-md border border-custom-gray md:h-14 sm:h-10 w-64 md:min-w-full">
              <div className="flex md:mx-4 mx-2.5 justify-center md:h-10 sm:h-8 items-center">
                <div className="md:w-5 md:h-5 w-4 h-4 relative">
                  <MdPassword className="text-xl text-custom-darkpurple" />
                </div>
              </div>
              <input
                placeholder="Enter 6-digit OTP"
                type="text"
                maxLength="6"
                className="bg-white w-full outline-none px-2 text-black text-xs md:text-base border-l-2 border-custom-gray md:h-10 h-5 tracking-widest"
                value={otp}
                autoFocus
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtp(value);
                }}
              />
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-custom-darkpurple text-sm hover:underline"
                onClick={() => {
                  setShowOtpStep(false);
                  setOtp("");
                  setTempToken("");
                }}
              >
                ← Back to login
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8">
              <div className="items-start">
                <p className="text-black text-left md:text-4xl text-2xl font-semibold">
                  Verify
                </p>
              </div>
              <button type="submit" className="flex justify-end">
                <div className="md:w-10 md:h-10 w-8 h-8 relative bg-custom-darkpurple rounded-full flex justify-center items-center">
                  <MdArrowForward className="text-white w-5 h-5" />
                </div>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
