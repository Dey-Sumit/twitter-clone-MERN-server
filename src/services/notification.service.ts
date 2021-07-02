import Notification from "@models/Notification";
import User from "@models/User";
import mongoose from "mongoose";

export const createNotification = async (
  userTo: string,
  userFrom: string,
  notificationType: "follow" | "like" | "comment",
  entityId: mongoose.Schema.Types.ObjectId
) => {
  var data = {
    userFrom,
    notificationType,
    entityId,
  };
  // TODO can be cleaner code
  try {
    // await Notification.deleteOne(data);
    // await User.deleteOne("")
    new Notification(data)
    // TODO delete noti
  } catch (error) {
    throw error;
  }
  try {
    // TODO create noti
    // return await Notification.create(data);
  } catch (error) {
    throw error;
  }
};
