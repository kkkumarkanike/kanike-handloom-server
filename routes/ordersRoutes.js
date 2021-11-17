const express = require("express");
const router = express.Router();
const Order = require("../models/ordersSchema");

router.get("/get-orders/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const orders = await Order.find({ userId });
    return res.status(200).json({ type: "success", orders });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/order/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const order = await Order.findOneAndDelete({ _id: id });
    if (!order)
      return res
        .status(400)
        .json({ type: "error", message: "Order not found!!" });
    return res
      .status(200)
      .json({ type: "success", order, message: "Order deletion success!!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
});

module.exports = router;
