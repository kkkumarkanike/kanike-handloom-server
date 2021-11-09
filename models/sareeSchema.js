const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sareeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sareeType: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      required: true,
    },
    imageLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Saree = mongoose.model("Saree", sareeSchema);

module.exports = Saree;
