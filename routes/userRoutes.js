const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const keys = require("../configs/keys");
const nodemailer = require("nodemailer");
const User = require("../models/userSchema");

const maxAge = 3 * 24 * 60 * 60 * 1000;
const generateToken = async (emailId) => {
  const token = jwt.sign({ emailId }, keys.jwtSecret, { expiresIn: maxAge });
  console.log(token);
  return token;
};

const mailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kkalyan812@gmail.com",
      pass: "K2356@156abcd",
    },
  });
};

const mailOptions = (resetLink, mail, subject) => {
  return {
    from: "kkalyan812@gmail.com",
    to: mail,
    subject: subject,
    text: resetLink,
  };
};

const handleErrors = (error) => {
  let errors = { email: "", password: "" };
  if (error.code) {
    if (error.code === 11000) {
      errors["email"] = "User with this email already exists!!";
    }
  }
  if (error.errors) {
    if (
      error.password.message.includes("shorter than the minimum allowed length")
    ) {
      errors["password"] = "Password should be minimum 6 characters!!";
    }
  }
  return errors;
};

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const resetToken = await generateToken(email);
  try {
    const user = new User({
      name,
      email,
      password,
      passwordValue: password,
      resetToken: resetToken,
      verified: false,
    });
    const result = await user.save();
    const transporter = mailTransporter();
    transporter.sendMail(
      mailOptions(
        `http://localhost:3000/api/user/verify-account/${resetToken}`,
        email,
        "Verify Account"
      ),
      (err, response) => {
        if (err)
          return res.status(400).send({
            type: "error",
            message: "Something went wrong!! Try again..",
          });
        return res.status(200).send({
          type: "success",
          user: result,
          message: "Signin success! Please verify your email..",
        });
      }
    );
  } catch (error) {
    res.status(500).send(handleErrors(error));
  }
});

router.get("/verify-account/:id", async (req, res) => {
  const token = req.params.id;
  await jwt.verify(token, keys.jwtSecret, async (err, decoded) => {
    console.log(decoded);
    if (err) return res.render("verification-error");
    // return res.send({ type: "error", message: "Invalid token" });
    const user = await User.findOne({ email: decoded.emailId });
    console.log(user);
    if (user.verified) {
      // return res.status(400).send({ message: "User already verified" });
      return res.render("verification-already-done");
    }
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        verified: true,
      },
      { new: true }
    );
    // return res.json({
    //   type: "success",
    //   message: "your account is verified now!!",
    //   user: updatedUser,
    // });
    return res.render("verification-success");
  });
});

router.post("/login", async (req, res) => {
  //   res.cookie("token", "this is token", { maxAge: 24 * 60 * 60 * 1000 })
  //   const token = await generateToken("kkalyan812@gmail.com");

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send({ type: "error", message: "User with this email not found!!" });
    await bcrypt.compare(password, user.password, async (error, result) => {
      console.log(error, result);
      if (!result) {
        return res.status(400).send({
          type: "error",
          message: "Password you have entered is incorrect!!",
        });
      }
      if (user.verified) {
        const token = await generateToken(user.email);
        res.cookie("token", token, { maxAge: maxAge });
        return res.status(200).send({
          type: "success",
          message: "User sign in success!!",
          user: user,
        });
      } else {
        return res
          .status(400)
          .send({ type: "warning", message: "Please verify your account !!" });
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal server error!!");
  }
});

router.post("/get-reset-link", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ type: "error", message: "User with this email not exists" });
    const resetToken = await generateToken(email);
    const transporter = mailTransporter();
    transporter.sendMail(
      mailOptions(
        `http://localhost:3000/user/reset-password/${resetToken}`,
        email,
        "Password Reset Link"
      ),
      (err, response) => {
        if (err)
          return res.status(500).json({
            type: "error",
            message: "Something went wrong, please try again!!",
          });
        res.status(200).json({
          type: "success",
          message: "Password reset link has been sent to your email",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Something went wrong, please try again!!",
    });
  }
});

router.get("/check-valid-token/:id", async (req, res) => {
  const token = req.params.id;
  try {
    await jwt.verify(token, keys.jwtSecret, async (err, decoded) => {
      console.log(decoded);
      if (err)
        return res.status(400).json({ type: "error", isValidToken: false });
      const user = await User.findOne({ email: decoded.emailId });
      return res
        .status(200)
        .json({ type: "success", isValidToken: true, user });
    });
  } catch (error) {}
});

router.put("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await jwt.verify(token, keys.jwtSecret, async (err, decoded) => {
      if (err)
        return res
          .status(400)
          .json({ type: "error", message: "Token has been expired!!" });
      const user = await User.findOneAndUpdate(
        { email: decoded.emailId },
        {
          password: hashedPassword,
        }
      );
      if (user) {
        return res.status(200).json({ type: "success", data: user });
      } else {
        return res.status(500).json({
          type: "error",
          message: "Something went wrong, try again!!",
        });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Something went wrong, try again!!" });
  }
});

router.put("/change-password", async (req, res) => {
  const { id, password } = req.body;
  try {
    const salt = await bcrypt.genSalt();
    const updatedPass = await bcrypt.hash(password, salt);
    const user = await User.findByIdAndUpdate(
      id,
      {
        password: updatedPass,
      },
      { new: true }
    );
    //     console.log(user);
    if (!user)
      return res
        .status(400)
        .json({ type: "error", message: "User with this ID not found" });
    return res.status(200).json({
      type: "success",
      message: "Password updated successfully!!",
      user: user,
    });
  } catch (error) {
    //     console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Internal Server error" });
  }
});

router.get("/get-users", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res
    .status(200)
    .send({ type: "success", message: "User logout success" });
});
module.exports = router;
