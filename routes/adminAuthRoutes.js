const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const keys = require("../configs/keys");
const Admin = require("../models/adminSchema");

const maxAge = 3 * 24 * 60 * 60 * 1000;
const generateToken = async (emailId) => {
  const token = jwt.sign({ emailId }, keys.jwtSecret, { expiresIn: maxAge });
  console.log(token);
  return token;
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
  try {
    const admin = new Admin({
      name,
      email,
      password,
    });
    const result = await admin.save();
    res.status(200).send({ type: "success", admin: result });
  } catch (error) {
    res.status(400).send(handleErrors(error));
  }
});

router.post("/login", async (req, res) => {
  //   res.cookie("token", "this is token", { maxAge: 24 * 60 * 60 * 1000 })
  //   const token = await generateToken("kkalyan812@gmail.com");
  //   await jwt.verify(token, keys.jwtSecret, (err, decoded) => {
  //     if (err) return res.send(error);
  //     return res.send(decoded.emailId);
  //   });
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(400)
        .send({ type: "error", message: "User with this email not found!!" });
    await bcrypt.compare(password, admin.password, async (error, result) => {
      console.log(error, result);
      if (!result) {
        return res.status(400).send({
          type: "error",
          message: "Password you have entered is incorrect!!",
        });
      }
      const token = await generateToken(admin.email);
      res.cookie("token", token, { maxAge: maxAge });
      return res.status(200).send({ type: "success", admin: admin });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error!!");
  }
});

module.exports = router;
