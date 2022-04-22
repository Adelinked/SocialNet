import dbConnect from "../../../../lib/dbConnect";
import Profile from "../../../../models/Profile";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { method, query } = req;
  await dbConnect();
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).json({ msg: "Invalid Authentication!" });
  }
  const { user } = session;
  switch (method) {
    case "GET":
      try {
        /* find all the data in our database */
        const profile = await Profile.find({ user: user.userId });
        res.status(200).json({ success: true, data: profile });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      const { user } = session;
      const newReq = { ...req.body, user: user.userId };

      try {
        const profile = await Profile.create(newReq);
        res.json({ msg: "Success! Creating profile." });
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
