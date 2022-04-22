import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
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
    comreaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comReaction",
    },
    text: { type: String },
  },
  { timestamps: true }
);

global.Comment = global.Comment || mongoose.model("Comment", CommentSchema);

export default global.Comment;
