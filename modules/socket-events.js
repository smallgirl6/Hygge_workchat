// //  socket.io connection
// const io = require("socket.io");

// module.exports = (server) => {
//     const socketServer = io(server);
//     socketServer.on("connection", (socket) => {
//         console.log("User connected");
//         socket.on("chat message", (msg) => {
//             console.log("Message: " + msg);
//             socketServer.emit("chat message", msg);
//         });
//     });
// };


const { User, ChatRoom, Message, CollaborativeRoom,CollaborativeText,CollaborativeTextStyle,CollaborativeImgStyle} = require('./mongodb');
const io = require("socket.io");
require('dotenv').config();
const OpenAI = require('./OpenAI');
const S3 = require('./awsS3');
var Buffer = require('buffer/').Buffer

module.exports = (server) => {
    // 所有登入者的的紀錄maill和socket.id存入onlineclient
    const onlineclients = new Map()
    const socketServer = io(server);
    socketServer.on("connection", (socket) => {
        console.log('A client connected:', socket.id);
        let myIdentifier;
         // 建立一個物件來存放每個客戶端的 identifier 和 socket ID
         socket.on("setIdentifier", async (identifier) => {
            console.log("Client connected with identifier: ", identifier);
            myIdentifier = socket.id;
            onlineclients.set(identifier, {
              socketId: myIdentifier,
              status: "online",
            });
            console.log("All socket : ", [...onlineclients]);
          
            // 找到使用者，並更新狀態
            try {
              const user = await User.findOneAndUpdate(
                { email: identifier },
                { status: "available" },
                { new: true }
              );
              console.log(`User ${identifier} is now available.`);
            } catch (error) {
              console.error(error);
            }
          });
         // 當用戶斷開連接時，將其電子郵件地址和狀態從 onlineclients 中刪除
         socket.on("disconnect", async () => {
            console.log("Client disconnected:", myIdentifier);
            const entries = [...onlineclients.entries()];
            for (let i = 0; i < entries.length; i++) {
              if (entries[i][1].socketId === myIdentifier) {
                const disconnectedIdentifier = entries[i][0];
                onlineclients.delete(disconnectedIdentifier);
                console.log("All socket : ", [...onlineclients]);
          
                // 找到使用者，並更新狀態
                try {
                  await User.findOneAndUpdate(
                    { email: disconnectedIdentifier },
                    { status: "offline" },
                    { new: true }
                  );
                  console.log(`User ${disconnectedIdentifier} is now offline.`);
                } catch (error) {
                  console.error(error);
                }
                break;
              }
            }
          });
         
         // 建立room並且發訊息給好友
        socket.on("create room", (roomid,email,name,pic) => {
            // 查看好友是不是在線上
            let friendIdentifier ;
            for (const [clientIdentifier,{socketId}] of [...onlineclients]) {
                if (clientIdentifier === roomid) {
                    friendIdentifier = socketId;
                    break;
                }
            }
            const roomId = `room-${new Date().getTime()}-${roomid}`;
            socket.emit("room created to me", roomId);
            socket.emit("Created room for offline user",roomid, roomId);
            if (friendIdentifier) {
                // 使用者在線上
                socket.to(friendIdentifier).emit("room created to user", roomId, email, name, pic);
            }
            
        });
        
        socket.on("join room", (roomId,myemail) => {
            socket.join(roomId);
        });
        
         // 把房間號碼發訊息給好友讓好友加入以創好的房間
         socket.on("add to current room", (roomId,useremail,email,name,pic) => {
            // 查看好友是不是在線上
            let friendIdentifier ;
            for (const [clientIdentifier,socketId] of [...onlineclients]) {
                console.log("onlineclients: ", [...onlineclients])
                console.log("clientIdentifier: "+ clientIdentifier)
                console.log("socketId: "+ socketId)
                if (clientIdentifier=== useremail) {
                    friendIdentifier = socketId;
                    break;
                }
            }
            if (friendIdentifier) {
                // 使用者在線上 傳給好友roomName
                socket.to(friendIdentifier).emit("room created to user", roomId,email,name,pic);
            } else {
                // 使用者不在線上
                socket.emit("Created room for offline user",useremail, roomId);
            }
            // 傳給好友roomName
            socket.to(friendIdentifier).emit("room created to user", roomId,email,name,pic);
            // 追蹤是否發送了 room-created 事件。
            console.log(`Room created notification sent to ${friendIdentifier}`);
            
        })
        // 聊天室傳送訊息
        socket.on("chat message", (msg, name, pic, email, roomId,chatgptimg) => {

          if (roomId === email+" with ai-chatroom") {
              socket.to(roomId).emit("chat message user", msg, name, email, pic, roomId);
              socket.emit("chat message me", msg, name, email, pic, roomId);
              OpenAI.createCompletion({
                  model: "gpt-3.5-turbo-instruct",
                  prompt: msg,
                  temperature: 0,
                  max_tokens: 500
                }).then(response => {
                  const AIrespons = response.data.choices[0].text
                  console.log(AIrespons)
                  socket.emit("chat message form offline user and AI", AIrespons, "AI","AI", chatgptimg, roomId);
                }).catch((error) => {
                  console.error(error);
                });
                ;
          } else {
              socket.to(roomId).emit("chat message user", msg, name, email, pic, roomId);
              socket.emit("chat message me", msg, name, email, pic, roomId);
          }
      });
        // 聊天室傳送圖片
        // 接收前端傳送的圖片 Base64 編碼字串
        socket.on('send image', async (base64Image, name, pic, email, roomid) => {
            // 將 Base64 編碼字串轉換成二進位制格式
            const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const randomNumber = Math.floor(Math.random() * 1000000 + Date.now() / 1000);
            const fileName = 'chatmessage/' + `${roomid}+${randomNumber}`;
            // console.log("buffer"+buffer)
            console.log("fileName"+fileName)
            // 將圖片存儲到 AWS S3
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName,
                Body: buffer,
                ContentType: 'image/jpeg'
            };
            const data = await S3.upload(params).promise();
            const imageURL = data.Location;
            console.log(imageURL)
            socket.to(roomid).emit("chat pic user", imageURL , name, email, pic, roomid);
            socket.emit("chat pic me", imageURL , name, email, pic, roomid);
        });


        socket.on("chat message form offline user", (msg, name, pic, email, roomId) => {
            console.log("chat message form offline user"+msg+ name+email)
            socket.emit("chat message form offline user and AI", msg, name, email, pic, roomId);
            socket.to(roomId).emit("chat message user", msg, name, email, pic, roomId);
        });
       
        //把聊天訊息保存到資料庫
        socket.on("save message", async (myemail, roomid, message, imageURL, time, email,currentRoomName) => {
            console.log(myemail, roomid, message, imageURL, time, email,currentRoomName);
            const ChatRoomSchema = new ChatRoom({ 
                email: myemail,
                roomid: roomid, 
                lastcreatedAt: Date.now(),
                roomName: currentRoomName
            });
        
            await ChatRoomSchema.save();
            console.log("Message inserted into the ChatRoomSchema");

            const MessageSchema = new Message({ 
                roomid: roomid,  
                text: message, 
                img:imageURL,
                createdAt:  time,
                email: email, 
            });
        
            await MessageSchema.save(); 
            console.log("Message inserted into the MessageSchema");
        });

        //被加入房間時就有編輯文件讀權限
        socket.on("document permission", async (myemail, roomId,currentRoomName) => {
            console.log("document permission event: ", myemail, roomId,currentRoomName);
            // 在更新資料庫時，先確認集合內roomid欄位尋找有沒有相同的roomid，若有相同的roomid則更新，若沒有的話就加一筆新的進去
            const updateCollaborativeRoom = await CollaborativeRoom.findOneAndUpdate(
                { roomid: roomId, email: myemail },
                { $set: { email: myemail, roomid: roomId, roomName: currentRoomName, lastcreatedAt: Date.now() } },
                { upsert: true, new: true }
            );
            console.log("Content inserted/updated into the CollaborativeRoom");
        });
    
        socket.on("div-change", async(content, roomId, myemail,currentRoomName)=> {
            socket.to(roomId).emit("div-change", content);
            console.log("Received save content event: ", myemail, roomId, content,currentRoomName);
            // 在更新資料庫時，先確認集合內roomid欄位尋找有沒有相同的roomid，若有相同的roomid則更新，若沒有的話就加一筆新的進去
            const updateCollaborativeRoom = await CollaborativeRoom.findOneAndUpdate(
                { roomid: roomId, email: myemail },
                { $set: { email: myemail, roomid: roomId, roomName: currentRoomName, lastcreatedAt: Date.now() } },
                { upsert: true, new: true }
            );
            console.log("Content inserted/updated into the CollaborativeRoom");
        
            const updateCollaborativeText = await CollaborativeText.findOneAndUpdate(
                { roomid: roomId},
                { $set: { roomid: roomId, content: content, createdAt: Date.now(), email: myemail } },
                { upsert: true, new: true }
            );
            console.log("Content inserted/updated into the CollaborativeText");
        
        });
        // 文件內傳送圖片
        // 接收前端傳送的圖片 Base64 編碼字串
        socket.on('doc image', async (base64Image , roomid ,id) => {
          console.log(`img`+id)
            // 將 Base64 編碼字串轉換成二進位制格式
            const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const randomNumber = Math.floor(Math.random() * 1000000 + Date.now() / 1000);
            const fileName = 'docpic/' + `${roomid}+${randomNumber}`;
            // console.log("buffer"+buffer)
            console.log("fileName"+fileName)
            // 將圖片存儲到 AWS S3
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName,
                Body: buffer,
                ContentType: 'image/jpeg'
            };
            const data = await S3.upload(params).promise();
            const imageURL = data.Location;
            console.log(imageURL);
            socket.emit('image-url', imageURL, roomid,id);
            socket.to(roomid).emit('image-url',imageURL,roomid,id);
        });


        socket.on("font-size-change", (fontSize, roomId) => {
            socket.to(roomId).emit("font-size-change", fontSize);
        });   

        socket.on("font-color-change", (fontColor, roomId) => {
            socket.to(roomId).emit("font-color-change", fontColor);
        });

        socket.on("img-scale-change", (id, scale, roomId) => {
            socket.to(roomId).emit("img-scale-change", id, scale);
        });

        // 文字樣式更改事件
        socket.on("text-style-change", async ({ roomId, fontSize, color }) => {
          const updateCollaborativeTextStyle = await CollaborativeTextStyle.findOneAndUpdate(
            { roomId: roomId },
            { $set: {  roomId:  roomId, fontSize: fontSize, color: color,createdAt: Date.now() } },
            { upsert: true, new: true }
          );
          console.log("Text style inserted/updated into the CollaborativeTextStyle");
        });

         // 圖片樣式更改事件
        socket.on("img-style-change", async ({ elementId, transform }) => {
          const updateCollaborativeImgStyle = await CollaborativeImgStyle.findOneAndUpdate(
            { elementId: elementId },
            { $set: { elementId: elementId, transform: transform,createdAt: Date.now() } },
            { upsert: true, new: true }
          );
          console.log("Image style inserted/updated into the CollaborativeImgStyle");
        });
        // 保存圖片URL到數據庫中
        socket.on("img-url-save", async ({ elementId, url }) => {
          console.log("img-url-save"+url)
          const updateCollaborativeImgStyle = await CollaborativeImgStyle.findOneAndUpdate(
              { elementId: elementId },
              { $set: { elementId: elementId, url: url } },
              { upsert: true, new: true }
          );
          console.log("Image URL inserted/updated into the CollaborativeImgStyle");
      })

        //把文字保存到資料庫
        // socket.on("save content", async (myemail, roomId, content,currentRoomName) => {
        //     console.log("Received save content event: ", myemail, roomId, content,currentRoomName);
        //     // 在更新資料庫時，先確認集合內roomid欄位尋找有沒有相同的roomid，若有相同的roomid則更新，若沒有的話就加一筆新的進去
        //     const updateCollaborativeRoom = await CollaborativeRoom.findOneAndUpdate(
        //         { roomid: roomId, email: myemail },
        //         { $set: { email: myemail, roomid: roomId, roomName: currentRoomName, lastcreatedAt: Date.now() } },
        //         { upsert: true, new: true }
        //     );
        //     console.log("Content inserted/updated into the CollaborativeRoom");
        
        //     const updateCollaborativeText = await CollaborativeText.findOneAndUpdate(
        //         { roomid: roomId},
        //         { $set: { roomid: roomId, content: content, createdAt: Date.now(), email: myemail } },
        //         { upsert: true, new: true }
        //     );
        //     console.log("Content inserted/updated into the CollaborativeText");
        // });

        // 當房間名稱更改時向房間內的其他使用者廣播新房間名稱
        socket.on("change room name", (roomId, roomName) => {
            socket.to(roomId).emit("room name changed", roomName);
        });
    });
    
};
