const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());

let nodes = [
  { nodeId: 1, status: "active", isLeader: false },
  { nodeId: 2, status: "active", isLeader: false },
  { nodeId: 3, status: "active", isLeader: false },
  { nodeId: 4, status: "active", isLeader: false },
  { nodeId: 5, status: "active", isLeader: true }, // Initial leader
];

const log = (message) => {
  io.emit("log", message);
  console.log(message);
};

// Function to initiate the election process from a given node
const initiateElection = (initiator) => {
  log(`Node ${initiator.nodeId} initiates election.`);
  const higherPriorityNodes = nodes.filter(
    (node) => node.status === "active" && node.nodeId > initiator.nodeId
  );
  
  if (higherPriorityNodes.length === 0) {
    initiator.isLeader = true;
    nodes.forEach((node) => {
      if (node.nodeId !== initiator.nodeId) {
        node.isLeader = false;
      }
    });
    log(`Node ${initiator.nodeId} is elected as the new leader.`);
    io.emit("updateNodes", nodes);
    return;
  }

  let responses = 0;

  higherPriorityNodes.forEach((node) => {
    log(`Node ${initiator.nodeId} sends election message to Node ${node.nodeId}`);
    responses++;
    setTimeout(() => {
      log(`Node ${node.nodeId} responds to Node ${initiator.nodeId}`);
      responses--;
      if (responses === 0) {
        initiateElection(node);
      }
    }, 1000);
  });
};

// Handle new leader election
const electNewLeader = () => {
  const activeNodes = nodes.filter((node) => node.status === "active");
  if (activeNodes.length === 0) {
    log("No active nodes to elect a leader.");
    return;
  }

  const initiator = activeNodes[Math.floor(Math.random() * activeNodes.length)];
  initiateElection(initiator);
};

io.on("connection", (socket) => {
  log("New client connected");

  socket.emit("updateNodes", nodes);

  socket.on("node/add", (nodeId) => {
    if (nodes.some((node) => node.nodeId === nodeId)) {
      log(`Node ${nodeId} already exists.`);
    } else {
      nodes.push({ nodeId, status: "active", isLeader: false });
      log(`Node ${nodeId} added.`);
      io.emit("updateNodes", nodes);
    }
  });

  socket.on("node/remove", (nodeId) => {
    const nodeIndex = nodes.findIndex((node) => node.nodeId === nodeId);
    if (nodeIndex === -1) {
      log(`Node ${nodeId} does not exist.`);
    } else {
      const isLeader = nodes[nodeIndex].isLeader;
      nodes.splice(nodeIndex, 1);
      log(`Node ${nodeId} removed.`);
      if (isLeader) {
        log(`Leader node ${nodeId} removed. Starting new election.`);
        electNewLeader();
      }
      io.emit("updateNodes", nodes);
    }
  });

  socket.on("disconnect", () => {
    log("Client disconnected");
  });
});

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT} over: http://localhost:5000`)
);
