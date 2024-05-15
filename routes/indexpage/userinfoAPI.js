const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../../modules/mongodb');
require('dotenv').config();

router.get('/api/userinfo', function(req, res) {
    // 檢查token是否存在
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({
            message: 'Unauthorized'
        });
    }
    // 使用token去驗證身份(jwt)
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err) {  
            return res.status(402).send({
                message: 'Invalid token'
            });
        }
        // 取得使用者的Email
        let userEmail = decoded.email;
        // 用使用者mail去MONGODB中找尋該使用者的資料
        User.findOne({email: userEmail}, function(err, user) {
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
            // 取得使用者姓名和圖片網址
            let userName = user.name;
            let userPic = user.userpic;
            let useremail = user.email;
            // 回傳給前端
            return res.status(200).send({
                name: userName,
                pic: userPic,
                email: useremail
            });
        });
    });
});

module.exports = router;