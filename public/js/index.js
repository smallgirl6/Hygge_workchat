let socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userData = {};
let currentRoom = "";
let currentRoomName = "";


// 創建新的對話
document.querySelector('.creat-new-chat').addEventListener('click', function() {
  currentRoom = "";
  currentRoomName = "";
  document.querySelector('.history-room-chat').style.display = 'none';
  document.querySelector('.chatbox').style.display = 'block';
  document.querySelector("#collaborative-div").innerHTML = "";
  // 清除 messages 內的所有 li
  document.querySelector("#messages").innerHTML = "";
  document.querySelector(".chatname span").textContent =  'Chat name';
  document.querySelector(".Docname span").textContent =  'Doc name';
});

// 創建新的記事本
document.querySelector('.creat-new-doc').addEventListener('click', function() {
    currentRoom = "";
    currentRoomName = "";
    document.querySelector('.history-room-doc').style.display = 'none';
    document.querySelector('.chatbox').style.display = 'none';
    document.querySelector('.history-room-chat').style.display = 'none';
    document.querySelector(".Docname span").textContent =  'Doc name';
    document.querySelector("#collaborative-div").innerHTML = "";

});



// 把自己的訊息放在前端以及傳到後端的
    // email地址設置為identifier
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
    const chatbox_search_result_box = document.querySelector(".chatbox-search-result-box");
    chatbox_search_result_box .addEventListener("click", function (e) {
        const email = document.querySelector(".chatbox-searchemail").innerText;
        const roomId = email;
        // 檢查是否已經有對應的房間存在
        console.log("currentRoom is " + currentRoom)
        console.log("email is " +email)

        if (currentRoom == "") {
            if (email === "AI") {
                // 加入 AI 的ROOM
                currentRoom = userData.email+" with ai-chatroom";
                socket.emit("join room", userData.email+" with ai-chatroom", userData.email);
            }
            else{
        // 不存在房間，建立新的房間
                socket.emit("create room", roomId, userData.email, userData.name, userData.pic, function (roomId) {
                console.log("Created room: " + roomId );
                })
            };
        } 
        else {
        // 已經存在房間，不需要再建立房間，直接發送使用者加入房間的事件
            socket.emit("add to current room", currentRoom, email, userData.email, userData.name, userData.pic);
            console.log("Want to add " + email + " to " + currentRoom);
        };
    });
    // 點擊FINDUSER的AI
    const displayAI = document.querySelector('.displayAI');

    displayAI.addEventListener('click', function() {
        document.querySelector('.display-alluser').style.display = 'none';
        document.querySelector('.Docbox').style.display = 'flex';
        document.querySelector('.chatbox').style.display = 'block';
        document.querySelector(".Docname span").textContent = 'Doc name';
        document.querySelector("#collaborative-div").innerHTML = "";
        document.querySelector(".chatname span").textContent = 'Chat name';
        currentRoom = userData.email + " with ai-chatroom";
        socket.emit("join room", userData.email+" with ai-chatroom", userData.email);
    });

////////////////////////////////////////////////////文件部分////////////////////////////////////////////////////////////////////////////////

//邀請朋友編輯文件
// 點擊Docbox-search-result-box(搜尋到的使用者)後把此用者的電子信箱傳給 socket，在線上就做編輯文件房間
const Docbox_search_result_box = document.querySelector(".Docbox-search-result-box");
Docbox_search_result_box.addEventListener("click", function (e) {
    const email = document.querySelector(".Docbox-searchemail").innerText;
    const roomId = email;
    console.log(roomId)
    document.querySelector('.introducebox').style.display = 'none'
    document.querySelector('.history-room-doc').style.display = 'none';
    document.querySelector('.history-room-chat').style.display = 'none';
    document.querySelector('.chatbox').style.display = 'block';

    if (currentRoom == "") {
        socket.emit("create room", roomId, userData.email, userData.name, userData.pic, function (roomId) {
            console.log("Created room: " + roomId );;
        });
    }
    else {
        // 已經存在房間，不需要再建立房間，直接發送使用者加入房間的事件
        socket.emit("add to current room", currentRoom, email, userData.email, userData.name, userData.pic);
        console.log("Want to add " + email + " to " + currentRoom);
    }
});
    socket.on("Created room for offline user", async function (roomid, roomId)  {
        const email = roomid
        const headers = {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
        };
        const response = await fetch(`/api/searchemail?email=${email}`, { headers });
        const data = await response.json();
        if(data.success==true){
            let userpic = data.pic;
            let usename  = data.name;
            let useremail  = data.email;
            //當使用者成功加入房間時，被加入的使用者向房間內的所有使用者發送一條通知訊息，讓他們知道有新使用者加入
            socket.emit("chat message form offline user", "Add  "+ usename + " to this room ", usename , userpic, useremail, roomId);     
            
            // 得到房間ID後把取出房間名字再存入資料庫
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
                document.querySelector("#collaborative-div").innerHTML = "";
                document.querySelector("#collaborative-div").innerHTML = data.docrooms[0].content;
                if(data.roomName == ""){
                    socket.emit("document permission", useremail,roomId,'Doc name');
                }else{    
                    socket.emit("document permission", useremail,roomId,data.docrooms[0].roomName)
                } 
                
            })
            .catch(error => {
                console.error('Error:', error);
                socket.emit("document permission", useremail,roomId,'Doc name');
            });
             
        }
        else{
            console.error('Error:', error);
        } 
    });

