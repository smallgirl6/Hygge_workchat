const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { ChatRoom, Message, User } = require('../../modules/mongodb');
require('dotenv').config();

router.get("/api/historymessageAPI", async (req, res) => {
  let token = req.headers.authorization;
  if (!token) {
      return res.status(401).send({
          message: 'Unauthorized'
      });
  }
  try {
    // 取得 currentRoom
    const currentRoom = req.headers.currentroom;
    
    // 取得所有歷史訊息，並過濾 roomid 相同的訊息
    const chatrooms = await Message.find({ roomid: currentRoom });

    const result = await Promise.all(chatrooms.map(async (chat) => {
      const user = await User.findOne({ email: chat.email });
      return {
        _id: chat._id,
        roomid: chat.roomid,
        text: chat.text,
        img: chat.img,
        email: chat.email,
        userpic: user.userpic,
        name: user.name,
        createdAt: chat.createdAt
      };
    }));

    // 查詢聊天室的房間名稱
    const chatRoom = await ChatRoom.findOne({ roomid: currentRoom });
    const roomName = chatRoom ? chatRoom.roomName : '';

    // 回傳歷史訊息及房間名稱
    res.json({ chatrooms: result, roomName });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;