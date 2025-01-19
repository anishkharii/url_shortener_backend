const Shortid = require("shortid");
const URLModel = require("../Models/URLModel");
const requestIp = require("request-ip");
const UAParser = require("ua-parser-js");
const GeoIp = require("geoip-lite");

exports.createURL = async (req, res) => {
  try {
    const url = req.body.url;
    const data = await URLModel.findOne({ original_url: url });
    if (data) {
      res.status(200).json({ status: true, data: data });
      return;
    }
    const newURL = await URLModel.create({
      short_id: Shortid.generate(),
      original_url: url,
      clicksHistory: [],
    });

    res.status(201).json({ status: true, data: newURL });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getURL = async (req, res) => {
  try {
    const userAgent = UAParser(req.headers["user-agent"]);
    const ip = requestIp.getClientIp(req);
    const geo = GeoIp.lookup(ip);
    const url = await URLModel.findOneAndUpdate(
      { short_id: req.params.id },
      {
        $push: {
          clicksHistory: {
            $each : [ {
            timestamp: Date.now(),
            userAgent: {
              browser: userAgent.browser.name,
              browserVersion: userAgent.browser.version,
              os: userAgent.os.name,
              osVersion: userAgent.os.version,
              deviceType: userAgent.device.type || "desktop",
            },
            ip: ip,
            location: geo,
          }], $position: 0
          },
        },
      }, {new: true}
    );

    if (!url) {
      res.status(404).json({ status: false, message: "URL not found" });
      return;
    }

    res.redirect(url.original_url);
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.showAllURLs = async (req, res) => {
  try {
    const urls = await URLModel.find();
    res.status(200).json({ status: true, data: urls });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const url = await URLModel.findOne({ short_id: req.params.id });
    if (!url) {
      res.status(404).json({ status: false, message: "URL not found" });
      return;
    }
    const totalClicks = url.clicksHistory.length;
    res.status(200).json({
      status: true,
      data: {
        ...url.toObject(),
        totalClicks,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.deleteURL = async (req, res) => {
  try {
    const url = await URLModel.findOneAndDelete({ short_id: req.params.id });
    if (!url) {
      res.status(404).json({ status: false, message: "URL not found" });
      return;
    }
    res
      .status(200)
      .json({ status: true, message: "URL deleted successfully", data: url });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
