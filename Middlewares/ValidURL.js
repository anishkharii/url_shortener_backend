const dns = require("dns");

exports.checkValidURL = (req, res, next) => {
  let hostname;
  try {
    hostname = new URL(req.body.url).hostname;
  } catch (err) {
    res
      .status(400)
      .json({ status: "false", message: "Invalid URL", error: err });
    return;
  }

  checkUrlExists(hostname, async (exists) => {
    if (!exists) {
      res.status(400).json({ status: "false", message: "Invalid URL" });
      return;
    }
    next();
  });
};

exports.authorize = (req, res, next) => {
  if (req.query.password !== "AnishKhari") {
    res.status(403).json({ status: "false", message: "Forbidden" });
    return;
  }
  next();
};

function checkUrlExists(hostname, callback) {
  dns.resolve(hostname, (err, addresses) => {
    if (err) callback(false);
    else callback(true);
  });
}
