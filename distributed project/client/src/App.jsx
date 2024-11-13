import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { FaCrown } from "react-icons/fa";

const socket = io("http://localhost:5000");

function App() {
  const [nodes, setNodes] = useState([]);
  const [logMessages, setLogMessages] = useState([]);
  const [nodeIdToAdd, setNodeIdToAdd] = useState("");
  const [nodeIdToRemove, setNodeIdToRemove] = useState("");

  useEffect(() => {
    socket.on("updateNodes", (nodes) => {
      setNodes(nodes);
    });

    socket.on("newLeader", (data) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.nodeId === data.leaderId
            ? { ...node, isLeader: true }
            : { ...node, isLeader: false }
        )
      );
    });

    socket.on("log", (message) => {
      setLogMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("updateNodes");
      socket.off("newLeader");
      socket.off("log");
    };
  }, []);

  const handleAddNode = () => {
    if (nodeIdToAdd) {
      socket.emit("node/add", parseInt(nodeIdToAdd));
      setNodeIdToAdd("");
    }
  };

  const handleRemoveNode = () => {
    if (nodeIdToRemove) {
      socket.emit("node/remove", parseInt(nodeIdToRemove));
      setNodeIdToRemove("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-100 to-gray-300">
      <h1 className="text-4xl font-bold mb-4 text-gray-700">
        Bully Election Algorithm Simulation
      </h1>
      <div className="flex flex-col items-center mb-4">
        <label className="mb-1 font-semibold text-gray-700">
          Enter Node ID to Add:
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={nodeIdToAdd}
            onChange={(e) => setNodeIdToAdd(e.target.value)}
            placeholder="Node ID"
            className="mr-2 px-2 py-1 border border-gray-400 rounded"
          />
          <button
            onClick={handleAddNode}
            className="px-4 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600"
          >
            Add Node
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center mb-6">
        <label className="mb-1 font-semibold text-gray-700">
          Enter Node ID to Remove:
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={nodeIdToRemove}
            onChange={(e) => setNodeIdToRemove(e.target.value)}
            placeholder="Node ID"
            className="mr-2 px-2 py-1 border border-gray-400 rounded"
          />
          <button
            onClick={handleRemoveNode}
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Remove Node
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6 max-w-xl">
        {nodes.map((node) => (
          <div
            key={node.nodeId}
            className={`p-4 rounded-lg border-2 border-gray-300 ${
              node.isLeader ? "bg-gray-200" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-center">
              {node.isLeader && (
                <FaCrown className="text-yellow-500 mr-2" /> // Display crown icon for leader
              )}
              <span>Node {node.nodeId}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 w-3/4 bg-white border border-gray-300 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Log Messages
        </h2>
        <div className="max-h-64 overflow-y-auto">
          {logMessages.map((message, index) => (
            <p key={index} className="text-gray-600">
              {message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
