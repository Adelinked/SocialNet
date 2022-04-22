import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    postAndProfile: { type: String, unique: true },
    type: { type: String },
  },
  { timestamps: true }
);
/*
module.exports = mongoose.models.Pust || mongoose.model("Pust", PustSchema);
*/

global.Reaction = global.Reaction || mongoose.model("Reaction", ReactionSchema);

export default global.Reaction;
