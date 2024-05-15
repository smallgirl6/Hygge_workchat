
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { CollaborativeRoom, CollaborativeText, CollaborativeTextStyle, CollaborativeImgStyle } = require('../../modules/mongodb');
require('dotenv').config();

router.get("/api/getCollaborativeTextSchemasAPI", async (req, res) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      message: 'Unauthorized'
    });
  }
  try {
    // 取得 currentRoom
    const currentRoom = req.headers.currentroom;

    // 找到所有的CollaborativeText，並只選擇content和email欄位
    const docrooms = await CollaborativeText.find({ roomid: currentRoom }, { content: 1, email: 1 });
    const userEmails = docrooms.map((docroom) => docroom.email);

    // 找到所有與CollaborativeText中roomid對應的CollaborativeRoom
    const rooms = await CollaborativeRoom.find({ roomid: currentRoom });

    // 將CollaborativeRoom中的roomName和對應的email組成一個物件
    const roomNames = {};
    rooms.forEach((room) => {
      if (userEmails.includes(room.email)) {
        roomNames[room.email] = room.roomName;
      }
    });

    // 找到與CollaborativeText中roomid對應的CollaborativeTextStyle，並按照createdAt進行倒序排列
    // const collaborativeTextStyle = await CollaborativeTextStyle.findOne({ roomId: currentRoom }).sort({ createdAt: -1 }).limit(1);
    const collaborativeTextStyle = await CollaborativeTextStyle.findOne({ roomId: currentRoom, fontSize: { $ne: null }, color: { $ne: null } }).sort({ createdAt: -1 }).limit(1);

    // 找到與CollaborativeText中roomid對應的CollaborativeImgStyle，並按照createdAt進行倒序排列
    const collaborativeImgStyle = await CollaborativeImgStyle.findOne({ roomId: currentRoom }).sort({ createdAt: -1 }).limit(1);

    // 回傳歷史訊息和CollaborativeRoom中的roomName、CollaborativeTextStyle和CollaborativeImgStyle
    res.json({
      docrooms: docrooms.map((docroom) => {
        return {
          content: docroom.content,
          email: docroom.email,
          roomName: roomNames[docroom.email],
        };
      }),
      collaborativeTextStyle,
      collaborativeImgStyle
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;