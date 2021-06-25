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

// export const generatePaginationOfPosts = async (searchObj, pageNumber, pageSize = 10, count) => {
//   const posts = await Post.find(searchObj)
//     .limit(pageSize)
//     .skip(pageSize * pageNumber)
//     .populate("user")
//     .populate("tags")
//     .sort("-createdAt");

//   return {
//     posts,
//     page: pageNumber,
//     pages: Math.ceil(count / pageSize) - 1,
//   };
// };
