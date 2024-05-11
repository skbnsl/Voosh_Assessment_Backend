const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user-controller");
const checkUserAuth = require("../config/middleware");

//public router
router.post("/register", UserController.register);

router.post("/SignIn", UserController.SignIn);

router.post("/All-Users", checkUserAuth.verifyToken, UserController.profile);
// router.post(
//   "/send-User-Password-Reset-Email",
//   UserController.sendUserPasswordResetEmail
// );
// myProfile  updateProfile
router.post("/my-profile", checkUserAuth.verifyToken, UserController.myProfile);

router.put(
  "/updateProfile",
  checkUserAuth.verifyToken,
  UserController.updateProfile
);

router.post("/signout",UserController.signout);

module.exports = router;
