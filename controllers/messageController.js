const Message = require("../models/message");

module.exports.addMsg = async (req, res, next) => {
  try {
    const { from, to, message, date, replyTo, fileURL } = req.body;

    const newMessage = await Message.create({
      content: message,
      users: [from, to],
      sender: from,
      date,
      fileURL,
      replyTo,
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
module.exports.deleteMsg = async (req, res, next) => {
  try {
    const { id } = req.body;

    const deletedMessage = await Message.deleteOne({ _id: id });
    
    if (deletedMessage) {
      return res.status(200).json({ msg: "Message deleted", status: true });
    }
  } catch (error) {
    next(error);
    console.error("Error deleting the msg", error);
  }
};

module.exports.getAllMsgBetweenTowUsers = async (req, res, next) => {
  try {
    const { from, to, page } = req.body;
    const PAGE_SIZE = 30;
    const messages = await Message.find({
      users: {
        $all: [from, to],
      },
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const projectedMessages = await Promise.all(
      messages.map(async (msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.content,
          date: msg.updatedAt,
          seen: msg.seen,
          fileURL: msg.fileURL,
          replyTo: msg.replyTo,
          replyToMessage: msg.replyTo
            ? await Message.findOne({ _id: msg.replyTo })
            : false,
          _id: msg._id,
        };
      })
    );
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
    });

    res.status(200).json(allMsgs);
  } catch (error) {
    next(error);
  }
};
