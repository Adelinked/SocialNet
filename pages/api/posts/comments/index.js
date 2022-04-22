import dbConnect from "../../../../lib/dbConnect";
import Profile from "../../../../models/profile";
import Comment from "../../../../models/Comment";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { method } = req;
  const { post, text } = req.body;
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  await dbConnect();
  let profile;
  try {
    profile = await Profile.find({ user: session.user.userId });
    const { _id } = profile[0];
    let ifExists, id, comment;
    switch (method) {
      case "GET":
        try {
          const comments = await Comment.find({
            post: req.query.postId,
          })
            .sort({ updatedAt: -1 })
            .populate({
              path: "profile",
              select: "displayName  imgUrl age someAbout",
            }); // find all the data in our database
          res.status(200).json({ success: true, data: comments });
        } catch (error) {
          res.status(400).json({ success: false });
        }
        break;

      case "POST":
        try {
          comment = await Comment.create({
            text,
            profile: _id,
            post: post,
          });

          res.status(201).json({ success: true, data: comment });
        } catch (error) {
          res.status(400).json({ msg: "Invalid request!" });
        }
        break;
      default:
        res.status(400).json({ msg: "Invalid request!" });
        break;
    }
  } catch (error) {
    res.status(400).json({ success: false });
  }
}
