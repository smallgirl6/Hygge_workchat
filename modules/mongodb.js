//設定Mongoose
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', (error) => {
    console.error(error);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userpic: { type: String, required: true },
    status: { type: String, required: true, default: "offline" } 
});

const ChatRoomSchema = new mongoose.Schema({
    email: { type: String, ref: 'User' },
    roomid: { type: String, required: true },
    roomName: { type: String, default: "Chat name" },
    lastcreatedAt: { type: Date, default: Date.now },
});
const MessageSchema = new mongoose.Schema({
    roomid: { type: String, ref: 'ChatRoom' },
    text: { type: String },
    img:{ type: String },
    createdAt: { type: Date, default: Date.now },
    email: { type: String, ref: 'User' },
});

const CollaborativeRoomSchema = new mongoose.Schema({
    email: { type: String, ref: 'User' },
    roomid: { type: String, required: true },
    roomName: { type: String, default: "Doc name" },
    lastcreatedAt: { type: Date, default: Date.now },
});

const CollaborativeTextSchema = new mongoose.Schema({
    roomid: { type: String, ref: 'CollaborativeRoom' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
    email: { type: String, ref: 'User' },
  });
  
  const CollaborativeTextStyleSchema = new mongoose.Schema({
    roomId: { type: String ,ref: 'CollaborativeText'},
    createdAt: { type: Date, default: Date.now },
    fontSize: { type: String },
    color: { type: String },
  });
  
  const CollaborativeImgStyleSchema = new mongoose.Schema({
    roomId: { type: String ,ref: 'CollaborativeText'},
    createdAt: { type: Date, default: Date.now },
    url: {type: String },
    elementId: { type: String },
    transform: { type: String },
  });
  

const User = mongoose.model('User', UserSchema);
const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
const Message = mongoose.model('Message', MessageSchema);
const CollaborativeRoom = mongoose.model('CollaborativeRoom', CollaborativeRoomSchema);
const CollaborativeText = mongoose.model('CollaborativeText', CollaborativeTextSchema);
const CollaborativeTextStyle = mongoose.model('CollaborativeTextStyle', CollaborativeTextStyleSchema);
const CollaborativeImgStyle = mongoose.model('CollaborativeImgStyle', CollaborativeImgStyleSchema);



module.exports = { User, ChatRoom, Message, CollaborativeRoom, CollaborativeText, CollaborativeTextStyle, CollaborativeImgStyle};