import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket_io",
      transports: ["websocket"],
    });
  }
  return socket;
}

export function joinUserRoom(userId: string) {
  const s = getSocket();
  s.emit('join_user', userId);
}

export function leaveUserRoom(userId: string) {
  const s = getSocket();
  s.emit('leave_user', userId);
}
