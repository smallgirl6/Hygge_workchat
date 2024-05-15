const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../../modules/mongodb');
require('dotenv').config();


router.put('/api/updateUserStatusAPI', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
          return res.status(401).send({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const userEmail = decoded.email;
        const status = req.body.status;
        console.log(userEmail)
        console.log(status)
        const user = await User.findOneAndUpdate(
            { email: userEmail },
            { status: status },
            { new: true }
        );
        return res.status(200).send({
            status: user.status 
        });
    }catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

module.exports = router