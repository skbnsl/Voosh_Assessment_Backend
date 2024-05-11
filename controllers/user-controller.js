const express = require("express");
const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const JWT_SECRET_KEY = "THiS_IS_a__JWT_sECrET_kEY";
const cookieParser = require("cookie-parser");
const app = express();
const jwt = require("jsonwebtoken");
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');
app.use(cookieParser());

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object  # Use 'object' instead of 'Object' (YAML is case-sensitive)
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         phone:
 *           type: string
 *         bio:
 *           type: string
 *         photoUrl:
 *           type: string
 *         role:
 *           type: string
 *         isPublic:
 *           type: boolean
 */


/**
 * @swagger
 * /register:
 *   post:
 *     summary: This api is used to create a new account
 *     description: This api creates a new user or if user is already exist then it will give error
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '/register'
 *     responses:
 *       200:
 *         description: User Created
 *         
 */
 
async function register(req, res) {
  try {
    const { email, password, name, bio, phone, photoUrl, isPublic, role } =
      req.body;
    console.log(req.body);
    if (!email || !password || isPublic === "" || !role) {
      return res
        .status(404)
        .send({ status: "failed", message: "All Fields are required" });
    }

    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res
        .status(403)
        .send({ status: "failed", message: "user already exist" });
      //console.log("user already exist");
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    const doc = new UserModel({
      email: email,
      password: hashpassword,
      name: name,
      bio: bio,
      phone: phone,
      photoUrl: photoUrl,
      isPublic: isPublic,
      role: role,
    });
    await doc.save();
    return res.status(201).send({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.send("Something went wrong");
  }
}



/**
 * @swagger
 * /SignIn:
 *   post:
 *     summary: This api is used SignIn user
 *     description: This api creates a jwt token for login user and checks user's creadintials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/user/SignIn'
 *     responses:
 *       200:
 *         description: User Successfully login
 *         
 */
async function SignIn(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(203).send({
        status: "Failed",
        message: "All Fields are required",
      });
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.send({
        status: "failed",
        message: "user is not registered",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (user.email === email && isMatch) {
      const token = jwt.sign({ userID: user._id }, JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      return res.cookie("jwt",token ).send({ 
        status: "success",
        message: "login successfully",
        token: token,
      });
    } else {
      return res.send({
        status: "Failed",
        message: "Email or Password must be wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: "Failed",
      message: "something went wrong",
    });
  }
}



/**
 * @swagger
 * /All-Users:
 *   post:
 *     summary: This api is used to check all user's profile
 *     description: This api checks user role. If the user is an admin, it can get all users. If the user role is user, it will get public profiles. Requires a valid authorization token in the Bearer scheme.
 *     security:
 *       - BearerAuth: []  # Add Bearer authentication scheme
 *     requestBody:
 *       required: false  # No request body required (optional)
 *     responses:
 *       200:
 *         description: User gets all profiles (based on role and profile privacy)
 *         
 */
async function profile(req, res) {
  try {
    const user = await UserModel.findOne({ _id: req.userID });
    console.log(user);
    const obj = {};
    if (user.role === "admin") {
      const users = await UserModel.find();
      obj.data = users;
      return res.status(200).send({
        data: obj,
        status: "Success",
      });
    } else if (user.role === "user") {
      const users = await UserModel.find({ isPublic: true });
      obj.data = users;
      return res.status(200).send({
        data: obj,
        status: "Success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send("Something went wrong");
  }
}



/**
 * @swagger
 * /my-profile:
 *   post:
 *     summary: This api is used for check user's details
 *     description: This api gets the jwt token from header and checks token is valid then it will show the user's data
 *     security:
 *       - BearerAuth: [] 
 *     requestBody:
 *       required: false  
 *     responses:
 *       200:
 *         description: User deatils
 *         
 */
async function myProfile(req, res) {
  try {
    const user = await UserModel.findOne({ _id: req.userID });
    console.log(user);
    const obj = {};
    obj.email = user.email;
    obj.name = user.name;
    obj.bio = user.bio;
    obj.phone = user.phone;
    obj.photoUrl = user.photoUrl;
    obj.isPublic = user.isPublic;
    obj.role = user.role;
    return res.status(200).send({
      data: obj,
      status: "Success",
    });
  } catch (error) {
    return res.send("Something went wrong");
  }
}



/**
 * @swagger
 * /updateProfile:
 *   post:
 *     summary: This api is used for update user's details
 *     description: This api gets the jwt token from header and checks token is valid then it get the data from body and update user's data
 *     security:
 *       - BearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/user/updateProfile'  
 *     responses:
 *       200:
 *         description:  User deatils successfully updated
 *         
 */
async function updateProfile(req, res) {
  try {
    const user = await UserModel.findOne({ _id: req.userID });
    console.log(user);
    //const obj = {};
    //obj.email = user.email;
    let name1 = req.body.name;
    let bio1 = req.body.bio;
    let phone1 = req.body.phone;
    let isPublic1 = req.body.isPublic;
    let password1 = req.body.password;
    if (!req.body.name) {
      console.log("****name*******", req.body.name);
      name1 = user.name;
    }
    if (!req.body.bio) {
      bio1 = user.bio;
      console.log("********bio***", req.body.bio);
    }
    if (!req.body.phone) {
      phone1 = user.phone;
      console.log("******phone*****", req.body.phone);
    }
    if (!req.body.isPublic) {
      isPublic1 = user.isPublic;
      console.log("********isPublic***", req.body.isPublic);
    }
   
      console.log("***",name1,"***",bio1,"****",phone1,"*****",isPublic1);
    if(!password1){
      var userupdate =  await UserModel.updateOne(
        { _id: user._id },
        { $set: { name: name1, bio: bio1, phone: phone1, isPublic: isPublic1 } }
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);
      var userupdate =  await UserModel.updateOne(
        { _id: user._id },
        { $set: { name: name1,password:hashpassword, bio: bio1, phone: phone1, isPublic: isPublic1 } }
      );
    }
    console.log("userupdate",userupdate);
    const user1 = await UserModel.findOne({ _id: req.userID });
    return res.status(200).send({
      status: "Success",
      "message":"Data Updateed Succesfully",
      data: user1,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).send({
      data: error,
      status: "Failed",
    });
  }
}

/**
 * @swagger
 * /signout:
 *   post:
 *     summary: This api is used signout user
 *     description: This api clear the cookie and set it to empty string
 *     security:
 *       - BearerAuth: [] 
 *     requestBody:
 *       required: false  
 *     responses:
 *       200:
 *         description:  User succesfully signed-out
 *         
 */
async function signout(req,res){
  return res.cookie("jwt","",{maxAge:1}).send({
    "status":"success",
    "message":"successfully logout"
  });
  
}

module.exports = {
  register,
  SignIn,
  profile,
  myProfile,
  updateProfile,
  signout
};
