import expressAsyncHandler from "express-async-handler";
import createError from "http-errors";
import Tag from "@models/Tag";

// @ route GET /api/tags/
// @ desc returns top 5 tags sorted by number of posts
// @ access public

export const getTopTags = expressAsyncHandler(async (req, res) => {
  const tags = await Tag.aggregate([
    {
      $project: {
        length: { $size: "$posts" },
        // posts: 1,
        name: 1,
      },
    },
    { $sort: { length: -1 } },
    { $limit: 10 },
  ]);
  // const tags = await Tag.find({}).sort({ totalPosts: -1 }).limit(5);

  return res.status(200).json(tags);
});

// @ route GET /api/tags/:tag
// @ desc get all posts under a tag
// @ access public

export const getPostsByTag = expressAsyncHandler(async (req, res) => {
  const { tag } = req.params;
  const data = await Tag.find({ name: tag }).populate({
    path: "posts",
    populate: [{ path: "tags", select: "name" }, { path: "user",select:"profilePicture name username createdAt" }],
  });

  if (data.length == 0) throw new createError.NotFound("Tag does not exist");
  return res.status(200).json(data[0]);
});
