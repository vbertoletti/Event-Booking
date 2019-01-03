const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event"
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  //so mongoose will provide a created/updated timestamp
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
