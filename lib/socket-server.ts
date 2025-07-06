import { Server } from "socket.io";

let io: Server | null = null;

export function getSocketServer(server: any) {
  if (!io) {
    io = new Server(server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    io.on("connection", (socket) => {
      // Expect client to emit 'join_user' with their userId
      socket.on("join_user", (userId: string) => {
        socket.join(userId);
      });
      socket.on("leave_user", (userId: string) => {
        socket.leave(userId);
      });
    });
  }
  return io;
}
