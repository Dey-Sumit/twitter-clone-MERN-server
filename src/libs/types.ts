import { Request } from "express";
import mongoose from "mongoose";
type mongoose_id = string | mongoose.Types.ObjectId;

export interface ExtendedRequest extends Request {
  // not Express.Request 👆
  user: any;
  file: any;
}

// https://stackoverflow.com/questions/54030381/unable-to-extend-express-request-in-typescript

export interface IUser {
  _id: mongoose_id;
  name: string;
  username: string;
  password: string;
  profilePicture: string;
  bio: string;
  email: string;
  following: mongoose_id[];
  followers: mongoose_id[];
  likes: mongoose_id[];
  notifications: mongoose_id[];
  posts: mongoose_id[];
  checkPassword?: (password: string) => Promise<boolean>;
  // virtual fields
  noOfFollowers: number;
  noOfFollowing: number;
  noOPosts: number;
  noOfNotifications: number;
}
export interface IPost {
  _id?: mongoose_id;
  user: mongoose_id;
  cloudinaryImageId?: string;
  content: string;
  attachmentURL?: string;
  createdAt?: Date;
  likes?: [
    {
      user: mongoose.Types.ObjectId;
    }
  ];
  comments?: IComment[];
  tags?: [
    {
      tag: mongoose.Types.ObjectId;
    }
  ];
}
export interface IComment {
  user: mongoose.Types.ObjectId;
  content: string;
  date?: Date;
  _id?: string;
}

export interface ITag {
  _id?: mongoose.Types.ObjectId;
  name: string;
  posts: [IPost];
  length?: number;
}
// npm i @hookform/resolvers axios classnames js-cookie react-hook-form react-icons  react-infinite-scroll-component  swr  yup

// @tailwindcss/jit @types/js-cookie @types/react  autoprefixer  eslint  postcss tailwindcss typescript
