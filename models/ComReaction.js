import mongoose from "mongoose";

const ComReactionSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    commentAndProfile: { type: String, unique: true },
    type: { type: String },
  },
  { timestamps: true }
);
/*
module.exports = mongoose.models.Pust || mongoose.model("Pust", PustSchema);
*/

global.ComReaction =
  global.ComReaction || mongoose.model("ComReaction", ComReactionSchema);

export default global.ComReaction;
