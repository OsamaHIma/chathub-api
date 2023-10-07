const mongoose = require("mongoose");

const ModalSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    users: Array,
    content: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      // default: Date.now,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", ModalSchema);
