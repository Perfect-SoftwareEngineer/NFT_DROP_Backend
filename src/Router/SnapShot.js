const express = require("express");
const router = express.Router();
const { getSnapshot, getIntelSnapshot, getRklSnapshot, get1226Snapshot, get1226SnapshotIndividual, updateSnapshotClaim } = require("../Controller/SnapShotController");

router.get("/get", getSnapshot);
router.get("/get/intel", getIntelSnapshot);
router.get("/get/1226", get1226Snapshot);
router.get("/get/1226/:address", get1226SnapshotIndividual);
router.get("/get/rkl-snapshot", getRklSnapshot);
router.post("/update", updateSnapshotClaim);

module.exports = router;
