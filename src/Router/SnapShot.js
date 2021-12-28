const express = require("express");
const router = express.Router();
const { getSnapshot, get1226Snapshot, get1226SnapshotIndividual, updateSnapshotClaim } = require("../Controller/SnapShotController");

router.get("/get", getSnapshot);
router.get("/get/1226", get1226Snapshot);
router.get("/get/1226/:address", get1226SnapshotIndividual);
router.post("/update", updateSnapshotClaim);

module.exports = router;
