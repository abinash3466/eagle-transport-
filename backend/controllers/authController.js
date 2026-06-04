const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {
        id: user._id,
    },

    process.env.JWT_SECRET,

    {
        expiresIn: "7d",
    }
);

res.json({
    success: true,
    token,
    user,
});