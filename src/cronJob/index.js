const cron = require("node-cron");
const { runLiveMatchJob } = require("./threesCurry");

const cronJob = () => {
  
  cron.schedule("*/3 * * * *", () => {
    runLiveMatchJob()
  });
};

module.exports = cronJob;
