import mongoose from "mongoose";

const audioPluginSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    functions: {
      type: Array,
    },
    color: {
      type: Array,
    },
    precision: {
      type: Array,
    },
    company: {
      type: String,
    },
    productURL: {
      type: String,
    },
    photoURL: {
      type: String,
    },
    oversampling: {
      type: Boolean,
    },
    favorite: {
      type: Boolean,
    },
    rating: {
      type: Number,
    },
    status: {
      type: String,
    },
    notes: {
      type: String,
    },
    identifier: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default audioPluginSchema;
