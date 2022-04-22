let mongoose = require("mongoose");

let currentWarriorsMatchSchema = new mongoose.Schema(
  {
    game_id: {
      type: mongoose.Schema.Types.Number,
      unique: true,
      required: true,
    },
    season: {
      type: mongoose.Schema.Types.Number,
      required: true,
    },
    opposite_team: {
      type: mongoose.Schema.Types.String,
    },
    tpm: {
      type: mongoose.Schema.Types.Number,
      default: 0
    },
    live: {
      type: mongoose.Schema.Types.Boolean,
      require: true
    },
    merkled: {
      type: mongoose.Schema.Types.Boolean,
      require: true,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = {
  currentWarriorsMatchModel: mongoose.model("current_worriors_match", currentWarriorsMatchSchema),
};
