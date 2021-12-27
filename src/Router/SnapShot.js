const express = require("express");
const router = express.Router();
const { getSnapshot, get1226Snapshot } = require("../Controller/SnapShotController");

router.get("/get", getSnapshot);
router.get("/get/1226", get1226Snapshot);

module.exports = router;
