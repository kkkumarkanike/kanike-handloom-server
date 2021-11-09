const express = require("express");
const Favorite = require("../models/favoriteSchema");
const router = express.Router();

router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const itemsById = await Favorite.find({ userId });
    res.status(200).send({ type: "success", items: itemsById });
  } catch (error) {
    return res.status(400).json({ type: "error", message: "Invalid Item ID" });
  }
});

router.post("/add-item", async (req, res) => {
  const { itemInfo, userId } = req.body;
  try {
    const favItem = new Favorite({
      itemInfo,
      itemId: itemInfo._id,
      userId,
    });
    const result = await favItem.save();
    return res.status(200).json({
      type: "success",
      message: "Item added to favorites",
      item: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "error", message: "Internal server error!!" });
  }
});
// * To check particular item is in particular user's favorites
router.post("/in-cart", async (req, res) => {
  const { itemId, userId } = req.body;

  try {
    const item = await Favorite.find({
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
      return res.status(200).json({ inFavorites: false });
    }
    return res.status(200).json({ inFavorites: true });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
  }
});
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const item = await Favorite.findByIdAndDelete(id);
    if (!item) {
      return res
        .status(400)
        .json({ type: "error", message: "Invalid favorite item ID" });
    }
    return res
      .status(200)
      .json({ type: "success", message: "Item Deleted", item: item });
  } catch (error) {
    return res.status(500).json({ type: "error", message: "Invalid ID" });
  }
});

module.exports = router;
