import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => {
    // Use environment variable for production
    const socketUrl =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

    // Debug log (very useful for checking URL)
    console.log("Socket connecting to:", socketUrl);

    return io(socketUrl, {
      transports: ["websocket"],       // ensures stable connection in production
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};