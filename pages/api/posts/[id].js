import dbConnect from "../../../lib/dbConnect";
import Post from "../../../models/Post";
import Comment from "../../../models/Comment";

import Reaction from "../../../models/Reaction";
import ComReaction from "../../../models/ComReaction";

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
  switch (method) {
    case "PUT" /* Edit a model by its ID */:
      try {
        const post = await Post.findByIdAndUpdate(id, req.body, {
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
        const deletedPostReact = await Reaction.deleteMany({ post: id }); //clean post reactions form DB
        const comments = await Comment.find({ post: id });
        comments.forEach(async (element) => {
          const deletedComReact = await ComReaction.deleteMany({
            comment: element._id,
          }); //clean comment reactions form DB
        });
        const deletedComments = await Comment.deleteMany({ post: id }); // clean comments of the post from DB

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
