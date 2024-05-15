export function adduserinit(){
// chat邊點擊加入用戶
    var Chatadduser = document.querySelector('.adduser-icon1');
    Chatadduser.addEventListener("click", function() {
        const chatboxsearch = document.querySelector(".chatbox-search");
        chatboxsearch.style.display = "flex";
        document.getElementById("adduser-icon1").src = "/icon/user/close.png";
        document.getElementById("adduser-icon1").onclick = function() {cancle()};
    }); 
// Doc邊點擊加入用戶
    var Docadduser = document.querySelector('.adduser-icon2');
    Docadduser.addEventListener("click", function() {
        const Docboxsearch = document.querySelector(".Docbox-search");
        Docboxsearch.style.display = "flex";
        document.getElementById("adduser-icon2").src = "/icon/user/close.png";
        document.getElementById("adduser-icon2").onclick = function() {cancle()};
    });

// Doc+chat點擊取消
    function cancle(){
        const Docboxsearch = document.querySelector(".Docbox-search");
        const chatboxsearch = document.querySelector(".chatbox-search");
        const resultBox = document.querySelector(".Docbox-search-result-box"); 
        const noresultBox = document.querySelector(".noDocbox-search-result-box");
        Docboxsearch.style.display = "none";
        chatboxsearch.style.display = "none";
        resultBox.style.display = "none";
        noresultBox.style.display = "none";
        document.getElementById("adduser-icon1").src = "/icon/user/adduser.png";
        document.getElementById("adduser-icon2").src = "/icon/user/adduser.png";
        document.getElementById("adduser-icon1").onclick =  null;
        document.getElementById("adduser-icon2").onclick =  null;
    };
// chat點擊加入用戶並搜尋用戶是否存在
    var addusearchuserChat = document.querySelector('.addusearchuserChat');
    addusearchuserChat.addEventListener("click", async function() {
        const email = document.getElementById("chatbox-emailInput").value;
        const headers = {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
        };
        const response = await fetch(`/api/searchemail?email=${email}`, { headers });
        const data = await response.json();
        const chatresultBox = document.querySelector(".chatbox-search-result-box");
        const nochatnoresultBox = document.querySelector(".nochatbox-search-result-box");
        if(data.success==true){
            nochatnoresultBox.style.display = "none";
            chatresultBox.style.display = "flex";
            document.querySelector('.chatbox-searchpicimg').src = data.pic;
            document.querySelector('.chatbox-searchname').innerText = data.name;
            document.querySelector('.chatbox-searchemail').innerText = data.email;
        }else{
            chatresultBox.style.display = "none";
            nochatnoresultBox.style.display = "flex";
        }
        // 设置 mouseout 事件
        chatresultBox.addEventListener("mouseleave", function() {
            chatresultBox.style.display = "none";
        });
        nochatnoresultBox.addEventListener("mouseleave", function() {
            nochatnoresultBox.style.display = "none";
        });
    })

// Doc點擊加入用戶並搜尋用戶是否存在
    var addusearchuserDoc = document.querySelector('.addusearchuserDoc');
    addusearchuserDoc.addEventListener("click", async function() {
        document.querySelector('.Docboxfilter').style.display = "flex";
        const email = document.getElementById("Docbox-emailInput").value;
        const headers = {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
        };
        const response = await fetch(`/api/searchemail?email=${email}`, { headers });
        const data = await response.json();
        const docresultBox = document.querySelector(".Docbox-search-result-box");
        const nodocnoresultBox = document.querySelector(".noDocbox-search-result-box");
        if(data.success==true){
            nodocnoresultBox.style.display = "none";
            docresultBox.style.display = "flex";
            document.querySelector('.Docbox-searchpicimg').src = data.pic;
            document.querySelector('.Docbox-searchname').innerText = data.name;
            document.querySelector('.Docbox-searchemail').innerText = data.email;
        }else{
            docresultBox .style.display = "none";
            nodocnoresultBox.style.display = "flex";
        }
        // 设置 mouseout 事件
        docresultBox.addEventListener("mouseleave", function() {
            docresultBox.style.display = "none";
            document.querySelector('.Docboxfilter').style.display = "none";
        });
        nodocnoresultBox.addEventListener("mouseleave", function() {
            nodocnoresultBox.style.display = "none";
            document.querySelector('.Docboxfilter').style.display = "none";
        }); 
    })
// 關閉搜尋用戶視窗
    const DoccloseIcon = document.querySelector(".Docbox-close-icon");
    DoccloseIcon.addEventListener("click", function() {
        const resultBox = document.querySelector(".Docbox-search-result-box");  
        resultBox.style.display = "none";
        document.querySelector('.Docboxfilter').style.display = "none";
    });
    const nocDocloseIcon = document.querySelector(".noDocbox-close-icon");
    nocDocloseIcon.addEventListener("click", function() {
        const noresultBox = document.querySelector(".noDocbox-search-result-box");
        noresultBox.style.display = "none";
        document.querySelector('.Docboxfilter').style.display = "none";
    });
    const chatcloseIcon = document.querySelector(".chatbox-close-icon");
    chatcloseIcon.addEventListener("click", function() {
        const resultBox = document.querySelector(".chatbox-search-result-box");  
        resultBox.style.display = "none";
    });
    const nocchatcloseIcon = document.querySelector(".nochatbox-close-icon");
    nocchatcloseIcon.addEventListener("click", function() {
        const noresultBox = document.querySelector(".nochatbox-search-result-box");
        noresultBox.style.display = "none";
    });
}
