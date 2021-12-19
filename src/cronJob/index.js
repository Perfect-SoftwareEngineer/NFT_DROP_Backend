const cron = require("node-cron");
const { runRoutine } = require("./threesCurry");

const cronJob = () => {
  if (process.env.NODE_ENV == 'production') {
      const threesCurryTask = cron.schedule("*/1 * * * *", () => {
        runRoutine();
      });
      
      threesCurryTask.start();
  }
};

module.exports = cronJob;
