import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Tag from "models/Tag";

// @ route GET /api/tags/
// @ desc returns top 5 tags sorted by number of posts
// @ access public

export const getTopTags = expressAsyncHandler(
  async (req: Request, res: Response) => {
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
  }
);
// @ route GET /api/tags/:tag
// @ desc get all posts under a tag
// @ access public

export const getPostsByTag = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { tag }: { tag?: string } = req.query;
    const data = await Tag.find({ name: tag }).populate({
      path: "posts",
      populate: [{ path: "tags", select: "name" }, { path: "user" }],
    });
    console.log(data);

    if (data.length == 0)
      return res.status(404).json({ msg: "Tag does not exist" });
    return res.status(200).json(data[0]);
  }
);
