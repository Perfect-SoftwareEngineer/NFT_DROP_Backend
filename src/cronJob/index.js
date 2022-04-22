const cron = require("node-cron");
const { runTpmJob, runLiveMatchJob, runTpmMatchJob } = require("./threesCurry");

const cronJob = () => {
  if (process.env.NODE_ENV == 'production') {
      const threesCurryTask = cron.schedule("*/1 * * * *", () => {
        runTpmJob();
      });
      
      threesCurryTask.start();
  }
  cron.schedule("*/3 * * * *", () => {
    runLiveMatchJob()
  });
};

module.exports = cronJob;
