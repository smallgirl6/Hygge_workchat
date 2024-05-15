const express = require('express');
const router = express.Router();
const { User } = require('../../modules/mongodb');
require('dotenv').config();

router.get("/api/searchemail", async (req, res) => {
    // 檢查token是否存在
    let token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({
            message: 'Unauthorized'
        });
    }
    const email = req.query.email;

    try {
        // 用使用者mail去MONGODB中找尋該使用者的資料
        let user = await User.findOne({email: email});
    
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
            success: true,
            name: userName,
            pic: userPic,
            email: useremail
        });
    } catch (err) {
        console.log('Error while getting user information', err)
        return res.status(500).send({
            message: 'Error while getting user information'
        });
    }
});


module.exports = router;