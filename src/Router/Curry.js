const express = require("express");
const router = express.Router();
const { threesCurryRequestHandler } = require("../Controller/CurryController");

router.get("/threes", threesCurryRequestHandler);

module.exports = router;
