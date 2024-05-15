const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { ChatRoom, User ,CollaborativeRoom} = require('../../modules/mongodb');
require('dotenv').config();

router.delete('/api/deleteChatroomAPI', (req, res) => {
  let token = req.headers.authorization;
  if (!token) {
      return res.status(401).send({
          message: 'Unauthorized'
      });
  }
  try {
    jwt.verify(token, process.env.TOKEN_SECRET, async function(err, decoded) {  
        // 取得 currentRoom
        const currentRoom = req.headers.currentroom;
        let userEmail = decoded.email;
        console.log(userEmail+currentRoom)
        // 檢查使用者是否擁有這個聊天室
        const chatRoom = await ChatRoom.findOne({ email: userEmail, roomid: currentRoom  });
        if (!chatRoom) {
            console.log('Chatroom not found')
            return res.status(404).json({ message: 'Chatroom not found' });
        }
        // 刪除聊天室
        await ChatRoom.deleteOne({ email: userEmail, roomid: currentRoom  });

        return res.json({ message: 'Chatroom deleted' });
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});


router.delete('/api/deleteDocroomAPI', (req, res) => {
  let token = req.headers.authorization;
  if (!token) {
      return res.status(401).send({
          message: 'Unauthorized'
      });
  }
  try {
    jwt.verify(token, process.env.TOKEN_SECRET, async function(err, decoded) {  
        // 取得 currentRoom
        const currentRoom = req.headers.currentroom;
        let userEmail = decoded.email;
        console.log(userEmail+currentRoom)
        // 檢查使用者是否擁有這個聊天室
        const DocRoom = await CollaborativeRoom.findOne({ email: userEmail, roomid: currentRoom  });
        if (!DocRoom) {
            console.log('Chatroom not found')
            return res.status(404).json({ message: 'Chatroom not found' });
        }
        // 刪除聊天室
        await CollaborativeRoom.deleteOne({ email: userEmail, roomid: currentRoom  });

        return res.json({ message: 'Chatroom deleted' });
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

module.exports = router;