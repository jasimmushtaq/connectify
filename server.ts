import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("./prisma/generated/client");
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});
const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Serve Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function startServer() {
  console.log("Starting server...");
  try {
    await prisma.$connect();
    console.log("Connected to database successfully.");
  } catch (err) {
    console.error("Database connection error:", err);
  }
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const user = await prisma.user.create({
        data: { 
          email, 
          password, 
          name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        }
      });
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
    } catch (error) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.post("/api/upload", authenticate, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ user });
  });

  // User Routes
  app.get("/api/users", authenticate, async (req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatar: true, status: true }
    });
    res.json(users);
  });

  // Conversation Routes
  app.get("/api/conversations", authenticate, async (req, res) => {
    try {
      const conversations = await prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", authenticate, async (req: any, res) => {
    const { participants } = req.body;
    try {
      const conversation = await prisma.conversation.create({
        data: {
          participants: Array.isArray(participants) ? participants.join(', ') : participants
        }
      });
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' }
      });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", authenticate, async (req: any, res) => {
    const { id } = req.params;
    const { content, type, mediaUrl } = req.body;
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: id,
          senderId: req.user.id,
          senderName: req.user.name,
          content,
          type: type || "text",
          mediaUrl
        }
      });
      
      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() }
      });

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/messages/:id/react", authenticate, async (req: any, res) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    try {
      const message = await prisma.message.findUnique({ where: { id } });
      if (!message) return res.status(404).json({ error: "Message not found" });

      let reactions = message.reactions ? JSON.parse(message.reactions) : {};
      
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      const index = reactions[emoji].indexOf(userId);
      if (index > -1) {
        reactions[emoji].splice(index, 1);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji].push(userId);
      }

      const updatedMessage = await prisma.message.update({
        where: { id },
        data: { reactions: JSON.stringify(reactions) }
      });

      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to react" });
    }
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    let currentUserId: string | null = null;

    socket.on("user:online", async (userId) => {
      currentUserId = userId;
      await prisma.user.update({
        where: { id: userId },
        data: { status: "online" }
      });
      io.emit("user:status", { userId, status: "online" });
    });

    socket.on("disconnect", async () => {
      if (currentUserId) {
        await prisma.user.update({
          where: { id: currentUserId },
          data: { status: "offline" }
        });
        io.emit("user:status", { userId: currentUserId, status: "offline" });
      }
    });

    socket.on("message:send", (data) => {
      socket.broadcast.emit("message:receive", data);
    });

    socket.on("reaction:send", (data) => {
      socket.broadcast.emit("reaction:receive", data);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.VERCEL !== "1") {
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

export default app;

if (process.env.NODE_ENV !== "production") {
  startServer().catch(console.error);
} else {
  // Setup routes even without startServer
  startServer().catch(console.error);
}
