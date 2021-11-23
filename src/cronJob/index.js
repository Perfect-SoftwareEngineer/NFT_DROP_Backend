const cron = require("node-cron");
const { getTpmAndSave } = require("./threesCurry");

const cronJob = () => {
  const threesCurryTask = cron.schedule("* */10 * * * *", () => {
    getTpmAndSave();
  });

  threesCurryTask.start();
};

module.exports = cronJob;
