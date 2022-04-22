import mongoose from "mongoose";
const profileSchema = mongoose.Schema(
  {
    displayName: {
      type: String,
      unique: true,
    },
    age: {
      type: Number,
    },
    imgUrl: {
      type: String,
    },
    someAbout: {
      type: String,
    },
    onLine: { type: Boolean },
    user: { type: mongoose.Types.ObjectId, ref: "users", unique: true },
  },
  { timestamps: true }
);
profileSchema.virtual("postsPublished", {
  ref: "Post", //The Model to use
  localField: "_id", //Find in Model, where localField
  foreignField: "profile", // is equal to foreignField
});

profileSchema.virtual("ReactionsMade", {
  ref: "Reaction", //The Model to use
  localField: "_id", //Find in Model, where localField
  foreignField: "profile", // is equal to foreignField
});

profileSchema.virtual("CommentsMade", {
  ref: "Comment", //The Model to use
  localField: "_id", //Find in Model, where localField
  foreignField: "profile", // is equal to foreignField
});

profileSchema.virtual("ReactionsMadeCom", {
  ref: "ComReaction", //The Model to use
  localField: "_id", //Find in Model, where localField
  foreignField: "profile", // is equal to foreignField
});

// Set Object and Json property to true. Default is set to false
profileSchema.set("toObject", { virtuals: true });
profileSchema.set("toJSON", { virtuals: true });

export default mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);
