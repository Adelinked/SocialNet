import dbConnect from "../../../../../lib/dbConnect";
import Profile from "../../../../../models/Profile";

import ComReaction from "../../../../../models/ComReaction";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { method } = req;
  const { comment, type } = req.body;
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  await dbConnect();
  let profile;
  try {
    profile = await Profile.find({ user: session.user.userId });
    const { _id } = profile[0];
    let ifExists, id, comReaction;
    switch (method) {
      case "GET":
        try {
          const comReactions = await ComReaction.find({
            comment: req.query.comId,
          }).populate({
            path: "profile",
            select: "displayName  ",
          }); // find all the data in our database
          res.status(200).json({ success: true, data: comReactions });
        } catch (error) {
          res.status(400).json({ success: false });
        }
        break;

      case "POST":
        const commentAndProfile = comment + _id;
        ifExists = await ComReaction.find({
          commentAndProfile: commentAndProfile,
        });

        if (ifExists.length > 0) {
          const dbType = ifExists[0].type;
          id = String(ifExists[0]._id);
          if (type === dbType) {
            const deletedReaction = await ComReaction.deleteOne({ _id: id });
            res.status(200).json({ success: true, data: {} });
          } else {
            /* update model in the database */

            comReaction = await ComReaction.findByIdAndUpdate(
              id,
              { type: type },
              {
                new: true,
                runValidators: true,
              }
            );
            res.status(201).json({ success: true, data: comReaction });
          }
        } else {
          /* create a new model in the database */
          comReaction = await ComReaction.create({
            type,
            profile: _id,
            comment: comment,
            commentAndProfile: commentAndProfile,
          });

          res.status(201).json({ success: true, data: comReaction });
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
