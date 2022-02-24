import log from "@libs/logger";
import { Server, Socket } from "socket.io";

const EVENTS = {
  connection: "connection",
  disconnect: "disconnect",
  CLIENT: {
    NOTIFY: "NOTIFY",
    SET_UP: "SET_UP",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
  },
  SERVER: {
    NOTIFY_TO_CLIENT: "NOTIFY_TO_CLIENT",
    SET_UP_COMPLETE: "SET_UP_COMPLETE",
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
  },
};

const userToSocketMap: Record<string, string> = {};

function deleteByVal(val: string, obj: Record<string, string>) {
  for (var key in obj) {
    if (obj[key] == val) delete obj[key];
  }
}
function socket({ io }: { io: Server }) {
  log.info("Socket Enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    log.info(`User Connected ${socket.id}`);

    const userId = socket.handshake.query.userId as string;
    userToSocketMap[userId] = socket.id;

    socket.on(EVENTS.CLIENT.NOTIFY, ({ userTo, message }) => {
      const userToSocket = userToSocketMap[userTo];
      //   console.log("to notify", { userTo, userToSocket });
      io.to(userToSocket).emit(EVENTS.SERVER.NOTIFY_TO_CLIENT, { message });
    });

    socket.on(EVENTS.disconnect, () => {
      log.info(`User Disconnected ${socket.id} `);
      deleteByVal(socket.id, userToSocketMap);
    });
  });
}
export default socket;
