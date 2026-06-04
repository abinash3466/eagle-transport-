const express = require("express");

const auth = require("../middleware/authMiddleware");

const router = express.Router();

const {
    addTruck,
    getTrucks,
    updateTruck,
    deleteTruck,

} = require("../controllers/truckController");

router.post("/", auth, addTruck);
router.get("/", auth, getTrucks);
router.delete("/:id", auth, deleteTruck);

module.exports = router;