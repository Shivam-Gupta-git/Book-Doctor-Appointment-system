import mongoose from "mongoose";

const doctorDetailsScheem = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
  },
  gender: {
    type: String,
    require: true,
  },
  age: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  address: {
    street: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    state: {
      type: String,
      require: true,
    },
    pinCode: {
      type: String,
      require: true,
    },
    country: {
      type: String,
      require: true,
    },
  },
  department: {
    type: String,
    require: true,
  },
  specialization: {
    type: Array,
    require: true,
  },
  qualification: {
    type: Array,
    require: true,
  },
  experience: {
    type: String,
    require: true,
  },
  bio: {
    type: String,
  },
  availableDays: {
    type: Array,
    require: true,
  },
},{minimize: false}
)
export const Doctordetails = mongoose.models.Doctordetails || mongoose.model("Doctordetails", doctorDetailsScheem)