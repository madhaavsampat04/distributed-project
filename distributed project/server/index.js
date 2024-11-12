const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
const server = http.createServer(app);
// const io = socketIo(server);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"], 
  },
});

// const corsOptions = {
//   origin: "*",
//   // credentials: true,
//   // optionSuccessStatus: 200,
//   methods: ["GET", "POST"],
// };
// app.use(cors(corsOptions));
app.use(bodyParser.json());

let leaderId = 5; // Start with Node 5 as leader

// Handle new leader election
const electNewLeader = (failedNodeId) => {
  // Find the highest active node as the new leader
  leaderId = Math.max(1, 2, 3, 4); // Logic to select a new leader (example)
  return leaderId;
};

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("election/start", ({ failedNodeId }) => {
    const newLeaderId = electNewLeader(failedNodeId);
    io.emit("newLeader", { leaderId: newLeaderId });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} over: http://localhost:5000`));
