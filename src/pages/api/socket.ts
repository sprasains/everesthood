import { Server } from "socket.io";

export default function handler(req: any, res: any) {
  if (!globalThis.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });
    (globalThis as any).io = io;

    io.on("connection", (socket: any) => {
      socket.on("join_post", (postId: string) => {
        socket.join(postId);
      });
      socket.on("leave_post", (postId: string) => {
        socket.leave(postId);
      });
    });
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
