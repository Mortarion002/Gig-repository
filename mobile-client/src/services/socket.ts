import { io, Socket } from 'socket.io-client';

// Use your local network IP if testing on a physical device, or 10.0.2.2 for Android emulator
const SOCKET_URL = 'http://localhost:4000/api';

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  // Optional but recommended: Specify transports to avoid long-polling fallback issues in React Native
  transports: ['websocket'], 
});

export default socket;