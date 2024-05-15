const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../modules/mongodb');
const S3 = require('../../modules/awsS3');
require('dotenv').config();
const multer = require('multer');
const upload = multer({ dest: '/api/edituser'});
const fs = require('fs'); //用fs模塊讀取文件並將其轉換為二進制數據


router.post('/api/edituser', upload.single('pic'), async (req, res) => {
  // 檢查token是否存在
  let token = req.headers.authorization;
  
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    // 取得使用者的Email
    let userEmail = decoded.email;
    // 用使用者mail去MONGODB中找尋該使用者的資料
    User.findOne({email: userEmail}, async function(err, user) {
      if (err) {
          console.log('Error while getting user information')
          return res.status(500).send({
              message: 'Error while getting user information'
          });
      }
      if (!user) {
          console.log('User not found')
          return res.status(404).send({
              message: 'User not found'
          });
      }
      // 取得使用者DB內存的姓名和圖片網址
      const DBName = user.name;
      const DBPic = user.userpic;
      const formData = req.file; // 使用者自己的照片(上傳S3);
      const name = req.body.name;
      const password = req.body.password;
      const defaulttpic = req.body.pic; // defaulttpic提供的照片網址或是原本的圖片;
      const fileName = 'upload/' + userEmail; // 使用者S3照片名;
      //若圖片沒變更且姓名及密碼也都空白，按下送出將不被接受
      if (defaulttpic == DBPic && !name && !password) {
        return res.status(400).json({ success: false, message: 'New pic, name or password are required' });
      }
      //存入資料庫前先確認使用者的照片
      if (formData==undefined) {// 使用defaulttpic照片
        var userpic= defaulttpic;
      }
      if (formData!=undefined) {// 使用自己上傳的照片
        // 確認照片的格式是否正確
        if (formData.mimetype !== 'image/jpeg' && formData.mimetype !== 'image/png' && formData.mimetype !== 'image/jpg') {
          return res.status(400).json({ success: false, message: 'Invalid file type. Only jpeg, png, and jpg are allowed' });
        }
        // 若使用者的照片是自己上傳的照片的話，則將照片上傳到s3
        const params = {
          Bucket: process.env.S3_BUCKET,
          Key: fileName, // 使用者S3照片名
          Body: fs.readFileSync(formData.path), 
          ContentType: formData.mimetype, // 照片格式
        };
        let data;
        try {
          data = await S3.putObject(params).promise(); 
        } catch (err) {
          console.log(err, err.stack);   // 'Failed to upload image to S3'
          return res.status(500).json({ success: false, message: 'Please choose another photo', error: err });
        }
        var userpic =  `https://workchatuserpic.s3.ap-northeast-1.amazonaws.com/${fileName}`;
        //CDN// var userpic =  `https://d2ot6xgmrc7iso.cloudfront.net/${fileName}`;
      }
      // 如果密碼不是空的即加密
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Please Input anothe password' });
          }
          hashedPassword = hash;
          // console.log("userEmail"+userEmail)
          // console.log("加密密碼"+hashedPassword )
          // console.log("圖片"+userpic)
          // console.log("name"+name)
          // updateUserData(userEmail, name, hashedPassword, userpic)

          if (userEmail && name && hashedPassword && userpic) {
            User.findOneAndUpdate({ email: userEmail }, { $set: { name: name, password: hashedPassword, userpic: userpic } }, { new: true }, (error, user) => {
              if (error) {
                return res.status(500).json({ success: false, message: error });
              }
              return res.status(200).json({ success: true, message: 'Update success' });
            });
          }
          if (!name && hashedPassword && userpic) {
            User.findOneAndUpdate({ email: userEmail }, { $set: {password: hashedPassword, userpic: userpic } }, { new: true }, (error, user) => {
              if (error) {
                return res.status(500).json({ success: false, message: error });
              }
              return res.status(200).json({ success: true, message: 'Update success' });
            });
          }
        });
      }else{
        if (name && userpic) {
          User.findOneAndUpdate({ email: userEmail }, { $set: {name: name, userpic: userpic } }, { new: true }, (error, user) => {
            if (error) {
              return res.status(500).json({ success: false, message: error });
            }
            return res.status(200).json({ success: true, message: 'Update success' });
          });
        }
        if (!name && userpic) {
          User.findOneAndUpdate({ email: userEmail }, { $set: {userpic: userpic } }, { new: true }, (error, user) => {
            if (error) {
              return res.status(500).json({ success: false, message: error });
            }
            return res.status(200).json({ success: true, message: 'Update success' });
          });
        };
      };
    });
  });
});


module.exports = router;