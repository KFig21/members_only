const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, maxLength: 280 },
  timestamp: { type: Date, default: Date.now, required: true },
  edited: { type: Boolean, default: false },
  editUser: { type: Schema.Types.ObjectId, ref: "User" },
  editedtimestamp: { type: Date, default: Date.now },
});

MessageSchema.virtual("date").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime.DATETIME_MED
  );
});

MessageSchema.virtual("editDate").get(function () {
  return DateTime.fromJSDate(this.editedtimestamp).toLocaleString(
    DateTime.DATETIME_MED
  );
});

module.exports = mongoose.model("Message", MessageSchema);
