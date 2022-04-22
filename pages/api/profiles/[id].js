import dbConnect from "../../../lib/dbConnect";
import Profile from "../../../models/profile";
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
    case "GET" /* Get a model by its ID */:
      try {
        const profile = await Profile.findById(id);
        if (!profile) {
          return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: profile });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case "PUT" /* Edit a model by its ID */:
      try {
        const profile = await Profile.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!profile) {
          return res
            .status(400)
            .json({ success: false, msg: "Error updating profile" });
        }
        res.status(200).json({ success: true, data: profile });
      } catch (error) {
        res.status(400).json({ success: false, msg: "Error updating profile" });
      }
      break;

    case "DELETE" /* Delete a model by its ID */:
      try {
        const deletedProfile = await Profile.deleteOne({ _id: id });
        if (!deletedProfile) {
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
