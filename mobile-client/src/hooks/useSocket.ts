import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import socket from "../services/socket";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const connectToSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync("jwt");
        if (token) {
          // Attach the JWT to the handshake payload
          socket.auth = { token };
          socket.connect();
        }
      } catch (error) {
        console.error("Error fetching token for socket connection:", error);
      }
    };

    connectToSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("connect_error", (err) => {
      console.error("🚨 Socket Connection Error:", err.message);
    });

    // Cleanup function to disconnect when the user leaves the screen/logs out
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
