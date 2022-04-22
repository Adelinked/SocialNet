import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "guest",
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

//export default mongoose.models.User || mongoose.model("User", userSchema);

global.User = global.User || mongoose.model("User", UserSchema);

export default global.User;
