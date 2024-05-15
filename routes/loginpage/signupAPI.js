const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const bcrypt = require('bcrypt');
const { User } = require('../../modules/mongodb');
const S3 = require('../../modules/awsS3');
require('dotenv').config();
const multer = require('multer');
const upload = multer({ dest: '/api/signup'});
const fs = require('fs'); //用fs模塊讀取文件並將其轉換為二進制數據


router.post('/api/signup',upload.single('pic'), async (req, res) => {
  try {
    const formData = req.file; // 使用者自己的照片(上傳S3);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const defaulttpic = req.body.pic; // defaulttpic提供的照片網址;
    // const randomNumber = Math.floor(Math.random() * 1000000 + Date.now() / 1000);
    const fileName = 'upload/' + email; // 使用者S3照片名;
   
    // 1.檢查是否有空值
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    // 2.檢查電子郵件是否符合格式
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    // 3.檢查電子郵件是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    // 加密密碼
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 利用 mongoose 的 model 創建新的 document 並且存入資料庫
      // 存入資料庫前先確認使用者的照片
    if (formData==undefined) {// 使用defaulttpic照片
      var userpic= defaulttpic;
    }
    if (formData!=undefined) {// 使用自己上傳的照片
      // 4.確認照片的格式是否正確
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
    const user = new User({ name, email, password:hashedPassword, userpic})
    await user.save();
    res.json({ success: true });

  } catch (err) {
    console.log(err, err.stack);
    res.status(400).json({ success: false, message: 'error', error: err });
  }
});
module.exports = router;