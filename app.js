const express = require("express");
const morgon = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const { mongodbURI } = require("./configs/keys");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const sareeRoutes = require("./routes/sareeRoutes");
const userRoutes = require("./routes/userRoutes");
const requireAuth = require("./middlewares/requireAuth");
const cartRoutes = require("./routes/cartRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const billingRoutes = require("./routes/billingRoutes");
const orderRoutes = require("./routes/ordersRoutes");

const app = express();
app.set("view engine", "ejs");

// * DB connetion
mongoose
  .connect(mongodbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

// * Middlewares
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(morgon("tiny"));

app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", sareeRoutes);
app.use("/api/user", userRoutes),
  app.get("/clear-cookies", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "cookies cleared" });
  });
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("App is listening on ", PORT));
