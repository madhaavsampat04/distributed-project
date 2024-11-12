import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Node from "./components/Node";

// Connect to the Socket.IO server
const socket = io("http://localhost:5000");

<h1 className="text-4xl bg-red-500">Bully Election Algorithm Simulation</h1>

function App() {
  // State to store node information (id, status, and if it’s the leader)
  const [nodes, setNodes] = useState([
    { nodeId: 1, status: "active", isLeader: false },
    { nodeId: 2, status: "active", isLeader: false },
    { nodeId: 3, status: "active", isLeader: false },
    { nodeId: 4, status: "active", isLeader: false },
    { nodeId: 5, status: "active", isLeader: true }, // Initial leader
  ]);

  useEffect(() => {
    // Listen for the 'newLeader' event from the server
    socket.on("newLeader", (data) => {
      // Update node statuses based on the new leader
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.nodeId === data.leaderId
            ? { ...node, isLeader: true, status: "active" }
            : { ...node, isLeader: false }
        )
      );
    });

    // Optional cleanup to remove the listener
    return () => socket.off("newLeader");
  }, []);

  // Trigger election by simulating a failure on a node
  const startElection = (failedNodeId) => {
    // Emit an election start event to the server
    socket.emit("election/start", { failedNodeId });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-100 to-gray-300">
      <h1 className="text-4xl font-bold mb-4 text-gray-700">Bully Election Algorithm Simulation</h1>
      
      {/* Button to simulate failure on Node 3 */}
      <button
        onClick={() => startElection(3)}
        className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold mb-6 hover:scale-105 transform transition duration-200"
      >
        Simulate Failure on Node 3
      </button>

      {/* Display nodes in a grid */}
      <div className="flex flex-wrap justify-center gap-6 max-w-xl">
        {nodes.map((node) => (
          <Node key={node.nodeId} {...node} onFail={(nodeId) => startElection(nodeId)} />
        ))}
      </div>
    </div>
  );
}

export default App;
