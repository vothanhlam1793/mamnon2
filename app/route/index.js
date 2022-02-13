var express = require('express');
var router = express.Router();

router.get("/", (req, res)=>{
    res.render("homepage");
})

router.get("/login", (req, res)=>{
    res.render("login");
})
module.exports = router;
