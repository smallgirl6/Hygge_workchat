export function initdisplaydata(){

    document.querySelector('.findUser').addEventListener('click', function() {
        // 定義 debounceTimer 變量
        let debounceTimer = null;
        // 添加防抖邏輯
        if (!debounceTimer) {
            debounceTimer = setTimeout(function() {
                document.querySelector('.Docbox').style.display = 'none';
                document.querySelector('.introducebox').style.display = 'none';
                document.querySelector('.history-room-doc').style.display = 'none';
                document.querySelector('.chatbox').style.display = 'none';
                document.querySelector('.history-room-chat').style.display = 'none';
                document.querySelector('.display-alluser').style.display = 'block';
                document.querySelector(".Docname span").textContent =  'Doc name';
                document.querySelector("#collaborative-div").innerHTML = "";
                // 防止重新讀取時，重複讀取的問題，在重新讀取時選取所有舊的 allDoc 區塊，並刪除它們，再去讀取新的
                async function removeuser() {
                    let displayusers = document.querySelectorAll('.displayuser');
                    if (displayusers.length !== 0) {
                        displayusers.forEach(function(displayuser) {
                            displayuser.remove();
                        });
                    };
                }
                async function loadUser() {
                    await removeuser(); 
                    fetch('/api/findUserAPI', {
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
                    console.log(data)
                    const alldata = data.data
                    const displayAllUsers = document.querySelector('.display-alluser');
                    for (let i = 0; i < alldata.length; i++) {
                        const user = alldata[i];
                        const { status, email, name, userpic } = user; // 選擇需要的欄位
                        const displayUser = document.createElement('div');
                        displayUser.classList.add('displayuser');
                
                        const displayUserPic = document.createElement('div');
                        displayUserPic.classList.add('displayuser-pic');
                
                        const displayUserImg = document.createElement('img');
                        displayUserImg.classList.add('displayuser-pic-img');
                        displayUserImg.setAttribute('src', user.userpic);
                
                        const userColorBall = document.createElement('div');
                        userColorBall.classList.add('usercolorball');
                        const userColorBallImg = document.createElement('img');
                        if (user.status === "available") {
                        userColorBallImg.setAttribute('src', '/icon/status/green-status.png');
                        } else if (user.status === "busy") {
                        userColorBallImg.setAttribute('src', '/icon/status/red-status.png');
                        } else if (user.status === "away") {
                        userColorBallImg.setAttribute('src', '/icon/status/yellow-status.png');
                        } else if (user.status === "offline") {
                        userColorBallImg.setAttribute('src', '/icon/status/black-status.png');
                        }
                        userColorBall.appendChild(userColorBallImg);
                
                        displayUserPic.appendChild(displayUserImg);
                        displayUserPic.appendChild(userColorBall);
                
                        const displayUserInfo = document.createElement('div');
                        displayUserInfo.classList.add('displayuser-info');
                
                        const displayUserName = document.createElement('div');
                        displayUserName.classList.add('displayuser-name');
                        displayUserName.textContent = user.name;
                
                        const displayUserEmail = document.createElement('div');
                        displayUserEmail.classList.add('displayuser-email');
                        displayUserEmail.textContent = user.email;
                
                        displayUserInfo.appendChild(displayUserName);
                        displayUserInfo.appendChild(displayUserEmail);
                
                        displayUser.appendChild(displayUserPic);
                        displayUser.appendChild(displayUserInfo);
                
                        displayAllUsers.appendChild(displayUser);               
                        displayUser.addEventListener("click", function(e) { 
                            let roomId = user.email;
                            document.querySelector('.display-alluser').style.display = 'none';
                            document.querySelector('.Docbox').style.display ='flex';
                            document.querySelector(".Docname span").textContent =  'Doc name';
                            document.querySelector("#collaborative-div").innerHTML = "";
                            document.querySelector('.chatbox').style.display = 'block';
                            document.querySelector(".chatname span").textContent =  'Chat name';
                            socket.emit("create room", roomId, userData.email, userData.name, userData.pic, function (roomId) {
                                console.log("Created room: " + roomId+userData.email);
                            });
                        });
                        
                    }
                    })
                    .catch(error => {
                    console.error('Error:', error);
                    });
                }
                loadUser();
                debounceTimer = null;
            }, 1000);
        } else {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                loadUser();
                debounceTimer = null;
            }, 1000);
        }    
    });
    

    // 右上角顯示allchat或是alldoc
    document.querySelector('.allDoc').addEventListener('click', function() {
        document.querySelector('.Docbox').style.display = 'flex';
        // 定義 debounceTimer 變量
        let debounceTimer = null;
        // 添加防抖邏輯
        if (!debounceTimer) {
            debounceTimer = setTimeout(function() {
                document.querySelector('.introducebox').style.display = 'none'
                document.querySelector('.display-alluser').style.display = 'none';
                document.querySelector('.history-room-chat').style.display = 'none';
                document.querySelector('.chatbox').style.display = 'none';
                document.querySelector('.history-room-doc').style.display = 'block';
                document.querySelector("#collaborative-div").innerHTML = "";
                document.querySelector(".Docname span").textContent =  'Doc name';
                // 防止重新讀取時，重複讀取的問題，在重新讀取時選取所有舊的 allDoc 區塊，並刪除它們，再去讀取新的
                async function removeHistoryDocs() {
                    let historydocs = document.querySelectorAll('.history-doc');
                    if (historydocs.length !== 0) {
                        historydocs.forEach(function(historydoc) {
                            historydoc.remove();
                        });
                    };
                }
                async function loadCollaborativeRooms() {
                    await removeHistoryDocs();     
                    fetch('/api/getCollaborativeRoomsAPI', {
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
                        console.log(data);
                        if (data.error) {
                            // 若有錯誤，則顯示錯誤訊息
                            console.log(data.error);
                        } else {
                            const historyRoomDoc = document.querySelector('.history-room-doc');
                            const today = new Date();
                            const docrooms = data.docrooms;
                            for (let i = 0; i < docrooms.length; i++) {
                                const historyDoc = document.createElement('div');
                                historyDoc.classList.add('history-doc');
                                historyDoc.setAttribute('data-roomid', docrooms[i]._id);
                                historyDoc.addEventListener('click', function() {
                                    const currentRoom = this.getAttribute('data-roomid');
                                    fetch('/api/getCollaborativeTextSchemasAPI', {
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
                                        console.log(data)
                                        document.querySelector("#collaborative-div").innerHTML = data.docrooms[0].content;
                                        document.querySelector(".Docname span").textContent = data.docrooms[0].roomName;
                                    
                                        // 找到最新的 CollaborativeTextStyleSchema
                                        const collaborativeTextStyle = data.collaborativeTextStyle;
                                        const fontColor = collaborativeTextStyle.color;
                                        const fontSize = collaborativeTextStyle.fontSize;
                                        document.querySelector("#collaborative-div").style.setProperty("--text-color", fontColor);
                                        document.querySelector("#collaborative-div").style.setProperty("--text-size", fontSize);
                                    
                                        // 找到所有的 img，並註冊滑鼠事件
                                        const imgs = collaborativeDiv.querySelectorAll("img");
                                        imgs.forEach(img => {
                                            img.addEventListener("wheel", (event) => {
                                                event.preventDefault();
                                                const imgDiv = img.closest(".img-div");
                                                const scale = parseFloat(imgDiv.style.transform.split("(")[1]) || 1;
                                                const delta = event.deltaY > 0 ? 0.1 : -0.1;
                                                imgDiv.style.transform = `scale(${scale + delta})`;
                                                socket.emit("img-style-change", {
                                                    elementId: img.id,
                                                    transform: imgDiv.style.transform
                                                });
                                                // 傳送圖片縮放事件到後端
                                                socket.emit("img-scale-change", img.id, scale + delta, currentRoom);
                                            });
                                        });
                                    })
                                    .catch(error => {
                                        console.error(error);
                                    });
                                });
                                
                                
                                const historyDocPic = document.createElement('div');
                                historyDocPic.classList.add('history-doc-pic');
                                const historyDocImg = document.createElement('img');
                                historyDocImg.src = "/icon/user/alldoc.png";
                                historyDocImg.alt = "history-doc-img";
                                historyDocImg.classList.add('history-doc-img');
                                historyDocPic.appendChild(historyDocImg);
                    
                                const historyDocInfo = document.createElement('div');
                                historyDocInfo.classList.add('history-doc-info');
                                const historyDocName = document.createElement('div');
                                historyDocName.classList.add('history-doc-name');
                                historyDocName.textContent = docrooms[i].roomName;
                                historyDocInfo.appendChild(historyDocName);
                    
                                const historyDocLasttime = document.createElement('div');
                                historyDocLasttime.classList.add('history-doc-lasttime');
                                const lastcreatedAt = new Date(docrooms[i].lastcreatedAt);
                                if (lastcreatedAt.getDate() === today.getDate() && lastcreatedAt.getMonth() === today.getMonth() && lastcreatedAt.getFullYear() === today.getFullYear()) {
                                    historyDocLasttime.textContent = lastcreatedAt.getHours() + ":" + lastcreatedAt.getMinutes();
                                } else {
                                    historyDocLasttime.textContent = (lastcreatedAt.getMonth() + 1) + "/" + lastcreatedAt.getDate();
                                }
                    
                                const deleteIcon = document.createElement('div');
                                deleteIcon.classList.add('delete-icon');
                                const deleteIconImg = document.createElement('img');
                                deleteIconImg.src ='/icon/user/trashcan.png';
                                deleteIconImg.alt = 'delete-icon';
                                deleteIcon.appendChild(deleteIconImg);

                                // 新增 deleteIcon click 事件
                                deleteIcon.addEventListener("click", function(e) {
                                    let roomId = data.docrooms[i]._id;
                                    e.stopPropagation(); // 避免事件冒泡
                                    if (window.confirm("Are you sure you want to delete this Document?")) {
                                        fetch('/api/deleteDocroomAPI', {
                                            method: 'DELETE',
                                            headers: {
                                                'Authorization': localStorage.getItem('token'),
                                                'Content-Type': 'application/json',
                                                'currentroom':roomId ,
                                            }
                                        })
                                        .then(response => {
                                            if (response.ok) {
                                                // 刪除成功
                                                console.log('Docroom deleted.');
                                                // 找到被點選的區塊的父元素，並刪除
                                                const historydocElement = deleteIcon.closest('.history-doc');
                                                historydocElement.parentNode.removeChild(historydocElement);
                                            } else {
                                                // 刪除失敗
                                                console.log('Docroom deletion failed.');
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error:', error);
                                        });
                                    }
                                });

                                historyDoc.appendChild(historyDocPic);
                                historyDoc.appendChild(historyDocInfo);
                                historyDoc.appendChild(historyDocLasttime);
                                historyDoc.appendChild(deleteIcon);
                        
                                historyRoomDoc.appendChild(historyDoc);
                            }
                        }
                    });
                }
                loadCollaborativeRooms();
                debounceTimer = null;
            }, 1000);
        } else {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                loadHistoryrooms();
                debounceTimer = null;
            }, 1000);
        }    
    });
    
    document.querySelector('.allChat').addEventListener('click', function() {
        document.querySelector('.Docbox').style.display = 'flex';
        // 定義 debounceTimer 變量
        let debounceTimer = null;
    
        // 添加防抖邏輯 // 防止重新讀取時，重複讀取的問題，在重新讀取時選取所有舊的 history-message 區塊，並刪除它們，再去讀取新的
        if (!debounceTimer) {
            debounceTimer = setTimeout(function() {
                document.querySelector('.introducebox').style.display = 'none'
                document.querySelector('.display-alluser').style.display = 'none';
                document.querySelector('.history-room-doc').style.display = 'none';
                document.querySelector('.chatbox').style.display = 'none';
                document.querySelector('.history-room-chat').style.display = 'block';
                document.querySelector("#collaborative-div").innerHTML = "";
                document.querySelector(".Docname span").textContent =  'Doc name';
                async function removeHistoryMessages() {
                    let historyMessages = document.querySelectorAll('.history-message');
                    if (historyMessages.length !== 0) {
                        historyMessages.forEach(function(historyMessage) {
                            historyMessage.remove();
                        })
                    };
                }
            // 點選allchat就顯示歷史訊息的room
                async function loadHistoryrooms() {
                    await removeHistoryMessages();
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
                        let chatrooms = data.chatrooms;
                        let historyRoomChat = document.querySelector('.history-room-chat');
                        for (let i = 0; i < chatrooms.length; i++) {
                            let chatroom = chatrooms[i];
                            let historyMessage = document.createElement('div');

                            // 按下每個歷史訊息的框框
                            historyMessage.addEventListener("click", function() {
                                document.querySelector('.history-room-chat').style.display = 'none';
                                document.querySelector('.chatbox').style.display = 'block';
                                // document.querySelector("#collaborative-textarea").value = "";
                                document.querySelector("#collaborative-div").innerHTML = "";
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
                                    let chatroomsMessage= data.chatrooms
                                    document.querySelector(".chatname span").textContent = data.roomName;
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
                                            console.log(data)
                                            if (chatroom.email === data.email) {
                                                if (chatroom.img == ""){
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
                                                    <div class="message-avatar">
                                                        <img src="${chatroom.userpic}" alt="User Avatar">
                                                    </div>
                                                    <div class="pic-content">
                                                        <span class="message-content-name" >${chatroom.name}</span>
                                                        <br>
                                                        <img src="${chatroom.img}" class="message-content-text"> 
                                                    </div>
                                                    <div class="message-content-time">${time}</div>
                                                     `;
                                                }
                                            
                                            } else {
                                                if (chatroom.img == ""){
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
                                                } else {
                                                    messageLi.innerHTML = ` 
                                                    <div class="message-right">
                                                        <div class="message-content-time-right">${time}</div>
                                                        <div class="pic-content-right">
                                                            <span class="message-content-name-right" >${chatroom.name}</span>
                                                            <br>
                                                            <img src="${chatroom.img}" class="message-content-text-right"> 
                                                        </div>
                                                        <div class="message-avatar-right">
                                                            <img src="${chatroom.userpic}" alt="User Avatar">
                                                        </div>
                                                    </div>
                                                `;
                                                }
                                            }
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });                              
                                        // 將 li 加入 messages 元素中
                                        document.querySelector("#messages").appendChild(messageLi);
                                    })
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                });
                                //左邊顯示這個對話的共同文件
                                fetch('/api/getCollaborativeTextSchemasAPI', {
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
                                    console.log(data)                               
                                    document.querySelector("#collaborative-div").innerHTML = data.docrooms[0].content;
                                    document.querySelector(".Docname span").textContent = data.docrooms[0].roomName;
                                
                                    // 找到最新的 CollaborativeTextStyleSchema
                                    const collaborativeTextStyle = data.collaborativeTextStyle;
                                    const fontColor = collaborativeTextStyle.color;
                                    const fontSize = collaborativeTextStyle.fontSize;
                                    document.querySelector("#collaborative-div").style.setProperty("--text-color", fontColor);
                                    document.querySelector("#collaborative-div").style.setProperty("--text-size", fontSize);
                                
                                    // 找到所有的 img，並註冊滑鼠事件
                                    const imgs = collaborativeDiv.querySelectorAll("img");
                                    imgs.forEach(img => {
                                        img.addEventListener("wheel", (event) => {
                                            event.preventDefault();
                                            const imgDiv = img.closest(".img-div");
                                            const scale = parseFloat(imgDiv.style.transform.split("(")[1]) || 1;
                                            const delta = event.deltaY > 0 ? 0.1 : -0.1;
                                            imgDiv.style.transform = `scale(${scale + delta})`;
                                            socket.emit("img-style-change", {
                                                elementId: img.id,
                                                transform: imgDiv.style.transform
                                            });
                                            // 傳送圖片縮放事件到後端
                                            socket.emit("img-scale-change", img.id, scale + delta, currentRoom);
                                        });
                                    });
                                })
                                .catch(error => {
                                    console.error(error);
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
                            historyMessageLastMessage.innerHTML = chatroom.messages.text.substring(0, 20);
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

                            // 新增 deleteIcon click 事件
                            deleteIcon.addEventListener("click", function(e) {
                                let roomId = chatroom._id;
                                e.stopPropagation(); // 避免事件冒泡
                                if (window.confirm("Are you sure you want to delete this chat ?")) {
                                    fetch('/api/deleteChatroomAPI', {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': localStorage.getItem('token'),
                                            'Content-Type': 'application/json',
                                            'currentroom':roomId ,
                                        }
                                    })
                                    .then(response => {
                                        if (response.ok) {
                                            // 刪除成功
                                            console.log('Chatroom deleted.');
                                            // 找到被點選的區塊的父元素，並刪除
                                            const historymessageElement = deleteIcon.closest('.history-message');
                                            historymessageElement.parentNode.removeChild(historymessageElement);
                                        } else {
                                            // 刪除失敗
                                            console.log('Chatroom deletion failed.');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                    });
                                }
                            });
                            historyMessage.appendChild(deleteIcon);
                            historyRoomChat.appendChild(historyMessage);
                                

                            if (chatroom.emails.length === 1) {
                                let email = chatroom.emails[0];
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
                            if (chatroom.emails.length > 1 ){ 
                                historyMessageImg.src = "/icon/user/groups.png";
                                if (chatroom.messages.roomName != "Chat Name" ){ 
                                    historyMessageName.innerText = chatroom.roomName;
                                }
                                else{
                                    historyMessageName.innerText = "Chat Name";    
                                }

                            }
                            else{
                                historyMessageImg.src = "/icon/user/groups.png";
                                historyMessageName.innerText = "Chat Name";    
                            }
                        }
                    }) 
                    .catch(error => {
                        console.error('Error:', error);
                    })
                }
                loadHistoryrooms()
                debounceTimer = null;
            }, 1000);
        } else {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                loadHistoryrooms();
                debounceTimer = null;
            }, 1000);
        } 
    });  
    
}