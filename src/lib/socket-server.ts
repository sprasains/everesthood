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
  }
  return io;
}
