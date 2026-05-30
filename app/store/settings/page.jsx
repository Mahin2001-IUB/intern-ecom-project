"use client";

import { assets } from "@/assets/assets";
import Loading from "@/components/Loading";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    logo: "",
    image: "",
  });

  const onChangeHandler = (e) => {
    setStoreInfo({
      ...storeInfo,
      [e.target.name]: e.target.value,
    });
  };

  const fetchStoreInfo = async () => {
    try {
      const res = await fetch("/api/store", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch store info");
      }

      if (!data.store) {
        throw new Error("Store not found");
      }

      setStoreInfo({
        name: data.store.name || "",
        username: data.store.username || "",
        description: data.store.description || "",
        email: data.store.email || "",
        contact: data.store.contact || "",
        address: data.store.address || "",
        logo: data.store.logo || "",
        image: "",
      });

      setImagePreview(data.store.logo || "");
    } catch (error) {
      console.error("FETCH_STORE_SETTINGS_ERROR:", error);
      toast.error(error.message || "Failed to fetch store info");
    } finally {
      setLoading(false);
    }
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setStoreInfo({
      ...storeInfo,
      image: file,
    });

    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("username", storeInfo.username);
    formData.append("name", storeInfo.name);
    formData.append("description", storeInfo.description);
    formData.append("email", storeInfo.email);
    formData.append("contact", storeInfo.contact);
    formData.append("address", storeInfo.address);

    if (storeInfo.image) {
      formData.append("image", storeInfo.image);
    }

    const res = await fetch("/api/store", {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update store");
    }

    setStoreInfo({
      name: data.store.name || "",
      username: data.store.username || "",
      description: data.store.description || "",
      email: data.store.email || "",
      contact: data.store.contact || "",
      address: data.store.address || "",
      logo: data.store.logo || "",
      image: "",
    });

    setImagePreview(data.store.logo || "");

    setTimeout(() => {
      window.location.reload();
    }, 800);

    return data;
  };

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl mb-6">
        Store <span className="text-slate-800 font-medium">Settings</span>
      </h1>

      <form
        onSubmit={(e) =>
          toast.promise(onSubmitHandler(e), {
            loading: "Updating store...",
            success: "Store updated successfully!",
            error: (err) => err.message || "Failed to update store",
          })
        }
        className="max-w-2xl flex flex-col gap-4"
      >
        <label className="cursor-pointer w-fit">
          <p className="mb-2">Store Logo</p>

          <Image
            src={imagePreview || assets.upload_area}
            className="rounded-lg h-20 w-20 object-cover shadow"
            alt="Store logo"
            width={100}
            height={100}
          />

          <input type="file" accept="image/*" onChange={onImageChange} hidden />
        </label>

        <div>
          <p className="mb-1">Username</p>
          <input
            name="username"
            onChange={onChangeHandler}
            value={storeInfo.username}
            type="text"
            placeholder="Enter your store username"
            className="border border-slate-300 outline-slate-400 w-full p-2 rounded"
            required
          />
        </div>

        <div>
          <p className="mb-1">Store Name</p>
          <input
            name="name"
            onChange={onChangeHandler}
            value={storeInfo.name}
            type="text"
            placeholder="Enter your store name"
            className="border border-slate-300 outline-slate-400 w-full p-2 rounded"
            required
          />
        </div>

        <div>
          <p className="mb-1">Description</p>
          <textarea
            name="description"
            onChange={onChangeHandler}
            value={storeInfo.description}
            rows={5}
            placeholder="Enter your store description"
            className="border border-slate-300 outline-slate-400 w-full p-2 rounded resize-none"
            required
          />
        </div>

        <div>
          <p className="mb-1">Email</p>
          <input
            name="email"
            onChange={onChangeHandler}
            value={storeInfo.email}
            type="email"
            placeholder="Enter your store email"
            className="border border-slate-300 outline-slate-400 w-full p-2 rounded"
            required
          />
        </div>

        <div>
          <p className="mb-1">Contact Number</p>
          <input
            name="contact"
            onChange={onChangeHandler}
            value={storeInfo.contact}
            type="text"
            placeholder="Enter your store contact number"
            className="border border-slate-300 outline-slate-400 w-full p-2 rounded"
            required
          />
        </div>

        <div>
          <p className="mb-1">Address</p>
          <textarea
            name="address"
            onChange={onChangeHandler}
            value={storeInfo.address}
            rows={4}
            placeholder="Enter your store address"
            className="border border-slate-300 outline-slate-400 w-full p-2 rounded resize-none"
            required
          />
        </div>

        <button className="bg-slate-800 text-white px-10 py-2 rounded mt-5 active:scale-95 hover:bg-slate-900 transition w-fit">
          Save Changes
        </button>
      </form>
    </div>
  );
}