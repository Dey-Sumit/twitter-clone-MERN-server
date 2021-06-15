import { IPost, ITag } from "@libs/types";
import Post from "@models/Post";
import Tag from "@models/Tag";

export const addTagToPost = async (post: IPost, tag: ITag) => {
  return await Post.findByIdAndUpdate(
    post._id,
    {
      $push: {
        //@ts-ignore
        tags: tag._id,
      },
    },
    {
      new: true,
    }
  ).populate("tags", "name");
};

export const addPostToTag = async (tag: ITag, post: IPost) => {
  return await Tag.findByIdAndUpdate(
    tag._id,
    {
      $push: {
        //@ts-ignore
        posts: post._id,
        $inc: { totalPosts: 1 }, // TODO dec totalPosts when the post is deleted
      },
    },
    {
      new: true,
    }
  );
};
