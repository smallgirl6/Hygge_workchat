const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../../modules/mongodb');
require('dotenv').config();



router.get('/api/findUserAPI', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const userEmail = decoded.email;
    const users = await User.find({ email: { $nin: ["AI", userEmail] } })
      .select("status email name userpic")
      .limit(30)
      .sort({ status: -1 });

    return res.status(200).send({
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;

