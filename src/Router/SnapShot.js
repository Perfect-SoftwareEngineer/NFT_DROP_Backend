const express = require("express");
const router = express.Router();
const { setBbSnapshot, setBbCommunitySnapshot, setSerumSnapshot, setSerumCommunitySnapshot, getRklSnapshot, setIntelSnapshotDrop1, setIntelSnapshotDrop2, setIntelSnapshotDrop3, getIntelSnapshotList, get1226Snapshot, get1226SnapshotIndividual, updateSnapshotClaim } = require("../Controller/SnapShotController");

router.get("/set/basketball/gcf",setBbSnapshot);
router.post("/set/basketball/community",setBbCommunitySnapshot);
router.post("/set/serum/gcf",setSerumSnapshot);
router.post("/set/serum/community",setSerumCommunitySnapshot);
router.get("/set/intel/drop1",setIntelSnapshotDrop1);
router.get("/set/intel/drop2",setIntelSnapshotDrop2);
router.get("/set/intel/drop3",setIntelSnapshotDrop3);
router.get("/get/intel/list/:address", getIntelSnapshotList);
router.get("/get/1226", get1226Snapshot);
router.get("/get/1226/:address", get1226SnapshotIndividual);
router.get("/get/rkl-snapshot", getRklSnapshot);
router.post("/update", updateSnapshotClaim);

module.exports = router;