// 對方會從服務器收到房間的消息(在進入房間內對方會先出現通知)
    socket.on("room created to user", function (roomId,email,name,pic)  {
        console.log("Received room-created event: ", roomId);
        currentRoom = roomId;
        document.querySelector(".chatNotification").style.display = "flex";
        document.querySelector(".chatbox-Notification-box").style.display = "block";
        document.querySelector(".chatbox-Notificationimg").src = pic;
        document.querySelector(".chatbox-Notificationname").innerText = name +" sent you a message.";
        document.querySelector(".chatbox-Notificationemail").innerText = email;
    // 對方點擊通知才會進入房間
        document.querySelector(".chatbox-Notification-box").addEventListener("click", function () {
            document.querySelector('.Docbox').style.display ='flex';
            document.querySelector('.chatbox').style.display = 'none';
            document.querySelector('.display-alluser').style.display = 'none';
            document.querySelector('.history-room-doc').style.display = 'none';
            document.querySelector('.introducebox').style.display = 'none';
            document.querySelector('.chatbox').style.display = 'block';
            document.querySelector("#collaborative-div").innerHTML = "";
            // 清除 messages 內的所有 li
            document.querySelector("#messages").innerHTML = "";         
            socket.emit("join room", currentRoom,userData.email);
            document.querySelector(".chatNotification").style.display = "none";
            document.querySelector(".chatbox-Notification-box").style.display = "none";
            
            // 在加入房間後顯示過去訊息
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
                console.log(data.roomName)
                if(data.roomName == "" || data.roomName == "Doc name" ){
                    document.querySelector(".chatname span").textContent =  'Chat name';
                }else{    
                    currentRoomName = data.roomName;
                    document.querySelector(".chatname span").textContent = data.roomName;
                }       
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
                    // 將 li 加入 messages 元素中
                    document.querySelector("#messages").appendChild(messageLi);
                })
                // //當使用者成功加入房間時，向房間內的所有使用者發送一條通知訊息，讓他們知道有新使用者加入
                
            })
            .catch(error => {
                console.error('Error:', error);
            });
            // 在加入房間後顯示共同編輯文件
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
                document.querySelector("#collaborative-div").innerHTML = "";
                document.querySelector("#collaborative-div").innerHTML = data.docrooms[0].content;
  
                if(data.roomName == ""){
                    document.querySelector(".Docname span").textContent =  'Docname';
                }else{    
                    currentRoomName = data.docrooms[0].roomName;
                    document.querySelector(".Docname span").textContent = data.docrooms[0].roomName;
                } 
                
            })
            .catch(error => {
                console.error('Error:', error);
            });

        })
    });

