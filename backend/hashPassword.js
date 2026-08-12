const bcrypt = require("bcryptjs");

async function generateHash() {
    const hash = await bcrypt.hash("Owner@123", 10);

    console.log(hash);
}

generateHash();