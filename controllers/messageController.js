const Message = require("../models/message");

module.exports.addMsg = async (req, res, next) => {
  try {
    const { from, to, message, date } = req.body;
    const newMessage = await Message.create({
      content: message,
      users: [from, to],
      sender: from,
      date,
    });
    if (newMessage)
      return res.status(200).json({ msg: "Message added", status: true });
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
        date: msg.date,
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
    }).select(["sender", "date", "content", "updatedAt", "_id"]);

    res.status(200).json(allMsgs);
  } catch (error) {
    next(error);
  }
};
