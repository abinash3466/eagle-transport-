const Truck = require("../models/Truck");


// ➕ Add Truck
exports.addTruck = async (req, res) => {
  try {
    const truck = new Truck(req.body);

    await truck.save();

    res.status(201).json({
      success: true,
      truck,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// 📋 Get All Trucks
exports.getTrucks = async (req, res) => {
  try {
    const trucks = await Truck.find()
      .populate("driver");

    res.json(trucks);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// ✏️ Update Truck
exports.updateTrucks = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTruck =
      await Truck.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
        }
      );

    if (!updatedTruck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found",
      });
    }

    res.json({
      success: true,
      truck: updatedTruck,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// ❌ Delete Truck
exports.deleteTrucks = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTruck =
      await Truck.findByIdAndDelete(id);

    if (!deletedTruck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found",
      });
    }

    res.json({
      success: true,
      message: "Truck deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE TRUCK
exports.deleteTruck = async (req, res) => {
  try {
    await Truck.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Truck deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};