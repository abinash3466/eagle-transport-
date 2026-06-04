const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const axios = require("axios");
const Truck = require("../models/Truck");

const {
  makeWhatsAppLink,
  bookingConfirmedMessage,
} = require("../utils/whatsappHelper");

const generateBookingId = () => {
  return "ET" + Date.now().toString().slice(-6);
};

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.createBooking = async (req, res) => {
  try {
    const getCoordinates = async (place) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: place,
          format: "json",
          limit: 1,
        },
      }
    );

    if (!response.data.length) return null;

    return {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon),
    };
  } catch (err) {
    return null;
  }
};

    let pickupCoords = null;

    let dropCoords = null;

    try {

      pickupCoords =
        await getCoordinates(
          req.body.pickup
        );

      dropCoords =
        await getCoordinates(
          req.body.drop
        );

    } catch (err) {

      console.log(
        "Location fetch failed"
      );
    }

    const booking = await Booking.create({
      ...req.body,
      pickupCoords,
      dropCoords,
      bookingId: generateBookingId(),
      otp: generateOtp(),
    });

    await Notification.create({
      type: "new_booking",
      message: `New booking created - ${booking.bookingId}`,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
      whatsappLink: makeWhatsAppLink(
        booking.phone,
        bookingConfirmedMessage(booking)
      ),
    });
  } catch (error) {
    console.error("Booking create error:", error);

    res.status(500).json({
      success: false,
      message: "Booking create failed",
      error: error.message,
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("truck")
      .populate("driver")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/*
========================================
NEW AI SMART DISPATCH UPDATE
========================================
*/

exports.completeTrip = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("truck")
      .populate("driver");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "Delivered";

    if (booking.truck) {
  const Truck = require("../models/Truck");

  await Truck.findByIdAndUpdate(booking.truck, {
    location: booking.drop,

    lastGpsLocation: booking.liveLocation || {
      lat: 0,
      lng: 0,
      updatedAt: new Date(),
    },
  });
}

    if (!booking.payment) {
      booking.payment = {};
    }

    if (
      !booking.payment.paymentHistory
    ) {
      booking.payment.paymentHistory =
        [];
    }

    booking.payment.paymentHistory.push({
      amount:
        req.body.advanceAmount || 0,

      paymentMode:
        req.body.paymentMode || "Cash",

      paidAt: new Date(),
    });
    
    await booking.save();

    // UPDATE TRUCK LAST LOCATION
    if (booking.truck) {
      const truck = await Truck.findById(booking.truck._id);

      if (truck) {
        truck.currentLocation = {
  lat:
    booking.dropCoords?.lat || 8.7107,

  lng:
    booking.dropCoords?.lng || 77.4516,

  place:
    booking.drop || "Delivered Location",
};

truck.lastCompletedLocation = {
  lat:
    booking.dropCoords?.lat || 8.7107,

  lng:
    booking.dropCoords?.lng || 77.4516,

  place:
    booking.drop || "Delivered Location",
};

        truck.status = "Available";

        await truck.save();
      }
    }

    await Notification.create({
      type: "trip_completed",
      message: `Trip completed - ${booking.bookingId}`,
    });

    res.json({
      success: true,
      message: "Trip completed successfully",
      booking,
    });
  } catch (error) {
    console.error("Trip complete error:", error);

    res.status(500).json({
      success: false,
      message: "Trip complete failed",
      error: error.message,
    });
  }
};

exports.updatePayment =
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found",
        });
      }

      booking.payment = {
        ...booking.payment,

        paymentMode:
          req.body.paymentMode,

        advanceAmount:
          req.body.advanceAmount,

        balanceAmount:
          req.body.balanceAmount,

        paymentStatus:
          req.body.paymentStatus,

        gstPercentage:
          req.body.gstPercentage,

        gstAmount:
          req.body.gstAmount,

        totalWithGST:
          req.body.totalWithGST,
      };

      booking.payment.paymentHistory.push({
        amount:
          req.body.advanceAmount,

        paymentMode:
          req.body.paymentMode,
      });

      await booking.save();

      res.json({
        success: true,
        booking,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Payment update failed",
      });
    }
  };

// DELETE BOOKING
exports.deleteBooking = async (req, res) => {

  try {

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};