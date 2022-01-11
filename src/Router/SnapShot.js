const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { getSnapshot, getIntelSnapshot, get1226Snapshot, get1226SnapshotIndividual, updateSnapshotClaim } = require("../Controller/SnapShotController");
=======
const { getSnapshot, get1226Snapshot, get1226SnapshotIndividual, getRklSnapshot, updateSnapshotClaim } = require("../Controller/SnapShotController");
>>>>>>> script update

router.get("/get", getSnapshot);
router.get("/get/intel", getIntelSnapshot);
router.get("/get/1226", get1226Snapshot);
router.get("/get/1226/:address", get1226SnapshotIndividual);
router.get("/get/rkl-snapshot", getRklSnapshot);
router.post("/update", updateSnapshotClaim);

module.exports = router;
