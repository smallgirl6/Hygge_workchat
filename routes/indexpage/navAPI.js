
const express = require('express');
const router = express.Router();

router.get('/index', (req, res) => {
    res.render('index');
});
router.get('/profiles', (req, res) => {
res.render('profiles')
});


module.exports = router;