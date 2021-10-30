const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 12 },
  password: { type: String, required: true },
  member: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
  emoji: {
    type: String,
    required: true,
    maxLength: 2,
    default: "🤖",
  },
});

module.exports = mongoose.model("User", UserSchema);
