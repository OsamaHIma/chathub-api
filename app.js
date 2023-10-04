const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const Message = require("./models/message");
const messagesRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoutes);

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Server Connected Successfully");
  })
  .catch((err) => {
    console.error("Server Connection Error:", err);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Running on: ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "*",
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data);
    }
  });
  
  socket.on("msg-seen", async (msgId) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(msgId, { seen: true });
    // Emit a "msg-seen" event to the sender's socket
    socket.emit("msg-seen", updatedMessage._id);
  } catch (err) {
    console.error("Error updating message:", err);
  }
});

});
module.exports = app;
