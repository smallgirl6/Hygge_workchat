// import { initNavbar } from './navbar.js';
// initNavbar();

// 右上導覽切換login以及signup畫面

function switchImage(type) {
    if (type === 'editprofile') {
        document.querySelector('.background-image-profile').style.display = 'none';
        document.querySelector('.background-image-edit').style.display = 'block';
    } else if (type === 'profile') {
        document.querySelector('.background-image-edit').style.display = 'none';
        document.querySelector('.background-image-profile').style.display = 'block';
    }
}

let images = ["/Image/userdefaultpic/user.png","/Image/userdefaultpic/puffin.png","/Image/userdefaultpic/sheep.png","/Image/userdefaultpic/horse.png","/Image/userdefaultpic/whale.png","/Image/userdefaultpic/fox.png"];

//fetch 使用者資訊的API
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
    // 將圖片網址放入userpic區塊的img
    document.querySelector('.current-pic').src = data.pic;
    document.querySelector('.profilepic img').src = data.pic
   //  將網址加入images陣列
    images.push(data.pic);;
    // 將文字放入username
    document.querySelector('.profilename').innerText = data.name;
    document.querySelector('.profileemail').innerText = data.email;
})
.catch(err => {
    console.log(err);
});

// signup中左右箭頭讓圖片輪播

let i = -1;
let rightArrow = document.querySelector(".edit-rightarrow");
let leftArrow = document.querySelector(".edit-leftarrow");
let currentPic = document.querySelector(".current-pic");
let nextPic = document.querySelector(".next-pic");
let edit_input_upload = document.querySelector(".edit-input-upload");
let edit_input_img = document.querySelector(".edit-input-img");

rightArrow.addEventListener("click", function() {
    document.querySelector(".change-message").innerText = "";
    i = (i + 1) % images.length;
    nextPic.src = images[i];
    currentPic.classList.add("slideOutToLeft");
    nextPic.classList.add("slideInFromRight");
    document.querySelector(".edit-input-img").value = "";
   
});

leftArrow.addEventListener("click", function() {
    document.querySelector(".change-message").innerText = "";
    i = (i - 1 + images.length) % images.length;
    nextPic.src = images[i];
    nextPic.classList.add("slideInFromLeft");
    currentPic.classList.add("slideOutToRight");
    document.querySelector(".edit-input-img").value = "";
});

currentPic.addEventListener("animationend", function() {
    currentPic.classList.remove("slideOutToLeft");
    currentPic.classList.remove("slideOutToRight");
    currentPic.src = nextPic.src;
    let match = currentPic.src.match("user.png");
    if (match) {
        edit_input_upload.style.display = 'block';
    } else {
        edit_input_upload.style.display = 'none';
    }
    nextPic.src = "";
});

// 按clearButton清除選取的本地上傳圖片
const clearButton = document.querySelector('#clear-button');
clearButton.addEventListener('click', function() {
    edit_input_img.value = "";
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
        document.querySelector(".edit-input-img").addEventListener("change", function () {
        displaySelectedImage(this);
        });
        document.querySelector("#clear-button").addEventListener("click", function () {
        document.querySelector(".edit-input-img").value = "";
        document.querySelector(".current-pic").src = "/Image/userdefaultpic/user.png";
    }
);
// fetech edituser的API
const changeBtn = document.querySelector('.change-button');
changeBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const changeMessage = document.querySelector('.change-message');
    changeMessage.innerText = '';
    const uploadpic = document.querySelector('.edit-input-img').files[0]; 
    const defailtpic= document.querySelector('.current-pic').src;  
  
    let formData = new FormData(); 
    if (uploadpic ==null){
        formData.append('pic', defailtpic);
    }
    else{
        formData.append('pic', uploadpic);
    }
    const name = document.querySelector('input[name="edit_name"]').value;
    const password = document.querySelector('input[name="edit_password"]').value;
    formData.append('name', name );
    formData.append('password', password); 
    console.log(formData)
    const res = await fetch('/api/edituser', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': localStorage.getItem('token'),
        }
    });
    const json = await res.json();
    if (json.success) {
        console.log('更新成功');
        changeMessage.innerText = 'Update Success';
        location.href = "/profiles"
    } else {
        console.log(json.message);
        changeMessage.innerText = json.message;
    }
    // 清空輸入欄位
    document.querySelector('input[name="edit_name"]').value = '';
    document.querySelector('input[name="edit_password"]').value = '';
});

// 登出
const signOut = () => {
    document.getElementById("signout").addEventListener("click", async () => {
      try {
        const headers = new Headers({
            'Authorization': localStorage.getItem('token'),
        });
        const response = await fetch("/api/signout", {
          method: "DELETE",
          headers,
        });
        if (response.ok) {
          localStorage.removeItem("token");
          window.location.replace("/");
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error(error);
      }
    });
  };
  
  signOut();

