const express = require("express");
const morgon = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { mongodbURI } = require("./configs/keys");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const requireAuth = require("./middlewares/requireAuth");

const app = express();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("App is listening on ", PORT));
