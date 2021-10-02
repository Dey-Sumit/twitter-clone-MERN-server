import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

import { IUser } from "@libs/types";
import User from "@models/User";

let randomString = (Math.random() + 1).toString(36).substring(4);

type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: `https://avatars.dicebear.com/api/avataaars/${randomString}.svg`,
      // "https://images.vexels.com/media/users/3/145908/preview2/52eabf633ca6414e60a7677b0b917d92-male-avatar-maker.jpg",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    // people follow this user
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  {
    id: false,
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

// UserSchema.set("toObject", { virtuals: true });
// UserSchema.set("toJSON", { virtuals: true });
// Virtual
UserSchema.virtual("noOfFollowers").get(function (this: UserDocument) {
  return this.followers?.length;
});
UserSchema.virtual("noOfFollowing").get(function (this: UserDocument) {
  return this.following?.length;
});
UserSchema.virtual("noOPosts").get(function (this: UserDocument) {
  return this.posts?.length;
});
UserSchema.virtual("noOfNotifications").get(function (this: UserDocument) {
  return this.notifications?.length;
});
// UserSchema.virtual("noOfNotifications1").get(async function (this: UserDocument) {
//   const x = this.getNotifications();

//   return x;
// });
// UserSchema.virtual("noOfUnreadNotifications").get(async function (this: UserDocument) {
//   const user = await User.findById(this._id).populate("notifications", "read");

//   const unreadNotifications = user.notifications.filter((notification) => !notification.read);

//   return unreadNotifications.length;
// });

// methods

UserSchema.methods.checkPassword = async function (enteredPassword) {
  const user = await User.findOne({ username: this.username }).select("password");

  return await bcrypt.compare(enteredPassword, user.password);
};
// UserSchema.methods.getNotifications = async function () {
//   const user = await User.findById(this._id).populate("notifications", "read");
//   const unreadNotifications = user.notifications.filter((notification) => !notification.read);
//   console.log(unreadNotifications);

//   return unreadNotifications.length;
// };
// UserSchema.method("getNotifications1", function (cb) {
//   User.findById(this._id, function (err, notebook) {
//     cb(notebook);
//   });
// });
// UserSchema.getNotifications1(function (data) {
//   return "hello";
// });

// middleware before saving the data
// hash the password during registration
UserSchema.pre("save", async function (this, next: Function) {
  // run oly if the password field is modified (ex: during update profile)
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// UserSchema.method("getNotifications", function (cb) {
//   User.findById(this._id, function (err, notebook) {
//     cb(notebook);
//   });
// });

// UserSchema.pre("deleteOne", async function (next) {
//   console.log("removing");

//   mongoose
//     .model("Post")
//     .deleteMany(
//       {
//         user: this._id,
//       },
//       (err) => console.log(err)
//     )
//     .exec();
//   next();
// });
//? Fix this type
export default mongoose.model<UserDocument>("User", UserSchema);
// cascading
