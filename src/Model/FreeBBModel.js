let mongoose = require("mongoose");

let freeBBSchema = new mongoose.Schema(
  {
    game_id: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    claimed: {
      type: mongoose.Schema.Types.Boolean,
      require: true,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  freeBBModel: mongoose.model("free_basketball", freeBBSchema),
};
