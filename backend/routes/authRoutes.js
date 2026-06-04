const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

/* --------------------------------
   OWNER LOGIN
-------------------------------- */

router.post("/login", async (req, res) => {
  try {

    const { username, password } = req.body;

    // DEMO ADMIN LOGIN

    if (
      username !== "eagleadmin" ||
      password !== "Admin@1234"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // JWT TOKEN

    const token = jwt.sign(
      {
        id: "owner123",
        role: "owner",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,

      token,

      user: {
        id: "owner123",
        username: "eagleadmin",
        role: "owner",
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;