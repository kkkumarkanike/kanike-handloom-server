const express = require("express");
const router = express.Router();
const keys = require("../configs/keys");
const stripe = require("stripe")(keys.stripeSecreteKey);
const Cart = require("../models/cartSchema");
const Order = require("../models/ordersSchema");

const generateOrderId = () => {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charsLength = chars.length;
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return "ORDER_" + result;
};

router.post("/stripe", async (req, res) => {
  const { token, amount, cartItems } = req.body;
  try {
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: "inr",
      source: token.id,
      description: "3 Sarees",
    });
    const userId = cartItems[0].userId;
    if (charge) {
      const emptyCart = await Cart.deleteMany({ userId });
      const orderId = generateOrderId();
      const createOrder = new Order({
        orderId,
        userId: userId,
        orderedItems: cartItems,
        orderDetails: charge,
      });
      const order = await createOrder.save();
      if (!order)
        return res
          .status(400)
          .json({
            type: "error",
            message: "Something went wrong, try again!!",
          });
      return res.status(200).json({ type: "success", order: order });
    }
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
  }
});

module.exports = router;
