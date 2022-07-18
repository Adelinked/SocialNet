import dbConnect from "../../../lib/dbConnect";
import Profile from "../../../models/profile";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { method, query } = req;
  await dbConnect();
  const session = await getSession({ req });

  switch (method) {
    case "GET":
      try {
        const name = query.diplayName;
        if (name) {
          const profiles = await Profile.find({
            displayName: { $regex: new RegExp("" + name.toLowerCase(), "i") },
          });
          res.status(200).json({ success: true, data: profiles });
        } else if (name === undefined) {
          /* find all the data in our database */
          const profiles = await Profile.find({
            user: { $ne: session?.user.userId },
          }).sort({ updatedAt: -1 });
          res.status(200).json({ success: true, data: profiles });
        }
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      if (!session) {
        return res.status(401).json({ msg: "Invalid Authentication!" });
      }
      const { user } = session;
      const newReq = { ...req.body, onLine: true, user: user.userId };

      try {
        const profile = await Profile.create(
          newReq
        ); /* create a new model in the database */
        res.status(201).json({
          success: true,
          data: profile,
        });
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
