const mongoose = require("mongoose");


//Defining Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    bio: { type: String },
    phone: { type: String },
    photoUrl: { type: String,default:"https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg" },
    isPublic: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'] },
  });

//Model
const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;

