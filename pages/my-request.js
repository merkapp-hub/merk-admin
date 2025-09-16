import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import isAuth from "@/components/isAuth";
import ActivityList from "@/components/activityList";
import { Api } from "@/services/service";
import { userContext } from "./_app";
import currencySign from "@/utils/currencySign";

function MyWithdrawRequests(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);

  const [profileData, setProfileData] = useState({});
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ amount: "", note: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getProfile();
    fetchRequests();
  }, []);

  const getProfile = async () => {
    props.loader(true);
    Api("get", "auth/getProfile", "", router).then(
      (res) => {
        props.loader(false);
        setProfileData(res.data || {});
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const fetchRequests = async () => {
    props.loader(true);
    Api("get", "getWithdrawreqbyseller", "", router).then(
      (res) => {
        props.loader(false);
        setRequests(res.data || []);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      props.toaster({ type: "error", message: "Enter valid amount" });
      return;
    }
    if (amountNum > (profileData?.wallet || 0)) {
      props.toaster({ type: "error", message: "Amount is greater than wallet balance" });
      return;
    }

    const payload = {
      amount: form.amount,
      note: form.note,
    };
    props.loader(true);
    Api("post", "createWithdrawreq", payload, router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          setForm({ amount: "", note: "" });
          setShowForm(false);
          fetchRequests();
          // refresh wallet on profile as well
          getProfile();
          props.toaster({ type: "success", message: "Withdrawal request submitted" });
        } else {
          props.toaster({ type: "error", message: res?.data?.message || "Failed" });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  return (
    <section className="w-full min-h-screen bg-transparent md:pt-5 pt-2 pb-5 pl-5 pr-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-800 font-bold md:text-[32px] text-2xl">Withdrawal Request</p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-custom-blue md:h-[50px] h-[40px] px-6 rounded-[5px] md:text-base text-sm text-white font-normal"
        >
          Withdraw Request
        </button>
      </div>

      {/* Wallet Summary */}
      <div className="bg-custom-blue relative flex flex-col justify-center cursor-pointer mb-5">
        <div className="bg-customGray w-full flex justify-between items-center md:py-5 py-2 rounded-md md:px-5 px-1">
          <p className="font-bold md:text-lg text-base text-center text-white">Wallet</p>
          <div>
            <p className="text-white md:text-lg text-base font-bold text-center">
              {currencySign(
                typeof profileData?.wallet === "number" ? profileData.wallet.toFixed(2) : "0.00"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] p-5 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Withdraw Request</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form className="w-full" onSubmit={(e) => {
              onSubmit(e);
              setShowForm(false);
            }}>
              <p className="text-custom-darkGray text-base font-normal pb-1">Amount</p>
              <input
                className="bg-transparent w-full md:h-[46px] h-[40px] px-5 border border-custom-newGray rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light mb-4"
                type="tel"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^0-9]/g, "");
                  const max = profileData?.wallet || 0;
                  const value = Math.min(Number(inputValue || 0), max);
                  setForm((prev) => ({ ...prev, amount: value ? String(value) : "" }));
                }}
                max={profileData?.wallet}
                required
              />

              <div className="mb-4">
                <p className="text-custom-darkGray text-base font-normal pb-1">Note (Optional)</p>
                <div className="relative">
                  <textarea
                    className="bg-transparent w-full px-5 py-2 border border-custom-newGrayColor rounded-[10px] outline-none text-custom-darkGrayColor text-base font-light"
                    rows={3}
                    placeholder="Add a note"
                    value={form.note}
                    onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 md:h-[50px] h-[40px] rounded-[5px] md:text-base text-sm text-gray-700 font-normal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-custom-blue md:h-[50px] h-[40px] rounded-[5px] md:text-base text-sm text-white font-normal"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History */}
      <div className="mb-5">
        <p className="font-bold md:text-lg text-sm text-black mb-3">My Withdrawal Requests</p>
        <div className="space-y-3">
          {requests.map((item, i) => (
            <ActivityList {...props} data={item} key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default isAuth(MyWithdrawRequests);
