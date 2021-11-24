const { default: axios } = require("axios");
const { threesCurryModel } = require("../Model/ThreesCurryModel");
const { createTweet, client } = require('./twitter');

/**
 *
 * @param {number} playerId
 * @param {(playerId: number, totalThrees: number) => void} cb
 */
const tpmFetcher = (playerId, cb) => {
  const options = {
    method: "GET",
    url: `https://api-nba-v1.p.rapidapi.com/statistics/players/playerId/${playerId}`,
    headers: {
      "x-rapidapi-host": "api-nba-v1.p.rapidapi.com",
      "x-rapidapi-key": process.env.API_NBA_KEY,
    },
  };

  axios(options)
    .then((response) => {
      const currCount = {
        489: 2899,
      };

      const { data } = response;
      if (data.api && data.api.statistics.length) {
        const { statistics } = data.api;
        const newGames = statistics.slice(Object.keys(currCount)[0]);

        let tpmCount = 0;
        if (newGames.length) {
          newGames.forEach((value, i) => {
            let count = parseInt(value.tpm);

            if (count) {
              tpmCount += count;
            }
          });
        }

        const totalThrees = currCount["489"] + tpmCount;
        cb(playerId, totalThrees);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
};

/**
 *
 * @param {number} playerId
 * @param {number} value
 */
const storeTotalThreesInDB = (playerId, value) => {
  threesCurryModel.updateOne(
    { playerId },
    {
      playerId,
      value,
    },
    { upsert: true }, (error, result) => {console.log(error, result)}
  );
};

/**
 * @param {number} playerId => ThreesCurryModel
 */
const checkDBValue = (playerId) => {
    return threesCurryModel.findOne({ playerId });
}

/**
 * Run subroutine to
 * 1. Fetch new TPM value
 * 2. Compare value to check if it needs to be updated/tweeted about
 * 3. Update/Tweet about it if necessary
 */
const runRoutine = () => {
  tpmFetcher(124, async (playerId, value) => {
      const document = await checkDBValue(playerId);
      
      if (document.value !== value) {
          await storeTotalThreesInDB(playerId, value);
          await createTweet(`Steph Curry 3-point count: ${value}`);
      }
  });
};

module.exports = {
  tpmFetcher,
  storeTotalThreesInDB,
  runRoutine,
};
