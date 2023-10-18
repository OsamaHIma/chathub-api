var express = require("express");
const {
  addMsg,
  getAllMsgBetweenTowUsers,
  getAllMsgs
} = require("../controllers/messageController");
const { deleteMsg } = require("../controllers/messageController");
var router = express.Router();

router.post("/addmsg/", addMsg);
router.post("/deletemsg/", deleteMsg);
router.post("/get_all_msgs_between_tow_users/", getAllMsgBetweenTowUsers);
router.get("/getallmsgs/:id", getAllMsgs);


module.exports = router;
