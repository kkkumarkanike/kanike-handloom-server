module.exports = (req, res, next) => {
  console.log(req.cookies.token);
  if (!req.cookies.token) {
    return res.status(401).send({ error: { message: "Login required!!" } });
  }
  next();
};
