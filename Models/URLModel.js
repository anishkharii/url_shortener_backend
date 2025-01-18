const { default: mongoose } = require("mongoose");

const URLSchema = new mongoose.Schema(
  {
    short_id: {
      type: String,
      reqired: true,
      unique: true,
    },
    original_url: {
      type: String,
      required: true,
    },
    clicksHistory: [
      {
        timestamp: {
          type: Number,
        },
        userAgent: [{}],
        ip: {
          type: String,
        },
        location: [{}],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("URLModel", URLSchema);