// 從服務器收到房間的消息(自己則會馬上進入房間)
    socket.on("room created to me", function (roomId)  {
        console.log("Received room-created event: ", roomId);
        document.querySelector("#messages").innerHTML = "";
        // document.querySelector("#collaborative-textarea").value = "";
        document.querySelector("#collaborative-div").innerHTML = "";
        document.querySelector(".chatname span").textContent =  'Chat name';
        document.querySelector(".Docname span").textContent = "Doc name";
        socket.emit("join room", roomId,userData.email);
        currentRoom = roomId;
        // 當使用者成功加入房間時，向房間內的所有使用者發送一條通知訊息，讓他們知道有新使用者加入
        socket.emit("chat message", userData.name+ "  created this the room", userData.name, userData.pic, userData.email, currentRoom, "chatgptimg");
        currentRoomName = "Doc name";
        socket.emit("document permission", userData.email,currentRoom,currentRoomName);    
        // collaborativeDiv.addEventListener("input", () => {
        //     const content = collaborativeDiv.innerHTML;
        //     socket.emit("div-change", content, currentRoom, userData.email);
        // });
        // 將文字區域內的文字保存到資料庫
        // socket.emit("save content", userData.email, currentRoom, content,currentRoomName);  
        // const elements = collaborativeDiv.querySelectorAll("*");
        // const textElements = [];
        // const imgElements = [];

        // elements.forEach((el) => {
        // if (el.tagName === "IMG") {
        //     imgElements.push(el);
        // } else {
        //     textElements.push(el);
        // }
        // });
        // // 處理文字元素的屬性值
        // textElements.forEach((el) => {
        //     const style = window.getComputedStyle(el);
        //     const fontSize = style.getPropertyValue("font-size");
        //     const color = style.getPropertyValue("color");
        //     // 將文字的屬性值傳遞給後端
        //     socket.emit("text-style-change", {
        //     elementId: el.id,
        //     fontSize: fontSize,
        //     color: color,
        //     });
        // });
        
        // 處理圖片元素的屬性值
        // imgElements.forEach((el) => {
        //     const style = window.getComputedStyle(el);
        //     const transform = style.getPropertyValue("transform");
        //     // 將圖片的屬性值傳遞給後端
        //     socket.emit("img-style-change", {
        //     elementId: el.id,
        //     transform: transform,
        //     });
        // });      
        
    });

// 按下submit後圖片會傳到後端
    const uploadButton = document.getElementById("uploadButton");
    const fileInput = document.getElementById("fileInput");
    const inputField = document.getElementById('input');
    const inputText = document.getElementById('inputtext');
    const messagesbox = document.getElementById('messagesbox');
    const sendButton = document.querySelector('.sendButton');
    const Uploadimg = document.querySelector('.Uploadimg');

    let imgTag;
    let isImageUploaded = false;

    uploadButton.addEventListener("click", function() {
        fileInput.click();
    });

   
    fileInput.addEventListener('change', (event) => {
        if (!isImageUploaded) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const base64Image = e.target.result;
                inputText.style.display = 'none';
                messagesbox.style.height = '60%';
                form.style.height = '30%';
                uploadButton.style.height = '201px';
                sendButton.style.height = '201px';
                Uploadimg.style.height  = '20%';
                imgTag = document.createElement('img');
                imgTag.src = base64Image;
                imgTag.style.maxWidth = '100%';
                imgTag.style.maxHeight = '200px'; // 設置圖片的最大高度，以避免影響版面
                inputField.value = ''; // 清空輸入框
                // inputField.dataset.file = base64Image; // 保存圖片的base64編碼數據到data屬性中
                inputText.after(imgTag); // 在輸入框後插入圖片
                isImageUploaded = true;
            };
        } else {
            alert('You can only upload one image.');
        }
    });


    // 按下submit後訊息會傳到後端
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        
        if (isImageUploaded) {
            // 傳送圖片
            const fileData = imgTag.src;
            if (fileData) {
                socket.emit('send image', fileData, userData.name, userData.pic, userData.email, currentRoom);
                inputField.value = ''; // 重置輸入框
                inputText.style.display = 'block';
                messagesbox.style.height = '80%';
                form.style.height = '10%';
                uploadButton.style.height = '53px';
                sendButton.style.height = '53px';
                Uploadimg.style.height  = '100%';
                imgTag.remove();
                isImageUploaded = false;
            }
        } else {
            // 傳送純文本消息
            const message = inputField.value.trim();
            if (message !== '') {
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
                    const email = data.email;
                    const pic = data.pic;
                    const name = data.name;
                    const chatgptimg ="https://d2ot6xgmrc7iso.cloudfront.net/upload/OPENAI.jpg"
                    socket.emit("chat message", message, name, pic, email, currentRoom, chatgptimg);
                    inputField.value = '';
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
    });
