const express = require("express");
const router = express.Router();
const Saree = require("../models/sareeSchema");

router.post("/add-saree", async (req, res) => {
  const { name, description, price, sareeType, color, inStock, imageLink } =
    req.body;

  try {
    const saree = new Saree({
      name,
      description,
      price,
      sareeType,
      color,
      inStock,
      imageLink,
    });
    const result = await saree.save();
    return res.status(200).json({
      type: "success",
      message: "Saree successfully added",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
});

router.get("/get-sarees", async (req, res) => {
  try {
    const result = await Saree.find();
    return res
      .status(200)
      .send({ token: req.cookies.token, type: "success", sarees: result });
  } catch (error) {
    return res
      .status(500)
      .send({ type: "error", message: "Internal Server Error" });
  }
});
router.put("/update-saree/:id", async (req, res) => {
  const id = req.params.id;
  const { name, description, sareeType, color, inStock, imageLink } = req.body;
  try {
    const saree = await Saree.findById(id);
    if (!saree) {
      return res
        .status(400)
        .send({ type: "error", message: "Saree with this ID not found" });
    }
    const update = await Saree.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        sareeType,
        color,
        inStock,
        imageLink,
      },
      { new: true }
    );
    return res.send(update);
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Invalid saree ID",
    });
  }
});
router.delete("/delete-saree/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const saree = await Saree.findByIdAndDelete(id);
    if (!saree) {
      return res.status(400).json({
        type: "error",
        message: "Saree with this ID not found",
      });
    }
    return res.status(200).json({
      type: "success",
      message: "Saree Deletion success",
      saree: saree,
    });
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Invalid saree ID",
    });
  }
});

module.exports = router;
