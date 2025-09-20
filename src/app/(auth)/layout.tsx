import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="">
        <div className="w-full">
            {children}
        </div>
      </div>
    </>
  );
}

export default layout;
