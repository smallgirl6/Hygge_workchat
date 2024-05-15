const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { CollaborativeRoom}= require('../../modules/mongodb');
require('dotenv').config();

router.get("/api/getCollaborativeRoomsAPI", async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      const userEmail = decoded.email;
      const docrooms = await CollaborativeRoom.find({ email: userEmail });
      if (!docrooms) {
        console.log("User not found");
        return res.status(404).send({ message: "User not found" });
      }
      const roomIds = new Set();
      docrooms.forEach((docroom) => {
        roomIds.add(docroom.roomid);
      });
      const collaborativeRooms = await CollaborativeRoom.aggregate([
        {
          $match: { roomid: { $in: [...roomIds] } }
        },
        {
          $group: {
            _id: "$roomid",
            roomName: { $first: "$roomName" },
            lastcreatedAt: { $max: "$lastcreatedAt" }
          }
        },
        {
          $sort: { lastcreatedAt: -1 }
        }
      ]).exec();
  
      return res.status(200).send({
        docrooms: collaborativeRooms.map((room) => {
          return room;
        })
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  });

module.exports = router;