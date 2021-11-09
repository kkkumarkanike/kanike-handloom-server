const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoritesSchema = new Schema(
  {
    itemInfo: {
      type: Object,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("favorites", favoritesSchema);

module.exports = Favorite;
