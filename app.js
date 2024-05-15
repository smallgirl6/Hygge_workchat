
const express = require('express');
const app = express();

const port = 5007;
const path = require('path')
const http = require('http');
const server = http.createServer(app);

// 設定 view engine
app.set('view engine', 'ejs')
// 導入public資料夾裡的東西
app.use(express.static(path.join(__dirname, 'public')))
//將每個請求的主體解析為 JSON 對象
app.use(express.json())

 // 叫 express 去 render views 底下叫做 login 的檔案
app.get('/', (req, res) => {
  res.render('login')
})
 // 叫 express 去 render views 底下叫做 index 的檔案
app.get('/index', (req, res) => {
    res.render('index');
});

// Routes 
const signupAPI = require('./routes/loginpage/signupAPI');
const loginAPI = require('./routes/loginpage/loginAPI');
app.post('/api/signup', signupAPI);
app.post('/api/login', loginAPI);

const userinfoAPI = require('./routes/indexpage/userinfoAPI');
app.get('/api/userinfo', userinfoAPI);

const edituserAPI = require('./routes/profilepage/edituserAPI');
app.post('/api/edituser', edituserAPI);
const signoutAPI = require('./routes/profilepage/signoutAPI');
app.delete('/api/signout', signoutAPI);

const searchemailAPI = require('./routes/chatpage/searchemailAPI');
app.get('/api/searchemail', searchemailAPI);

const historyroomAPI= require('./routes/chatpage/historyroomAPI');
app.get('/api/historyroomAPI', historyroomAPI);

const historymessageAPI = require('./routes/chatpage/historymessageAPI');
app.get('/api/historymessageAPI', historymessageAPI);

const deleteChatroomAPI = require('./routes/chatpage/deleteChatroomAPI');
app.delete('/api/deleteChatroomAPI', deleteChatroomAPI);
const deleteDocroomAPI = require('./routes/chatpage/deleteChatroomAPI');
app.delete('/api/deleteDocroomAPI', deleteDocroomAPI);

const getCollaborativeRoomsAPI= require('./routes/documentpage/getCollaborativeRoomsAPI');
app.get('/api/getCollaborativeRoomsAPI', getCollaborativeRoomsAPI);

const getCollaborativeTextSchemasAPI= require('./routes/documentpage/getCollaborativeTextSchemasAPI');
app.get('/api/getCollaborativeTextSchemasAPI', getCollaborativeTextSchemasAPI)

const changeDocNameAPI= require('./routes/documentpage/changeDocNameAPI');
app.put('/api/changeDocNameAPI', changeDocNameAPI)

const updateUserStatusAPI= require('./routes/indexpage/updateUserStatusAPI');
app.put('/api/updateUserStatusAPI', updateUserStatusAPI)

const findUserAPI= require('./routes/finduserpage/findUserAPI');
app.get('/api/findUserAPI', findUserAPI)


const navAPI = require('./routes/indexpage/navAPI');
app.use('/', navAPI);

const socketEvents = require('./modules/socket-events');
socketEvents(server);


// 將 session 中介件與 server 綁定： 
server.listen(port, () => {
  console.log(`Server is listening on port:${port} , http://localhost:${port}`)
})


