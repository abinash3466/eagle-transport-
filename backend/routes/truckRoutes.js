const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { ownerOnly } = auth;

const { addTruck, getTruck, updateTruck, deleteTruck } = require("../controllers/truckController");

router.post("/", auth, ownerOnly, addTruck);
router.get("/", auth, ownerOnly, getTruck);
router.put("/:id", auth, ownerOnly, updateTruck);
router.delete("/:id", auth, ownerOnly, deleteTruck);

module.exports = router;
