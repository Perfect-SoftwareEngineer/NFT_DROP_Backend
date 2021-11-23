var HttpStatusCodes = require("http-status-codes");
const { threesCurryModel } = require("../../Model/ThreesCurryModel");

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const threesCurryRequestHandler = async (req, res) => {
  const { playerId } = req.query;

  if (typeof playerId === "undefined") {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      errorMessage: "invalid playerId - should be included in the query param",
    });
  }

  try {
    const threesCurry = await threesCurryModel.findOne({ playerId: playerId });

    if (!threesCurry) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        errorMessage: "Not found",
      });
    } else {
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        value: threesCurry.value,
      });
    }
  } catch (e) {
    console.log(e);

    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      errorMessage: "Internal server error",
    });
  }
};

module.exports = threesCurryRequestHandler;
