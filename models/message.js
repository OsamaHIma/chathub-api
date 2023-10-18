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
    fileURL: {
      type: String,
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
      type: String,
    },
    fileName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", ModalSchema);