// 對話訊息的右側(對方)
    socket.on("chat message user", function (msg, name, email, pic, roomId) {
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
        // 計算文字的寬度
        const messageContent = messageLi.querySelector(".message-content-right");
        messageContent.style.display = "inline-block";
        const nameWidth = messageLi.querySelector(".message-content-name-right").offsetWidth;
        const textWidth = messageLi.querySelector(".message-content-text-right").offsetWidth;
        messageContent.style.display = "";

        // 根據閾值設定寬度
        const threshold = 400;
        if (Math.max(nameWidth, textWidth ) > threshold) {
            messageContent.style.width = threshold + "px";
        } else {
            messageContent.style.width = Math.max(nameWidth, textWidth) + "px";
        }
        
    });

    socket.on("chat pic user", function (imageURL, name, email, pic, roomId) {
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
                <div class="pic-content-right">
                    <span class="message-content-name-right" >${name}</span>
                    <br>
                    <img src="${imageURL}" class="message-content-text-right"> 
                </div>
                <div class="message-avatar-right">
                    <img src="${pic}" alt="User Avatar">
                </div>
            </div>
        `;
        messages.appendChild(messageLi);
        const messagesContainer = document.getElementById("messagesbox");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;   
    });
    // 對話訊息的右側(對方)
    socket.on("chat message form offline user and AI", function (msg, name, email, pic, roomId) {
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
        // 計算文字的寬度
        const messageContent = messageLi.querySelector(".message-content-right");
        messageContent.style.display = "inline-block";
        const nameWidth = messageLi.querySelector(".message-content-name-right").offsetWidth;
        const textWidth = messageLi.querySelector(".message-content-text-right").offsetWidth;
        messageContent.style.display = "";

        // 根據閾值設定寬度
        const threshold = 400;
        if (Math.max(nameWidth, textWidth ) > threshold) {
            messageContent.style.width = threshold + "px";
        } else {
            messageContent.style.width = Math.max(nameWidth, textWidth) + "px";
        }
        let imageURL = ""
        socket.emit("save message",email, roomId, msg,imageURL, time, email,currentRoomName);
        
    });

// 對話訊息的左側(自己)
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
        // 計算文字的寬度
        const messageContent = messageLi.querySelector(".message-content");
        messageContent.style.display = "inline-block";
        const nameWidth = messageLi.querySelector(".message-content-name").offsetWidth;
        const textWidth = messageLi.querySelector(".message-content-text").offsetWidth;
        messageContent.style.display = "";

        // 根據閾值設定寬度
        const threshold = 400;
        if (Math.max(nameWidth, textWidth ) > threshold) {
            messageContent.style.width = threshold + "px";
        } else {
            messageContent.style.width = Math.max(nameWidth, textWidth) + "px";
        }
        let imageURL = ""
        console.log(email, roomName, msg, time, email)
        socket.emit("save message",email, roomName, msg,imageURL, time, email,currentRoomName);
        
    });
    // 對話訊息的左側(自己)
    socket.on("chat pic me", function (imageURL, name, email, pic, roomName) {
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
            <div class="pic-content">
                <span class="message-content-name" >${name}</span>
                <br>
                <img src="${imageURL}" class="message-content-text"> 
            </div>
            <div class="message-content-time">${time}</div>
        `;
        messages.appendChild(messageLi);
        const messagesContainer = document.getElementById("messagesbox");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        let msg = ""
        console.log(email, roomName, imageURL, time, email)
        socket.emit("save message",email, roomName, msg,imageURL, time, email,currentRoomName);
        
    });

     // 共同編輯文件的部分
   
    const collaborativeDiv = document.querySelector("#collaborative-div")    

    // 文字大小
    const changesize = document.querySelector(".change-text-style-size");
    // const sizeselect= document.querySelector(".size-select");
    const sizeSelect = document.querySelector("#size-select");
    changesize.addEventListener("click", () => {
        sizeSelect.style.display="block";
    });
    sizeSelect.addEventListener("change", () => {
        collaborativeDiv.style.setProperty("--text-size", sizeSelect.value);
        socket.emit("font-size-change", sizeSelect.value, currentRoom);
        socket.emit("text-style-change", {
            elementId: collaborativeDiv.id,
            fontSize: sizeSelect.value,
            color: null
        });
    });
    socket.on("font-size-change", (fontSize) => {
        collaborativeDiv.style.setProperty("--text-size", fontSize);
    });

    // 文字顏色
    const colorPicker = document.querySelector("#color-picker");
    colorPicker.addEventListener("input", () => {
        collaborativeDiv.style.setProperty("--text-color", colorPicker.value);
        socket.emit("font-color-change", colorPicker.value, currentRoom);
        socket.emit("text-style-change", {
            elementId: collaborativeDiv.id,
            fontSize: null,
            color: colorPicker.value
        });
    });
    socket.on("font-color-change", (fontColor) => {
        console.log("font-color-change");
        collaborativeDiv.style.setProperty("--text-color", fontColor);
    });


    // 上傳圖片
    const uploadpicBtn = document.querySelector("#change-text-style-uploadpic");
    const imageInput = document.querySelector("#change-text-style-uploadpic-Input");

    uploadpicBtn.addEventListener("click", () => {
        imageInput.click();
    });
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const imgDiv = document.createElement("div");
            imgDiv.classList.add("img-div");
            const img = document.createElement("img");
            const id = new Date().getTime();
            img.setAttribute("src", event.target.result);
            img.setAttribute("id", `img-${id}`);
            imgDiv.appendChild(img);
            collaborativeDiv.appendChild(imgDiv);
            socket.emit("doc image", event.target.result, currentRoom, `img-${id}`);
            
            // 接收從後端傳來的圖片網址
            socket.on("image-url", (url, roomid, imageId) => {
                console.log(imageId);
                console.log("image-url" + url);;
                const imgElement = document.querySelector(`#${imageId}`);
                console.log(imgElement);
                if (imgElement) {
                    imgElement.src = url;
                }
                socket.emit("img-url-save", { elementId: imageId, url: url });
            });
            
            // 縮放圖片
            imgDiv.style.transform = "scale(1)";
            
            // 監聽圖片的滑鼠事件
            imgDiv.addEventListener("wheel", (event) => {
                event.preventDefault();
                const scale = parseFloat(imgDiv.style.transform.split("(")[1]) || 1;
                const delta = event.deltaY > 0 ? 0.1 : -0.1;
                imgDiv.style.transform = `scale(${scale + delta})`;
                const imgElement = document.querySelector(`#img-${id}`);
                socket.emit("img-style-change", {
                    elementId: imgElement.id,
                    transform: imgDiv.style.transform
                });
                
                // 傳送圖片縮放事件到後端
                socket.emit("img-scale-change", id, scale + delta, currentRoom);
            });
        };
        reader.readAsDataURL(file);
    });

      // 接收從後端傳來的圖片縮放事件
    socket.on("img-scale-change", (id, scale) => {
        const imgDiv = document.querySelector(`#img-${id}`).parentElement;
        console.log(imgDiv)
        if (imgDiv) {
        imgDiv.style.transform = `scale(${scale})`;
        }
    });
    socket.on("div-change", (content) => {
        console.log("div-change")
        collaborativeDiv.innerHTML = content;
    });

    collaborativeDiv.addEventListener("input", () => {
        const content = collaborativeDiv.innerHTML;
        console.log(content)
        socket.emit("div-change", content, currentRoom, userData.email,currentRoomName);
    });

    
    // 獲取docname和chatname的DOM元素 修改DOC和CHATNAME
    document.querySelector('.chatnameimg').addEventListener('click', () => {
        const roomName = prompt('Please enter a new name for this room:');
        console.log(roomName);
        if (roomName) {
        const body = JSON.stringify({ roomName });
        fetch(`/api/changeDocNameAPI`, {
            method: 'PUT',
            headers: {
            'Authorization': localStorage.getItem('token'),
            'Content-Type': 'application/json',
            'currentroom': currentRoom,
            },
            body: body,
        })
            .then(response => response.json())
            .then(data => {
            console.log(data.roomName);
            currentRoomName = data.roomName;
            // 將更改後的房間名稱廣播給房間中的其他使用者
            socket.emit("change room name", currentRoom, roomName);
            // 更改當前客戶端的房間名稱
            document.querySelectorAll(".chatname span, .Docname span").forEach(span => {
                span.textContent = roomName;
            });
            })
            .catch(error => {
            console.error('Error:', error);
            });
        }
    });
    
  document.querySelector('.Docnameimg').addEventListener('click', () => {
    const roomName = prompt('Please enter a new name for this room:');
    console.log(roomName);
    if (roomName) {
      const body = JSON.stringify({ roomName });
      fetch(`/api/changeDocNameAPI`, {
        method: 'PUT',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json',
          'currentroom': currentRoom,
        },
        body: body,
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          currentRoomName = data.value;
          // 將更改後的房間名稱廣播給房間中的其他使用者
          socket.emit("change room name", currentRoom, roomName);
          // 更改當前客戶端的房間名稱
          document.querySelectorAll(".chatname span, .Docname span").forEach(span => {
            span.textContent = roomName;
          });
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });
  // 監聽房間名稱變更事件
    socket.on("room name changed", function (roomName) {
        document.querySelectorAll(".chatname span, .Docname span").forEach(span => {
        span.textContent = roomName;
        });
    }); 



