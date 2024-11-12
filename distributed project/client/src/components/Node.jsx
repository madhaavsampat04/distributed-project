import React from "react";

const Node = ({ nodeId, isLeader, status, onFail }) => (
  <div
    onClick={() => status !== "failed" && onFail(nodeId)}
    className={`w-24 h-24 flex items-center justify-center rounded-full text-white text-lg font-bold cursor-pointer 
      ${isLeader ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse" : "bg-gradient-to-r from-blue-400 to-purple-500"} 
      ${status === "failed" ? "bg-gray-400 cursor-not-allowed" : "hover:scale-105 transform transition duration-200"}`}
  >
    {isLeader ? "👑 Leader" : `Node ${nodeId}`}
  </div>
);

export default Node;
