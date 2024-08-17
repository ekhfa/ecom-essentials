import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import { Server, Socket } from "socket.io";

const app = express();
const prisma = new PrismaClient();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:9090"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// serve static files from public folder
app.use(express.static("public"));
app.use("/images", express.static("images"));

app.use("/", productRoutes);
app.use("/", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:9090"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const userSockets = new Map(); // Map to store user IDs and their associated socket IDs

function getUserIdBySocketId(socketId: string) {
  console.log("Function Socket Id: ", socketId);
  // Find user ID by socket ID in the userSockets map
  for (const [userId, id] of userSockets.entries()) {
    if (id === socketId) {
      return userId;
    }
  }
  return null;
}

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("authenticate", async (token: string) => {
    try {
      const decodedToken: any = jwt.verify(token, "ekh12");

      const userId = decodedToken.userId;

      const userProfile = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          role: true,
        },
      });

      if (!userProfile) {
        socket.emit("unauthorized", "User profile not found");
        return;
      }

      if (userProfile.role === "admin") {
        socket.join("adminRoom");
        console.log("Admin joined adminRoom");
      } else {
        socket.join("userRoom");
        console.log("User Join User Room");
        // if (userSockets.has(userId)) {
        //   const prevSocketId = userSockets.get(userId);
        //   console.log("Prev Socket ID: ", prevSocketId);
        //   console.log(`User ${userId} reconnected with socket ID ${socket.id}`);
        //   userSockets.set(userId, socket.id);
        // } else {
        //   userSockets.set(userId, socket.id);
        //   console.log(
        //     `User ${userId} authenticated with socket ID ${socket.id}`
        //   );
        // }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      socket.emit("unauthorized", "Unauthorized: Invalid token");
    }
  });

  socket.on("orderPlaced", (orderData) => {
    console.log(
      `Order placed: Product Id ${orderData.productId} by User ${orderData.userId}`
    );
    console.log("Product details:", orderData.productDetails);
    io.to("adminRoom").emit("orderPlaced", orderData);
  });

  socket.on("orderStatusChanged", async ({ productId, status }) => {
    console.log(
      `Order status changed: Product Id ${productId}, Status ${status}`
    );

    // console.log(userSockets);

    // const userId = getUserIdBySocketId(socket.id);
    // console.log("userId:", userId);

    // if (userId) {
    //   const userSocketId = userSockets.get(userId);
    //   console.log("User Socket Id: ", userSocketId);
    //   if (userSocketId) {
    io.to("userRoom").emit("orderStatusChanged", { productId, status });
    //   }
    // }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user's socket ID from the map on disconnect
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`Removed socket ID ${socket.id} for User ${userId}`);
      }
    }
  });
});

const PORT = process.env.PORT || 9090;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
