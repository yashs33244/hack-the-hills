"use client";
import { redirect } from "next/navigation";

export default function Home() {
  if (localStorage.getItem("token")) {
    redirect("/wallet");
  } else {
    redirect("/auth");
  }
}
