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
function deleteByVal(val, obj) {
  for (var key in obj) {
    if (obj[key] == val) delete obj[key];
  }
}
function socket({ io }: { io: Server }) {
  console.log("-> socket enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    console.log(`-> User Connected ${socket.id}`);
   
    const userId = socket.handshake.query.userId as string;
    userToSocketMap[userId] = socket.id;

    // var clients = io.allSockets();
    // console.log({ clients, userToSocketMap });

    socket.on(EVENTS.CLIENT.NOTIFY, ({ userTo, message }) => {
      const userToSocket = userToSocketMap[userTo];
   //   console.log("to notify", { userTo, userToSocket });
      io.to(userToSocket).emit(EVENTS.SERVER.NOTIFY_TO_CLIENT, { message });
    });

    socket.on(EVENTS.disconnect, () => {
      console.log("Disconnect ", socket.id);
      deleteByVal(socket.id, userToSocketMap);
  
    });
  });
}
export default socket;
