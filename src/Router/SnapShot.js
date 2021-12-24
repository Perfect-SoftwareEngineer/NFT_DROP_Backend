const express = require("express");
const router = express.Router();
const { getSnapshot } = require("../Controller/SnapShotController");

router.get("/get", getSnapshot);

module.exports = router;
