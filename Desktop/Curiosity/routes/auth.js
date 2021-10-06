const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const User=require('../models/user')

router.get('/register',(req,res)=>{
    res.render('signup');
})
router.get('/login',(req,res)=>{
    res.render('login');
})

module.exports=router;