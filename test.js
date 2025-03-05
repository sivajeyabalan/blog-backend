const bcrypt = require("bcrypt");

// Hashing the password
const password = "sjb";
const saltRounds = 10;
bcrypt.hash(password, saltRounds, function (err, hash) {
  console.log("Hashed Password:", hash);
});
