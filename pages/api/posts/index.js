import dbConnect from "../../../lib/dbConnect";
import Profile from "../../../models/profile";
import Post from "../../../models/Post";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { method } = req;

  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  await dbConnect();
  let profile;
  try {
    profile = await Profile.find({ user: session.user.userId });
    const { _id } = profile[0];
    switch (method) {
      case "GET":
        try {
          const skip =
            req.query.skip && /^\d+$/.test(req.query.skip)
              ? Number(req.query.skip)
              : 0;
          const limit =
            req.query.skip && /^\d+$/.test(req.query.limit)
              ? Number(req.query.limit)
              : 0;

          const name = req.query.name;
          let result;
          if (name === undefined) {
            result = await Post.find({}, undefined, {
              skip,
              limit: limit,
            })
              .sort({ updatedAt: -1 })
              .populate({
                path: "profile",
                select: "displayName age imgUrl someAbout",
              });
          } else {
            const profileSel = await Profile.find({ displayName: name });
            const idSelected = String(profileSel[0]._id);
            result = await Post.find({ profile: idSelected }, undefined, {
              skip,
              limit: limit,
            })
              .sort({ updatedAt: -1 })
              .populate({
                path: "profile",
                select: "displayName age imgUrl someAbout",
              });
          }

          //find all the data in our database
          const posts = result.map((doc) => {
            const { profile, _doc } = doc;

            const { text, updatedAt, postImg, _id, createdAt } = _doc;
            const { displayName, imgUrl, age, someAbout } = profile;
            return {
              text,
              postImg,
              updatedAt,
              _id,
              createdAt,
              displayName,
              imgUrl,
              age,
              someAbout,
            };
          });
          res.status(200).json({ success: true, data: posts });
        } catch (error) {
          res.status(400).json({ success: false });
        }
        break;
      case "POST":
        try {
          const post = await Post.create({
            ...req.body,
            profile: _id,
          }); /* create a new model in the database */
          res.status(201).json({ success: true, data: post });
        } catch (error) {
          res.status(400).json({ success: false });
        }
        break;
      default:
        res.status(400).json({ success: false });
        break;
    }
  } catch (error) {
    res.status(400).json({ success: false });
  }
}
