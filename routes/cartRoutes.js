const express = require("express");
const Cart = require("../models/cartSchema");
const router = express.Router();

router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const itemsById = await Cart.find({ userId });
    res.status(200).send({ type: "success", items: itemsById });
  } catch (error) {
    return res.status(400).json({ type: "error", message: "Invalid Item ID" });
  }
});

router.post("/add-item", async (req, res) => {
  const { itemInfo, userId } = req.body;
  try {
    const cartItem = new Cart({
      itemInfo,
      itemId: itemInfo._id,
      userId,
    });
    const result = await cartItem.save();
    return res
      .status(200)
      .json({ type: "success", message: "Item added to cart", item: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "error", message: "Internal server error!!" });
  }
});

// * To check particular item is in particular user's cart
router.post("/in-cart", async (req, res) => {
  const { itemId, userId } = req.body;

  try {
    const item = await Cart.find({
      $and: [
        {
          itemId,
        },
        {
          userId,
        },
      ],
    });
    if (!item.length) {
      return res.status(200).json({ inCart: false });
    }
    return res.status(200).json({ inCart: true });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const item = await Cart.findByIdAndDelete(id);
    if (!item) {
      return res
        .status(400)
        .json({ type: "error", message: "Invalid cart item ID" });
    }
    return res
      .status(200)
      .json({ type: "success", message: "Item Deleted", item: item });
  } catch (error) {
    return res.status(500).json({ type: "error", message: "Invalid ID" });
  }
});




module.exports = router;
