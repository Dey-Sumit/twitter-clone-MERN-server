import { ITag } from "@libs/types";
import Post from "@models/Post";
import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

const TagSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Post,
    },
  ],
  totalPosts: {
    type: Number,
    default: 0,
  },
});

type TagDocument = ITag & Document;

export default mongoose.model<TagDocument>("Tag", TagSchema);
