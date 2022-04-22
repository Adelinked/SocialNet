import dbConnect from "../../../../lib/dbConnect";
import Post from "../../../../models/Post";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  await dbConnect();
  profile = await Profile.find({ user: session.user.userId });
  const { _id } = profile[0];

  switch (method) {
    case "PUT" /* Edit a model by its ID */:
      try {
        const post = await Post.findByIdAndUpdate(id, _id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!post) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: post });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "DELETE": // Delete a model by its ID
      try {
        const deletedPost = await Post.deleteOne({ _id: id });
        if (!deletedPost) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
