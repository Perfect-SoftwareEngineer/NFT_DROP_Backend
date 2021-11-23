let mongoose = require("mongoose");

let threesCurrySchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.Number,
      unique: true,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  threesCurryModel: mongoose.model("threes_curry", threesCurrySchema),
};
