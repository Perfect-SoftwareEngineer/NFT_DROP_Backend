const cron = require("node-cron");
const { runLiveMatchJob } = require("./threesCurry");

const cronJob = () => {
  
  cron.schedule("*/1 * * * *", () => {
    runLiveMatchJob()
  });
};

module.exports = cronJob;
