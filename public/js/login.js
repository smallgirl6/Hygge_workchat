// 右上導覽切換login以及signup畫面
function switchImage(type) {
    const signupmessage = document.querySelector('.signup-message');
    const loginmessage = document.querySelector('.login-message');
    signupmessage.innerText = '';
    loginmessage.innerText = '';
    if (type === 'login') {
        document.querySelector('.background-image-login').style.display = 'block';
        document.querySelector('.background-image-signup').style.display = 'none';
    } else if (type === 'signup') {
        document.querySelector('.background-image-login').style.display = 'none';
        document.querySelector('.background-image-signup').style.display = 'block';
    }
}

// signup中左右箭頭讓圖片輪播
let images = ["/Image/userdefaultpic/puffin.png","/Image/userdefaultpic/sheep.png","/Image/userdefaultpic/horse.png","/Image/userdefaultpic/whale.png","/Image/userdefaultpic/fox.png","/Image/userdefaultpic/user.png"];
let i = -1;
let rightArrow = document.querySelector(".signup-rightarrow");
let leftArrow = document.querySelector(".signup-leftarrow");
let currentPic = document.querySelector(".current-pic");
let nextPic = document.querySelector(".next-pic");
let signup_input_upload = document.querySelector(".signup-input-upload");
let signup_input_img = document.querySelector(".signup-input-img");

rightArrow.addEventListener("click", function() {
    i = (i + 1) % images.length;
    nextPic.src = images[i];
    currentPic.classList.add("slideOutToLeft");
    nextPic.classList.add("slideInFromRight");
    document.querySelector(".signup-input-img").value = "";
   
});

leftArrow.addEventListener("click", function() {
    i = (i - 1 + images.length) % images.length;
    nextPic.src = images[i];
    nextPic.classList.add("slideInFromLeft");
    currentPic.classList.add("slideOutToRight");
    document.querySelector(".signup-input-img").value = "";
});

currentPic.addEventListener("animationend", function() {
    currentPic.classList.remove("slideOutToLeft");
    currentPic.classList.remove("slideOutToRight");
    currentPic.src = nextPic.src;
    let match = currentPic.src.match("user.png");
    if (match) {
        signup_input_upload.style.display = 'block';
    } else {
        signup_input_upload.style.display = 'none';
    }
    nextPic.src = "";
});

// 按clearButton清除選取的本地上傳圖片
const clearButton = document.querySelector('#clear-button');
clearButton.addEventListener('click', function() {
    signup_input_img.value = "";
});

// 將上傳的圖片顯示在 <img> 元素中
function displaySelectedImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.querySelector(".current-pic").src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
        }
        }
        document.querySelector(".signup-input-img").addEventListener("change", function () {
        displaySelectedImage(this);
        });
        document.querySelector("#clear-button").addEventListener("click", function () {
        document.querySelector(".signup-input-img").value = "";
        document.querySelector(".current-pic").src = "/Image/userdefaultpic/user.png";
    }
);

// fetech signup的API
const signupBtn = document.querySelector('.signup-button');
signupBtn.addEventListener('click', async (event) => {
    const signupmessage = document.querySelector('.signup-message');
    signupmessage.innerText = '';
    event.preventDefault();
    const uploadpic= document.querySelector('.signup-input-img').files[0]; 
    const defailtpic= document.querySelector('.current-pic').src;  
    let formData = new FormData();  //創建了一個新的 FormData 對象(表單數據)
    if (uploadpic ==null){
        formData.append('pic', defailtpic);
    }
    else{
        formData.append('pic', uploadpic);
    }
    const name = document.querySelector('input[name="signup_name"]').value;
    const email = document.querySelector('input[name="signup_email"]').value;
    const password = document.querySelector('input[name="signup_password"]').value;
    formData.append('name', name );
    formData.append('email', email); 
    formData.append('password', password); 
    console.log(formData)
    const res = await fetch('/api/signup', {
        method: 'POST',
        body: formData
    });
    const json = await res.json();
    if (json.success) {
        console.log('註冊成功');
        signupmessage.innerText = 'Registration Success';
        document.querySelector(".current-pic").src = "/Image/userdefaultpic/user.png";
    } else {
        console.log(json.message);
        signupmessage.innerText = json.message;
    }
    // 清空輸入欄位
    document.querySelector('input[name="signup_name"]').value = '';
    document.querySelector('input[name="signup_email"]').value = '';
    document.querySelector('input[name="signup_password"]').value = '';
    document.querySelector(".signup-input-img").value = "";
});

// fetech login的API 
const loginBtn = document.querySelector('.login-button');
loginBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.querySelector('input[name="login_email"]').value;
    const password = document.querySelector('input[name="login_password"]').value;
    const loginmessage = document.querySelector('.login-message');
    const data = { email, password };
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.success) {
        console.log('登入成功');
        // 設定 token 到 Local Storage
        localStorage.setItem('token', json.token);
        loginmessage.innerText = 'Login Success'; 
        window.location.href = '/index';     
    } else {
        console.log(json.message);
        loginmessage .innerText = json.message;
    }
    // 清空輸入欄位
    document.querySelector('input[name="login_email"]').value= '';
    document.querySelector('input[name="login_password"]').value= '';
});