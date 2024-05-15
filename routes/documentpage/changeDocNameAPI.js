const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { CollaborativeRoom,ChatRoom }= require('../../modules/mongodb');
require('dotenv').config();

router.put('/api/changeDocNameAPI', async (req, res) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      message: 'Unauthorized'
    });
  }
  try {
    console.log(req.body);
    const { roomName } = req.body;
    const roomId = req.headers.currentroom;
    console.log("roomName is "+roomName);
    console.log("roomID is "+roomId);

    // 更新 CollaborativeRoom 的 roomName 欄位
    const updatedCollaborativeRoom = await CollaborativeRoom.updateMany(
      { roomid: roomId },
      { roomName: roomName }
    );

    // 更新 ChatRoom 的 roomName 欄位
    const updatedChatRoom = await ChatRoom.updateMany(
      { roomid: roomId },
      { roomName: roomName }
    );
    console.log("OK")
    // 回傳更新後的 CollaborativeRoom 和 ChatRoom
    return res.status(200).json({
      data:roomName
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;