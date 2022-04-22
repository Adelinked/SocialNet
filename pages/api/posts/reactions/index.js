import dbConnect from "../../../../lib/dbConnect";
import Profile from "../../../../models/profile";
import Post from "../../../../models/Post";
import Reaction from "../../../../models/Reaction";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { method } = req;
  const { post, type } = req.body;
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  await dbConnect();
  let profile;
  try {
    profile = await Profile.find({ user: session.user.userId });
    const { _id } = profile[0];
    let ifExists, id, reaction;
    switch (method) {
      case "GET":
        try {
          const reactions = await Reaction.find({
            post: req.query.postId,
          }).populate({
            path: "profile",
            select: "displayName  ",
          }); // find all the data in our database
          res.status(200).json({ success: true, data: reactions });
        } catch (error) {
          res.status(400).json({ success: false });
        }
        break;

      case "POST":
        const postAndProfile = post + _id;
        ifExists = await Reaction.find({
          postAndProfile: postAndProfile,
        });

        if (ifExists.length > 0) {
          id = String(ifExists[0]._id);
          if (type === ifExists[0].type) {
            const deletedReaction = await Reaction.deleteOne({ _id: id });
            res.status(200).json({ success: true, data: {} });
          } else {
            /* update model in the database */
            reaction = await Reaction.findByIdAndUpdate(
              id,
              { type: type },
              {
                new: true,
                runValidators: true,
              }
            );
            res.status(201).json({ success: true, data: reaction });
          }
        } else {
          /* create a new model in the database */

          reaction = await Reaction.create({
            type,
            profile: _id,
            post: post,
            postAndProfile: postAndProfile,
          });

          res.status(201).json({ success: true, data: reaction });
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
