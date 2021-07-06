import expressAsyncHandler from "express-async-handler";
import { Response } from "express";

import { ExtendedRequest } from "@libs/types";
import Notification from "@models/Notification";
import User from "@models/User";

/**
 * @method PUT
 * @access Private
 * @description markAsRead
 */
export const markAsRead = expressAsyncHandler(async (req: ExtendedRequest, res: Response) => {
  // check if the notification belong to the auth user

  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.sendStatus(204);
});

/**
 * @method GET
 * @access Private
 * @description get notifications
 */
export const getNotifications = expressAsyncHandler(async (req: ExtendedRequest, res: Response) => {
  const unreadOnly = req.query.unreadOnly !== undefined || req.query.unreadOnly == "true";
  const user = await User.findById(req.user._id).populate({
    path: "notifications",
    options: {
      sort: {
        createdAt: -1,
      },
    },
    populate: {
      path: "userFrom",
      select: "name profilePicture",
    },
  });
  if (unreadOnly) {
    //@ts-ignore
    const unreadNotifications = user.notifications.filter((notification) => !notification.read);
    return res.json(unreadNotifications);
  }
  return res.json(user.notifications);
});

/**
 * @method GET
 * @access Private
 * @description get unread notifications
 */
export const getUnreadNotifications = expressAsyncHandler(
  async (req: ExtendedRequest, res: Response) => {
    // SampleModel.find( { 'dates.date': { $gte: 'DATE_VALUE' } } )
    const user = await User.findById(req.user._id).populate("notifications", "read");

    //@ts-ignore
    const unreadNotifications = user.notifications.filter((notification) => !notification.read);

    //TODO ask on StackOverflow for any mongoose soln
    // const notis = await User.findById(req.user._id).populate("notifications", {
    //   match: { read: false },
    // });
    // console.log({ notis });

    res.json({ noOfUnreadNotifications: unreadNotifications.length });
  }
);
