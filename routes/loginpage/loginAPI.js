const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../modules/mongodb');
require('dotenv').config();


//login的api
router.post('/api/login', async (req, res) => {
  try {
    // 取得 request body 中的資料
    const { email, password } = req.body;
    // 1.檢查電子郵件是否存在
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // 2.檢查密碼是否正確
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // 設定 token 回傳 json 格式的成功訊息
    const token = jwt.sign({ email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '31d' });
    // 回傳 json 格式的成功訊息，並附上 token
    res.json({ success: true, token });
    
  } catch (err) {
    // 回傳 json 格式的失敗訊息
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;