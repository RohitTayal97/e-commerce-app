const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 80 },
  last_name: { type: String, required: true, maxlength: 80 },
  day_of_birth: { type: Number, required: true, max: 31 },
  month_of_birth: { type: Number, required: true, max: 12 },
  year_of_birth: { type: Number, required: true, min: 1900 },
  email: { type: String, required: true, maxlength: 255 },
  street: { type: String, required: true, maxlength: 50 },
  city: { type: String, required: true, maxlength: 40 },
  zip: { type: String, required: true, maxlength: 10 },
  state: { type: String, required: true, maxlength: 40 },
  country: { type: String, required: true, maxlength: 2 },
  customer_id: { type: String, required: false },
});

module.exports = mongoose.model("user", userSchema);
