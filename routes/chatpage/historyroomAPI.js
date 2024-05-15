const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { ChatRoom, Message } = require('../../modules/mongodb');
require('dotenv').config();

router.get("/api/historyroomAPI", function(req, res) {
    // 檢查token是否存在
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({
            message: 'Unauthorized'
        });
    }
    // 使用token去驗證身份(jwt)
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err) {  
            return res.status(402).send({
                message: 'Invalid token'
            });
        }
        // 取得使用者的Email
        let userEmail = decoded.email;
        // 從資料庫查詢與該使用者email相同的聊天室資訊
        ChatRoom.find({ email:userEmail}, function(err, chatrooms) {
            if (err) {
                console.log('Error while getting user information')
                return res.status(500).send({
                    message: 'Error while getting user information'
                });
            }
            if (!chatrooms) {
                console.log('User not found')
                return res.status(404).send({
                    message: 'User not found'
                });
            }
            // 取得不同的roomid數量和roomid的值
            const roomIds = new Set();
            chatrooms.forEach(chatroom => {
                roomIds.add(chatroom.roomid);
            });
            ChatRoom.aggregate([
                { $match: { roomid: { $in: [...roomIds] } } },
                { $group: { _id: "$roomid", roomName: { $first: "$roomName" }, lastcreatedAt: { $max: "$lastcreatedAt" } } },
                { $sort: { lastcreatedAt: -1 } },
                {
                  $lookup: {
                    from: 'messages',
                    let: { roomid: "$_id" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ["$roomid", "$$roomid"] },
                            ]
                          }
                        }
                      },
                      { $sort: { createdAt: -1 } },
                      { $limit: 1 },
                      {
                        $project: {
                          email: 1,
                          createdAt: 1,
                          text: 1
                        }
                      }
                    ],
                    as: 'messages'
                  }
                },
                { $unwind: '$messages' }
              ]).exec((err, chatrooms) => {
                if (err) return res.status(500).send(err);
              
                let roomids = chatrooms.map(room => room._id);
                Message.aggregate([
                  { $match: { roomid: { $in: roomids } } },
                  { $group: { _id: "$roomid", emails: { $addToSet: "$email" } } }
                ]).exec((err, roomEmails) => {
                  if (err) return res.status(500).send(err);
              
                  chatrooms = chatrooms.map(room => {
                    let roomEmail = roomEmails.find(r => r._id === room._id);
                    room.emails = roomEmail ? roomEmail.emails : [];
                    return room;
                  });
              
                  return res.status(200).send({
                    chatrooms: chatrooms.map(room => {
                      room.emails = room.emails.filter(email => email !== userEmail);
                      return room;
                    })
                  });
                
                });
            });        
        });
    });
});


// router.get("/api/historyroomAPI", function(req, res) {
//   // 檢查token是否存在
//   let token = req.headers.authorization;
//   if (!token) {
//     return res.status(401).send({
//       message: 'Unauthorized'
//     });
//   }
//   // 使用token去驗證身份(jwt)
//   jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
//     if (err) {  
//       return res.status(402).send({
//         message: 'Invalid token'
//       });
//     }
//     // 取得使用者的Email
//     let userEmail = decoded.email;
//     // 從資料庫查詢與該使用者email相同的聊天室資訊
//     ChatRoom.find({ email: userEmail }, function(err, chatrooms) {
//       if (err) {
//         console.log('Error while getting user information')
//         return res.status(500).send({
//           message: 'Error while getting user information'
//         });
//       }
//       if (!chatrooms) {
//         console.log('User not found')
//         return res.status(404).send({
//           message: 'User not found'
//         });
//       }
//       // 取得不同的roomid數量和roomid的值
//       const roomIds = new Set();
//       chatrooms.forEach(chatroom => {
//         roomIds.add(chatroom.roomid);
//       });
//       ChatRoom.aggregate([
//         { $match: { roomid: { $in: [...roomIds] } } },
//         { $group: { _id: "$roomid", lastcreatedAt: { $max: "$lastcreatedAt" } } },
//         { $sort: { lastcreatedAt: -1 } },
//         {
//           $lookup: {
//             from: 'messages',
//             let: { roomid: "$_id" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$roomid", "$$roomid"] },
//                     ]
//                   }
//                 }
//               },
//               { $sort: { createdAt: -1 } },
//               { $limit: 1 },
//               {
//                 $project: {
//                   email: 1,
//                   createdAt: 1,
//                   text: 1
//                 }
//               }
//             ],
//             as: 'messages'
//           }
//         },
//         { $unwind: '$messages' }
//       ]).exec((err, chatrooms) => {
//         if (err) return res.status(500).send(err);

//         let roomids = chatrooms.map(room => room._id);
//         Message.aggregate([
//           { $match: { roomid: { $in: roomids } } },
//           { $group: { _id: "$roomid", emails: { $addToSet: "$email" } } }
//         ]).exec((err, roomEmails) => {
//           if (err) return res.status(500).send(err);
        
//           chatrooms = chatrooms.map(room => {
//             let roomEmail = roomEmails.find(r => r._id === room._id);
//             room.emails = roomEmail ? roomEmail.emails : [];
//             return room;
//           });
//         });
//         // 取得聊天室的名稱
//         ChatRoom.find({ roomid: { $in: [...roomIds] } }, { roomName: 1 })
//           .exec((err, roomNames) => {
//             if (err) return res.status(500).send(err);
//             // 將聊天室名稱與對應的聊天室資訊合併
//             chatrooms = chatrooms.map(room => {
//               let roomName = roomNames.find(r => r.roomid === room._id);
//               room.roomName = roomName ? roomName.roomName : "";
//               return room;
//             });
//             // 回傳聊天室資訊
//             return res.status(200).send({
//               chatrooms: chatrooms.map(room => {
//                 room.emails = room.emails.filter(email => email !== userEmail);
//                 return room;
//               })
//             });
//           });
//       });
//     });
//   });
// });     
        

module.exports = router;