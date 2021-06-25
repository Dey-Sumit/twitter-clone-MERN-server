import { v2 as cloudinary } from "cloudinary";
import createError from "http-errors";
import expressAsyncHandler from "express-async-handler";
import { Response } from "express";

import User from "@models/User";
import { ExtendedRequest } from "@libs/types";
import Post from "@models/Post";

export const getTopUsersByFollowers = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const users = await User.aggregate([
    {
      $project: {
        noOfFollowers: { $size: "$followers" },
        // posts: 1,
        username: 1,
        profilePicture: 1,
      },
    },
    { $sort: { noOfFollowers: -1 } },
    { $limit: 10 },
  ]);

  return res.status(200).json(users);
});

export const searchUser = expressAsyncHandler(async (req, res) => {
  const q = req.query?.q?.toString();

  if (!q) throw new createError.BadRequest("pass the keyword");

  const searchObj = {
    $or: [{ name: { $regex: q, $options: "i" } }, { username: { $regex: q, $options: "i" } }],
  };
  const users = await User.find(searchObj, "profilePicture name username");
  res.status(200).json(users);
});

export const getUserById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) throw new createError.NotFound();
  return res.json(user);
});

export const deleteUserById = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  if (req.params.id !== req.user._id.toString()) throw new createError.Unauthorized();

  const user = await User.findById(req.params.id);

  if (!user) throw new createError.NotFound();

  await Post.deleteMany({ user: user._id });

  await user.remove();

  res.status(200).json({ msg: "User deleted" });
});

export const updateUserById = expressAsyncHandler(async (req: ExtendedRequest, res: Response) => {
  const { id } = req.params;

  // check auth & if it's his/her own profile
  if (req.user._id.toString() !== id) throw new createError.Unauthorized();

  const { name, username, bio } = req.body;

  let profilePicture: string;

  if (req.file) {
    const image = await cloudinary.uploader.upload(req.file.path, {
      width: 512,
      height: 512,
      crop: "fill",
    });
    profilePicture = image.secure_url;
  }

  const oldUser = await User.findById(id);

  if (!oldUser) throw new createError.NotFound();

  const profileFields = {
    name: name || oldUser.name,
    username: username || oldUser.username,
    bio: bio || oldUser.bio,
    profilePicture: profilePicture || oldUser.profilePicture,
  };

  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: profileFields,
    },
    {
      new: true,
    }
  );

  res.status(200).json(user);
});

// @ follow request PUT
// @ api/users/:id/follow
// @ private

export const toggleFollowUser = expressAsyncHandler(async (req: ExtendedRequest, res) => {
  const { id } = req.params;
  //! 1. add the user to my following list
  // const user = await User.findById(id);
  // if (!user) throw new createError.NotFound();
  // console.log(req.user.following);

  var isFollowing = req.user?.following.includes(id);
  console.log(isFollowing);

  var option = isFollowing ? "$pull" : "$addToSet";
  console.log({ option });

  req.user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [option]: {
        following: id,
      },
    },
    { new: true }
  );
  //! 2. add me to the person's followers list
  //60c9fd3b618fd83328742008 auser

  await User.findByIdAndUpdate(
    id,
    {
      [option]: {
        followers: req.user._id,
      },
    },
    { new: true }
  );

  res.json(req.user);
});

// @ return followers of an user
// @ api/users/:id/followers
// @ public

export const getFollowersById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("followers");
  if (!user) throw new createError.NotFound("User not found");
  const followers = user.followers;
  return res.json(followers);
});

// @ return followers of an user
// @ api/users/:id/followers
// @ public

export const getFollowingsById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("followings");
  if (!user) throw new createError.NotFound("User not found");
  const followings = user.following; // !following or followings
  return res.json(followings);
});
