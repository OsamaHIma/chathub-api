const Message = require("../models/message");

module.exports.addMsg = async (req, res, next) => {
  try {
    const { from, to, message, date, replyTo } = req.body;

    const newMessage = await Message.create({
      content: message,
      users: [from, to],
      sender: from,
      date,
      replyTo, // Add the replyTo field
    });

    if (newMessage) {
      return res
        .status(200)
        .json({ msg: "Message added", id: newMessage._id, status: true });
    }
  } catch (error) {
    next(error);
    console.error("Error adding the msg", error);
  }
};

module.exports.getAllMsgBetweenTowUsers = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await Message.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.content,
        date: msg.updatedAt,
        seen: msg.seen,
        _id: msg._id,
      };
    });
    res.json(projectedMessages);
  } catch (error) {
    next(error);
    console.error("Error getting the msg", error);
  }
};

module.exports.getAllMsgs = async (req, res, next) => {
  try {
    const allMsgs = await Message.find({
      sender: { $ne: req.params.id },
    }).select(["sender", "date", "content", "users", "updatedAt", "_id"]);

    res.status(200).json(allMsgs);
  } catch (error) {
    next(error);
  }
};
