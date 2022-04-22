import dbConnect from "../../../../lib/dbConnect";
import Comment from "../../../../models/Comment";
import Profile from "../../../../models/profile";
import ComReaction from "../../../../models/ComReaction";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;
  const { text } = req.body;
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  await dbConnect();
  const profile = await Profile.find({ user: session.user.userId });
  const { _id } = profile[0];

  switch (method) {
    case "PUT" /* Edit a model by its ID */:
      try {
        const comment = await Comment.findByIdAndUpdate(
          id,
          { text: text },
          {
            new: true,
            runValidators: true,
          }
        );
        if (!comment) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: comment });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "DELETE": // Delete a model by its ID
      try {
        const deletedComReact = await ComReaction.deleteMany({ comment: id }); //clean comment reactions form DB
        console.log("comReact", deletedComReact);
        const deletedComment = await Comment.deleteOne({ _id: id });
        if (!deletedComment) {
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
