import mongoose from "mongoose";
const Schema = mongoose.Schema;
// TODO add ts
const NotificationSchema = new Schema(
  {
    userFrom: { type: Schema.Types.ObjectId, ref: "User" },
    notificationType: String,
    read: { type: Boolean, default: false },
    entityId: Schema.Types.ObjectId,
    // message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);

// one noti -> 5 users[] // 4 noti object
// update every user // https://medium.com/@salonimalhotra1ind/update-multiple-documents-in-mongoose-ea37c04a154f
