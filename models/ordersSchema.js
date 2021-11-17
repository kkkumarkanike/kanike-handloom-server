const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ordersSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderedItems: {
      type: Array,
      required: true,
    },
    orderDetails: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("order", ordersSchema);

module.exports = Order;
