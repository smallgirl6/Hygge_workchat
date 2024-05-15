const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();



router.delete("/api/signout", (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    jwt.verify(token,process.env.TOKEN_SECRET);
    // 刪除 token
    res.status(200).send("Logged Out");
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
});
  


module.exports = router;