import Header from "@/components/share/Header";
import { Sidebar } from "@/components/share/Sidebar";
// import AppProvider from "@/provider/AppProvider";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar/>
        <div className="w-full mt-[80px] p-6">
          {/* <AppProvider> */}
            {children}
            {/* </AppProvider> */}
        </div>
      </div>
    </>
  );
}

export default layout;
