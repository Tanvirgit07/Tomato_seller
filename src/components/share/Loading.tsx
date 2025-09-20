import React from "react";

function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
          <div
            className="w-4 h-4 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-4 h-4 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <span className="ml-2 text-gray-600 font-medium">
            Loading categories...
          </span>
        </div>
      </div>
    </div>
  );
}

export default Loading;
