import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import { connectToDb } from "./src/config/db.js";
import { initSocket } from "./src/sockets/socket.js";

const PORT = process.env.PORT || 5000;

// DB Connection
connectToDb();

// HTTP Server
const server = http.createServer(app);

// Socket Init
initSocket(server);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
