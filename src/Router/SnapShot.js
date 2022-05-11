const express = require("express");
const router = express.Router();
const { getSnapshot, getCommunitySnapshot, getRklSnapshot, getIntelSnapshotDrop1, getIntelSnapshotDrop2, getIntelSnapshotDrop3, getIntelSnapshotList, get1226Snapshot, get1226SnapshotIndividual, updateSnapshotClaim } = require("../Controller/SnapShotController");

router.get("/get/gcf", getSnapshot);
router.get("/get/community", getCommunitySnapshot);
router.get("/get/intel/drop1", getIntelSnapshotDrop1);
router.get("/get/intel/drop2", getIntelSnapshotDrop2);
router.get("/get/intel/drop3", getIntelSnapshotDrop3);
router.get("/get/intel/list/:address", getIntelSnapshotList);
router.get("/get/1226", get1226Snapshot);
router.get("/get/1226/:address", get1226SnapshotIndividual);
router.get("/get/rkl-snapshot", getRklSnapshot);
router.post("/update", updateSnapshotClaim);

module.exports = router;
