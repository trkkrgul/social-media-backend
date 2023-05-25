const postLikesComments = [
  {
    $lookup: {
      from: "comments",
      let: { post_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$post", "$$post_id"] }],
            },
          },
        },
        {
          $match: {
            $or: [
              { parentComment: { $exists: false } },
              { parentComment: null },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
        {
          $lookup: {
            from: "comments",
            let: { parent_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$parentComment", "$$parent_id"] }],
                  },
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "user",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $addFields: {
                  user: { $arrayElemAt: ["$user", 0] },
                },
              },
            ],
            as: "replies",
          },
        },
      ],
      as: "comments",
    },
  },
  {
    $lookup: {
      from: "likes",
      let: { post_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$targetType", "post"] },
                { $eq: ["$targetId", "$$post_id"] },
                { $eq: ["$isDislike", false] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ],
      as: "likers",
    },
  },
  {
    $lookup: {
      from: "likes",
      let: { post_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$targetType", "post"] },
                { $eq: ["$targetId", "$$post_id"] },
                { $eq: ["$isDislike", true] },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
      ],
      as: "dislikers",
    },
  },
];

export default postLikesComments;
