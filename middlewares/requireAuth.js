module.exports = (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(401).send({ error: { message: "Login required!!" } });
  }
  next();
};
