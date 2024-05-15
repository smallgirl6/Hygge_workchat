// 聊天室
let socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userData = {};
let currentRoom = "";

//歷史訊息
    fetch(`/api/historyroomAPI`, {
        method: 'GET',
        headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data.chatrooms);
        let chatrooms = data.chatrooms;
        let historyRoom = document.querySelector('.history-room');
        for (let i = 0; i < chatrooms.length; i++) {
            let chatroom = chatrooms[i];
            let historyMessage = document.createElement('div');
            // 按下每個歷史訊息的框框
            historyMessage.addEventListener("click", function() {
                // 清除 messages 內的所有 li
                document.querySelector("#messages").innerHTML = "";
                localStorage.setItem("Myemaill", data.chatrooms[i]._id);
                localStorage.setItem("ROOMID", data.chatrooms[i]._id);
                var roomId = localStorage.getItem("ROOMID");
                socket.emit("join room", roomId);
                currentRoom = roomId;
                
                // 對每一筆歷史訊息進行渲染
                fetch(`/api/historymessageAPI`, {
                    method: 'GET',
                    headers: {
                        'Authorization': localStorage.getItem('token'),
                        'Content-Type': 'application/json',
                        'currentroom': currentRoom,
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    console.log(data.chatrooms)
                        let chatroomsMessage= data.chatrooms
                        chatroomsMessage.forEach(function(chatroom){
                        let createdAt = new Date(chatroom.createdAt);
                        let year = createdAt.getFullYear();
                        let month = createdAt.getMonth() + 1;
                        let date = createdAt.getDate();
                        let hours = createdAt.getHours();
                        let minutes = createdAt.getMinutes();
                        const time = year + "/" + month + "/" + date + "  " + hours + ":" + minutes;
                        // 建立一個 li 元素
                        let messageLi = document.createElement("li");
                        // 將訊息渲染到 li 上
                        fetch('/api/userinfo', {
                            method: 'GET',
                            headers: {
                            'Authorization': localStorage.getItem('token'),
                            'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            return response.json();
                        })
                        .then(data => {
                            if (chatroom.email === data.email) {
                                messageLi.innerHTML = `
                                <div class="message-avatar">
                                    <img src="${chatroom.userpic}" alt="User Avatar">
                                </div>
                                <div class="message-content">
                                    <span class="message-content-name">${chatroom.name}</span>
                                    <br>
                                    <span class="message-content-text">${chatroom.text}</span>
                                </div>
                                <div class="message-content-time">${time}</div>  
                                `;
                            
                            } else {
                                messageLi.innerHTML = ` 
                                <div class="message-right">
                                    <div class="message-content-time-right">${time}</div>
                                    <div class="message-content-right">
                                        <span class="message-content-name-right" >${chatroom.name}</span>
                                        <br>
                                        <span class="message-content-text-right">${chatroom.text}</span>
                                    </div>
                                    <div class="message-avatar-right">
                                        <img src="${chatroom.userpic}" alt="User Avatar">
                                    </div>
                                </div>
                                `;
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });            
                    
                        // 將 li 加入 messages 元素中
                        document.querySelector("#messages").appendChild(messageLi);
                    })
                .catch(error => {
                    console.error('Error:', error);
                });
                });
            });
            historyMessage.classList.add('history-message');
            let historyMessagePic = document.createElement('div');
            historyMessagePic.classList.add('history-message-pic');
            let historyMessageImg = document.createElement('img');
            historyMessageImg.src = '/icon/user/groups.png';
            historyMessageImg.alt = 'history-message-pi';
            historyMessageImg.classList.add('history-message-img');
            historyMessagePic.appendChild(historyMessageImg);
            historyMessage.appendChild(historyMessagePic);
            let historyMessageInfo = document.createElement('div');
            historyMessageInfo.classList.add('history-message-info');
            let historyMessageName = document.createElement('div');
            historyMessageName.classList.add('history-message-name');
            historyMessageInfo.appendChild(historyMessageName);
            let historyMessageLastMessage = document.createElement('div');
            historyMessageLastMessage.classList.add('history-message-lastmessage');
            historyMessageLastMessage.innerHTML = chatroom.messages.text;
            historyMessageInfo.appendChild(historyMessageLastMessage);
            historyMessage.appendChild(historyMessageInfo);
            let historyMessageLastTime = document.createElement('div');
            historyMessageLastTime.classList.add('history-message-lasttime');
            let date = new Date(chatroom.lastcreatedAt);
            let currentDate = new Date();
            if (date.toDateString() === currentDate.toDateString()) {
                historyMessageLastTime.innerHTML = `${date.getHours()}:${date.getMinutes()}`;
            } else {
                historyMessageLastTime.innerHTML = `${date.getMonth()}/${date.getDate()}`;
            }
            historyMessage.appendChild(historyMessageLastTime);
            let deleteIcon = document.createElement('div');
            deleteIcon.classList.add('delete-icon');
            let deleteIconImg = document.createElement('img');
            deleteIconImg.src = '/icon/user/trashcan.png';
            deleteIconImg.alt = 'delete-icon';
            deleteIcon.appendChild(deleteIconImg);
            historyMessage.appendChild(deleteIcon);
            historyRoom.appendChild(historyMessage);

            if (chatroom.emails.length === 1) {
                email = chatroom.emails[0];
                const headers = {
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                };
                
                fetch(`/api/searchemail?email=${email}`, { headers })
                .then(response => {
                        return response.json();
                })
                .then(data => {
                    if (data.success === true) {
                        historyMessageImg.src = data.pic;
                        historyMessageName.innerText = data.name;
                    }
                    
                })
                .catch(error => {
                    console.error('Error:', error);
                }); 
            }
            if (chatroom.emails.length === 0){ 
                historyMessageImg.src = "/icon/user/groups.png";
                historyMessageName.innerText = "Chat Name";

            }
            else{
                historyMessageImg.src = "/icon/user/groups.png";
                historyMessageName.innerText = "Chat Name";    
            }
        }
    }) 
    .catch(error => {
        console.error('Error:', error);
    });


// 搜尋用戶是否存在
    async function searchEmail() {
        const history_room_filter = document.querySelector(".history-room-filter");
        history_room_filter.style.display = "block";
        const email = document.getElementById("emailInput").value;
        const headers = {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
        };
        const response = await fetch(`/api/searchemail?email=${email}`, { headers });
        const data = await response.json();
        const resultBox = document.querySelector(".result-box");
        const noresultBox = document.querySelector(".noresult-box");
        if(data.success==true){
            noresultBox.style.display = "none";
            resultBox.style.display = "flex";
            document.querySelector('.searchpicimg').src = data.pic;
            document.querySelector('.searchname').innerText = data.name;
            document.querySelector('.searchemail').innerText = data.email;
        }else{
            resultBox.style.display = "none";
            noresultBox.style.display = "flex";
        }
        //  mouseout 事件
        resultBox.addEventListener("mouseleave", function() {
            resultBox.style.display = "none";
            const history_room_filter = document.querySelector(".history-room-filter");
            history_room_filter.style.display = "none";
        });
        noresultBox.addEventListener("mouseleave", function() {
            noresultBox.style.display = "none";
            const history_room_filter = document.querySelector(".history-room-filter");
            history_room_filter.style.display = "none";
        });  

    }
// 關閉搜尋用戶視窗
    const closeIcon = document.querySelector(".close-icon");
    closeIcon.addEventListener("click", function() {;
        var resultBox = document.querySelector(".result-box");
        resultBox.style.display = "none";
        const history_room_filter = document.querySelector(".history-room-filter");
        history_room_filter.style.display = "none";
    });
    const noresult_closeIcon = document.querySelector(".noresult-close-icon");
    noresult_closeIcon.addEventListener("click", function() {
        var noresultBox = document.querySelector(".noresult-box");
        noresultBox.style.display = "none";
        const history_room_filter = document.querySelector(".history-room-filter");
        history_room_filter.style.display = "none";
    });


// 右上點擊加入用戶並搜尋用戶是否存在
    async function addsearchuser(){
        const email = document.getElementById("chatbox-emailInput").value;
        const headers = {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
        };
        const response = await fetch(`/api/searchemail?email=${email}`, { headers });
        const data = await response.json();
        const resultBox = document.querySelector(".chatbox-search-result-box");
        const noresultBox = document.querySelector(".nochatbox-search-result-box");
        if(data.success==true){
            noresultBox.style.display = "none";
            resultBox.style.display = "flex";
            document.querySelector('.chatbox-searchpicimg').src = data.pic;
            document.querySelector('.chatbox-searchname').innerText = data.name;
            document.querySelector('.chatbox-searchemail').innerText = data.email;
        }else{
            resultBox.style.display = "none";
            noresultBox.style.display = "flex";
        }
        // 设置 mouseout 事件
        resultBox.addEventListener("mouseleave", function() {
            resultBox.style.display = "none";
        });
        noresultBox.addEventListener("mouseleave", function() {
            noresultBox.style.display = "none";
        });  
    }
// 關閉搜尋用戶視窗
    const chatboxcloseIcon = document.querySelector(".chatbox-close-icon");
        chatboxcloseIcon.addEventListener("click", function() {
        var chatresultBox = document.querySelector(".chatbox-search-result-box");
        chatresultBox.style.display = "none";
    });
    const nochatresult_closeIcon = document.querySelector(".nochatbox-close-icon");
    nochatresult_closeIcon.addEventListener("click", function() {
        var nochatresultBox = document.querySelector(".nochatbox-search-result-box");
        nochatresultBox.style.display = "none";
    });

// 右上邊點擊加入用戶
    function adduser(){
        const chatboxsearch = document.querySelector(".chatbox-search");
        chatboxsearch.style.display = "flex";
        document.getElementById("adduser-icon").src = "/icon/user/close.png";
        document.getElementById("adduser-icon").onclick = function() {cancle()};

    };
// 右上邊點擊取消
    function cancle(){
        const chatboxsearch = document.querySelector(".chatbox-search");
        const chatresultBox = document.querySelector(".chatbox-search-result-box");
        const nochatresultBox = document.querySelector(".nochatbox-search-result-box");
        chatboxsearch.style.display = "none";
        nochatresultBox.style.display = "none";
        chatresultBox.style.display = "none";
        document.getElementById("adduser-icon").src = "/icon/user/adduser.png";
        document.getElementById("adduser-icon").onclick = function() {adduser()};
    };

// 用戶信息的email地址設置為identifier
fetch('/api/userinfo', {
    method: 'GET',
    headers: {
    'Authorization': localStorage.getItem('token'),
    'Content-Type': 'application/json'
    }
})
.then(response => {
    return response.json();
})
.then(data => {
    const identifier = data.email;
    myEmaill = data.email;
    myName = data.name;
    myPic  = data.pic;
    userData.email = data.email;
    userData.name = data.name;
    userData.pic = data.pic;
    
    // 將identifier傳送到服務器
    socket.emit('setIdentifier', identifier);
})
.catch(err => {
    console.log(err);
});

// 點擊result-box (搜尋到的使用者)後把此用者的電子信箱傳給 socket，在線上就做房間
    resultBox.addEventListener("click", function (e) {
        const email = document.querySelector(".searchemail").innerText;
        const roomName = email;
        socket.emit("create room", roomName,userData.email,userData.name, userData.pic, function (roomName) {
            console.log("Created room: " + roomName );;
        });
    });

// 點擊右邊chatbox-search-result-box (搜尋到的使用者)後把此用者的電子信箱傳給 socket
    const chatbox_search_result_box = document.querySelector(".chatbox-search-result-box");
    chatbox_search_result_box.addEventListener("click", function (e) {
        const useremail = document.querySelector(".chatbox-searchemail").innerText;
        socket.emit("add to current room", currentRoom, useremail,userData.email,userData.name, userData.pic);
        console.log("Want to add " + useremail + "to "+ currentRoom)
    });


// 從服務器收到房間的消息(使用者會先出現通知)
    socket.on("room created to user", function (roomName,email,name,pic)  {
        console.log("Received room-created event: ", roomName);
        currentRoom = roomName;
        document.querySelector(".chatNotification").style.display = "flex";
        document.querySelector(".chatbox-Notification-box").style.display = "flex";
        document.querySelector(".chatbox-Notificationimg").src = pic;
        document.querySelector(".chatbox-Notificationname").innerText = name +" sent you a message.";
        document.querySelector(".chatbox-Notificationemail").innerText = email;
    // 使用者點擊通知才會進入房間
        document.querySelector(".chatbox-Notification-box").addEventListener("click", function () {
            document.querySelector("#messages").innerHTML = "";
            socket.emit("join room", currentRoom);
            document.querySelector(".chatNotification").style.display = "none";
            document.querySelector(".chatbox-Notification-box").style.display = "none";
        })
    });
// 從服務器收到房間的消息(自己則會馬上進入房間)
    socket.on("room created to me", function (roomName)  {
        console.log("Received room-created event: ", roomName);
        document.querySelector("#messages").innerHTML = "";
        socket.emit("join room", roomName);
        currentRoom = roomName;
    });
// 按下submit後訊息會傳到後端
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        
        if (input.value) {
            // 傳送訊息者的大頭照和姓名
            fetch('/api/userinfo', { 
                method: 'GET',
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                // 將圖片網址放入userpic區塊的
                const email = data.email;
                const pic = data.pic;
                // 將文字放入username
                const name = data.name;
                socket.emit("chat message", input.value, name, pic, email, currentRoom);
                input.value = "";
            })
            .catch(err => {
                console.log(err);
            });
        }
    });
    socket.on("chat message user", function (msg, name, email, pic, roomName) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const hours = now.getHours();
        let minutes = now.getMinutes();
        minutes = (minutes < 10 ? "0" : "") + minutes;
        const time = year + "/" + month + "/" + date + "  " + hours + ":" + minutes;

        const messageLi = document.createElement("li");
        messageLi.innerHTML = ` 
            <div class="message-right">
                <div class="message-content-time-right">${time}</div>
                <div class="message-content-right">
                    <span class="message-content-name-right" >${name}</span>
                    <br>
                    <span class="message-content-text-right">${msg}</span>
                </div>
                <div class="message-avatar-right">
                    <img src="${pic}" alt="User Avatar">
                </div>
            </div>
        `;
        messages.appendChild(messageLi);
        const messagesContainer = document.getElementById("messagesbox");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        const chatroomName ="chatroomName"
        // 計算文字的寬度
        const messageContent = messageLi.querySelector(".message-content-right");
        messageContent.style.display = "inline-block";
        const nameWidth = messageLi.querySelector(".message-content-name-right").offsetWidth;
        const textWidth = messageLi.querySelector(".message-content-text-right").offsetWidth;
        messageContent.style.display = "";

        // 根據閾值設定寬度
        const threshold = 500;
        if (Math.max(nameWidth, textWidth ) > threshold) {
            messageContent.style.width = threshold + "px";
        } else {
            messageContent.style.width = Math.max(nameWidth, textWidth) + "px";
        }
    });

    socket.on("chat message me", function (msg, name, email, pic, roomName) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const hours = now.getHours();
        let minutes = now.getMinutes();
        minutes = (minutes < 10 ? "0" : "") + minutes;
        const time = year + "/" + month + "/" + date + "  " + hours + ":" + minutes;

        const messageLi = document.createElement("li");
        messageLi.innerHTML = `
            <div class="message-avatar">
                <img src="${pic}" alt="User Avatar">
            </div>
            <div class="message-content">
                <span class="message-content-name" >${name}</span>
                <br>
                <span class="message-content-text">${msg}</span>
            </div>
            <div class="message-content-time">${time}</div>
        `;
        messages.appendChild(messageLi);
        const messagesContainer = document.getElementById("messagesbox");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        const chatroomName ="chatroomName"
        // 計算文字的寬度
        const messageContent = messageLi.querySelector(".message-content");
        messageContent.style.display = "inline-block";
        const nameWidth = messageLi.querySelector(".message-content-name").offsetWidth;
        const textWidth = messageLi.querySelector(".message-content-text").offsetWidth;
        messageContent.style.display = "";

        // 根據閾值設定寬度
        const threshold = 500;
        if (Math.max(nameWidth, textWidth ) > threshold) {
            messageContent.style.width = threshold + "px";
        } else {
            messageContent.style.width = Math.max(nameWidth, textWidth) + "px";
        }
        console.log(email, roomName, chatroomName, msg, time, email, name, pic)
        socket.emit("save message",email, roomName, chatroomName, msg, time, email, name, pic);

    });
