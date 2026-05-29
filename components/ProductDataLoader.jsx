"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProduct } from "@/lib/features/product/productSlice";

export default function ProductDataLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          dispatch(setProduct(data.products));
        }
      } catch (error) {
        console.error("PRODUCT_LOAD_ERROR:", error);
      }
    };

    loadProducts();
  }, [dispatch]);

  return null;
}