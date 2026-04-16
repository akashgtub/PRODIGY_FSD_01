const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));


// 🔌 Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/authDB")
.then(()=>console.log("DB Connected"))
.catch(err=>console.log(err));


// 📝 REGISTER API
app.post("/register", async (req,res)=>{
  const {name,email,password} = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password,10);

  // Save user
  const user = new User({
    name,
    email,
    password: hashedPassword
  });

  await user.save();

  res.json({message:"User Registered"});
});


// 🔑 LOGIN API
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.status(400).json("User not found");

  // Check password
  const isMatch = await bcrypt.compare(password,user.password);
  if(!isMatch) return res.status(400).json("Wrong password");

  // Create token
  const token = jwt.sign({id:user._id},"secretkey",{expiresIn:"1h"});

  res.json({token});
});


// 🔐 MIDDLEWARE (security check)
const authMiddleware = (req,res,next)=>{
  const token = req.headers.authorization;

  if(!token) return res.status(401).json("Access denied");

  try{
    const verified = jwt.verify(token,"secretkey");
    req.user = verified;
    next();
  }catch{
    res.status(400).json("Invalid token");
  }
};


// 🔥 PROTECTED ROUTE
app.get("/dashboard", authMiddleware, (req,res)=>{
  res.json("Welcome to dashboard 🔥");
});


// 🚀 Start server
app.listen(5000, ()=>{
  console.log("Server running on port 5000");
});