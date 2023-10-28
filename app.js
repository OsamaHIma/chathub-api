require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const Message = require("./models/message");
const User = require("./models/user");
const messagesRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoutes);
// Route for the email confirmation page
app.get("/email-confirmed", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Email Confirmed</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body {
            font-family: 'Poppins', sans-serif;
          }
        </style>
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen flex flex-col gap-4 items-center justify-center">
        <a href="https://chathub-web.vercel.app/">
        <img src="https://i.ibb.co/sKXw7Vz/logo.png" alt="logo" class="p-3 w-52 md:w-72 bg-gray-900 rounded-xl" />
      </a>
          <div class="max-w-xl !mx-3 w-full p-6 bg-indigo-500 rounded-lg shadow-lg">
            <h1 class="text-3xl text-white font-bold mb-4">Email Confirmed</h1>
            <p class="text-white mb-4">Your email has been confirmed. You can now log in.</p>
            <a href="https://chathub-web.vercel.app/auth/login" target="_blank" class="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Log In</a>
          </div>
        </div>
      </body>
    </html>
  `);
});
app.get("/reset-password-confirmed", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Email Confirmed</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body {
            font-family: 'Poppins', sans-serif;
          }
        </style>
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen flex flex-col gap-4 items-center justify-center">
        <a href="https://chathub-web.vercel.app/">
        <img src="https://i.ibb.co/sKXw7Vz/logo.png" alt="logo" class="p-3 w-52 md:w-72 bg-gray-900 rounded-xl" />
      </a>
          <div class="max-w-xl !mx-3 w-full p-6 bg-indigo-500 rounded-lg shadow-lg">
            <h1 class="text-3xl text-white font-bold mb-4">Email Confirmed</h1>
            <p class="text-white mb-4">You can now proceed to last step which is creating your new password.</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

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
global.typingUsers = new Set();

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

  socket.on("update-msg-seen", async (msgId) => {
    try {
      const currentMessage = await Message.findOne({ _id: msgId });
      currentMessage.seen = true;
      await currentMessage.save();
      socket.emit("msg-seen", currentMessage._id);
    } catch (err) {
      console.error("Error updating message:", err);
    }
  });

  socket.on("typing", (userId) => {
    typingUsers.add(userId);
    socket.broadcast.emit("user-typing", userId);
  });

  socket.on("stop-typing", (userId) => {
    typingUsers.delete(userId);
    socket.broadcast.emit("user-stop-typing", userId);
  });

  socket.on("disconnect", () => {
    const userId = Array.from(onlineUsers.entries()).find(
      ([key, value]) => value === socket.id
    )?.[0];
    if (userId) {
      onlineUsers.delete(userId);
      typingUsers.delete(userId);
      socket.broadcast.emit("user-disconnected", userId);
    }
  });
  socket.on("update-user-status", (userId) => {
    const isOnline = onlineUsers.has(userId);

    socket.emit("user-status", isOnline);
  });

  app.get("/api/auth/confirm-reset-password/:id", async (req, res, next) => {
    try {
      const userId = req.params.id;

      // Find the user by their ID in the database
      const user = await User.findById(userId);

      if (!user) {
        // User not found, handle the error or show appropriate message
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.redirect("/reset-password-confirmed");
      if(user.email){
        socket.emit("user-resetPasswordClicked", user.email);
      }
    } catch (error) {
      // Handle errors
      console.error(`Error confirming email: ${error}`);
      next(error);
    }
  });
});

module.exports = app;
