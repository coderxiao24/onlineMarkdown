import React from "react";
import { Outlet } from "react-router-dom";
import "./index.css";
export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
