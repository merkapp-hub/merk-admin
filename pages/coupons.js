import { useContext, useEffect, useState } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import moment from "moment";
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiTag } from "react-icons/fi";

function Coupons(props) {
  const [user] = useContext(userContext);
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user?._id) return;
    fetchCoupons();
  }, [user?._id]);

  const fetchCoupons = () => {
    props.loader(true);
    const url = isAdmin ? "coupon/all" : "coupon/my";
    Api("get", url, null, router).then(
      (res) => {
        props.loader(false);
        if (res.status) setCoupons(res.data);
      },
      () => props.loader(false)
    );
  };

  const handleCreate = () => {
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    props.loader(true);
    Api("post", "coupon/create", {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    }, router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          toast.success("Coupon created!");
          setShowForm(false);
          setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
          fetchCoupons();
        } else {
          toast.error(res.message || "Failed to create coupon");
        }
      },
      (err) => {
        props.loader(false);
        toast.error(err?.message || "Error creating coupon");
      }
    );
  };

  const handleToggle = (id) => {
    props.loader(true);
    Api("patch", `coupon/toggle/${id}`, null, router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          toast.success(res.message);
          fetchCoupons();
        }
      },
      () => props.loader(false)
    );
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Coupon?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        props.loader(true);
        Api("delete", `coupon/${id}`, null, router).then(
          (res) => {
            props.loader(false);
            if (res.status) {
              toast.success("Coupon deleted");
              fetchCoupons();
            }
          },
          () => props.loader(false)
        );
      }
    });
  };

  return (
    <section className="w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5 relative z-10">
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-800 font-bold md:text-[28px] text-xl flex items-center gap-2">
          <FiTag className="text-[#12344D]" />
          {isAdmin ? "All Coupons" : "My Coupons"}
        </p>
        {isSeller && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#12344D] hover:bg-[#1a4a6e] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <FiPlus size={16} />
            Create Coupon
          </button>
        )}
      </div>

      {isSeller && showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-gray-800 font-semibold text-base mb-4">New Coupon</p>
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Coupon Code *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] text-gray-800 uppercase"
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Discount Type *</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] text-gray-800"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Discount Value * {form.discountType === "percentage" ? "(%)" : "($)"}
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] text-gray-800"
                type="number"
                placeholder={form.discountType === "percentage" ? "e.g. 10" : "e.g. 5"}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Min Order Amount ($)</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] text-gray-800"
                type="number"
                placeholder="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Max Uses (optional)</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] text-gray-800"
                type="number"
                placeholder="Unlimited"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Expiry Date (optional)</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] text-gray-800"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleCreate}
              className="bg-[#12344D] hover:bg-[#1a4a6e] text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                {isAdmin && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Order</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uses</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {!isAdmin && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-gray-400 text-sm">
                    No coupons found
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                  <td className="px-5 py-3">
                    <span className="font-mono font-bold text-[#12344D] bg-blue-50 px-2 py-1 rounded-lg text-xs">
                      {c.code}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3 text-gray-700">
                      {c.seller?.firstName} {c.seller?.lastName}
                      <p className="text-xs text-gray-400">{c.seller?.email}</p>
                    </td>
                  )}
                  <td className="px-5 py-3 font-semibold text-gray-800">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td className="px-5 py-3 text-gray-600">${c.minOrderAmount || 0}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {c.expiresAt ? moment(c.expiresAt).format("DD MMM YYYY") : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {!isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(c._id)}
                          className="text-gray-500 hover:text-[#12344D] transition-all"
                          title={c.isActive ? "Deactivate" : "Activate"}
                        >
                          {c.isActive ? <FiToggleRight size={20} className="text-green-600" /> : <FiToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-gray-400 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default isAuth(Coupons);
