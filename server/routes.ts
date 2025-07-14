import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertUserSchema, loginSchema, insertSwapRequestSchema, insertFeedbackSchema, updateUserSchema } from "../shared/schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin status
const requireAdmin = async (req: any, res: any, next: any) => {
  const user = await storage.getUser(req.user.id);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({ message: "Account has been banned" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // User profile routes
  app.get("/api/users/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get profile" });
    }
  });

  app.put("/api/users/profile", authenticateToken, async (req: any, res) => {
    try {
      const updates = updateUserSchema.parse(req.body);
      
      const user = await storage.updateUser(req.user.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // Profile photo upload endpoint
  app.post("/api/users/profile-photo", authenticateToken, upload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert file to base64
      const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Update user's profile photo
      const user = await storage.updateUser(req.user.id, { profilePhoto: base64String });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({
        message: "Profile photo updated successfully",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to upload profile photo" });
    }
  });

  // Error handling for multer
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: "File upload error" });
    }
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    next(error);
  });

  // Search users
  app.get("/api/users/search", authenticateToken, async (req: any, res) => {
    try {
      const { skill, location, availability, page = 1, limit = 10 } = req.query;
      
      console.log('Search request:', { skill, location, availability, page, limit });
      
      const users = await storage.searchUsers({
        skill,
        location,
        availability,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      console.log(`Returning ${usersWithoutPasswords.length} users`);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error('Search error:', error);
      res.status(500).json({ message: error.message || "Search failed" });
    }
  });

  // Swap request routes
  app.post("/api/swaps/send", authenticateToken, async (req: any, res) => {
    try {
      const swapData = insertSwapRequestSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      // Prevent self-swaps
      if (swapData.senderId === swapData.receiverId) {
        return res.status(400).json({ message: "Cannot send swap request to yourself" });
      }

      const swapRequest = await storage.createSwapRequest(swapData);
      res.status(201).json(swapRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to send swap request" });
    }
  });

  app.patch("/api/swaps/:id/respond", authenticateToken, async (req: any, res) => {
    try {
      const swapId = parseInt(req.params.id);
      const { status } = req.body;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Verify user is the receiver of this swap request
      const swapRequest = await storage.getSwapRequest(swapId);
      if (!swapRequest) {
        return res.status(404).json({ message: "Swap request not found" });
      }

      if (swapRequest.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to respond to this request" });
      }

      const updatedRequest = await storage.updateSwapRequestStatus(swapId, status);
      res.json(updatedRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to respond to swap request" });
    }
  });

  app.patch("/api/swaps/:id/complete", authenticateToken, async (req: any, res) => {
    try {
      const swapId = parseInt(req.params.id);

      // Verify user is involved in this swap request
      const swapRequest = await storage.getSwapRequest(swapId);
      if (!swapRequest) {
        return res.status(404).json({ message: "Swap request not found" });
      }

      if (swapRequest.senderId !== req.user.id && swapRequest.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to complete this swap" });
      }

      if (swapRequest.status !== "accepted") {
        return res.status(400).json({ message: "Only accepted swaps can be completed" });
      }

      const updatedRequest = await storage.updateSwapRequestStatus(swapId, "completed");
      res.json(updatedRequest);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to complete swap" });
    }
  });

  app.get("/api/swaps/list", authenticateToken, async (req: any, res) => {
    try {
      const swaps = await storage.getSwapRequestsWithUsers(req.user.id);
      res.json(swaps);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get swap requests" });
    }
  });

  // Feedback routes
  app.post("/api/feedback/submit", authenticateToken, async (req: any, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        reviewerId: req.user.id,
      });

      // Verify the swap exists and user is involved
      const swapRequest = await storage.getSwapRequest(feedbackData.swapId);
      if (!swapRequest) {
        return res.status(404).json({ message: "Swap request not found" });
      }

      if (swapRequest.senderId !== req.user.id && swapRequest.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to leave feedback for this swap" });
      }

      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback/user/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const feedback = await storage.getUserFeedbackWithDetails(userId);
      res.json(feedback);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user feedback" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get users" });
    }
  });

  app.patch("/api/admin/users/:id/ban", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent admin from banning themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot ban yourself" });
      }

      await storage.banUser(userId);
      res.json({ message: "User banned successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to ban user" });
    }
  });

  app.get("/api/admin/swaps", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const swaps = await storage.getAllSwapRequestsWithUsers();
      res.json(swaps);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get all swap requests" });
    }
  });

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Not authorized as admin" });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        message: "Admin login successful",
        user: userWithoutPassword,
        token,
        isAdmin: true
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Admin login failed" });
    }
  });

  // Get all skills for moderation
  app.get("/api/admin/skills", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Flatten all skills with user info
      const skills: any[] = [];
      users.forEach(user => {
        (user.skillsOffered || []).forEach(skill => {
          skills.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            type: "offered",
            skill,
          });
        });
        (user.skillsWanted || []).forEach(skill => {
          skills.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            type: "wanted",
            skill,
          });
        });
      });
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch skills" });
    }
  });

  // Remove a skill from a user (offered or wanted)
  app.delete("/api/admin/skills/:userId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { skill, type } = req.body;
      if (!skill || !type || !["offered", "wanted"].includes(type)) {
        return res.status(400).json({ message: "Skill and type (offered/wanted) required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let updatedSkills;
      if (type === "offered") {
        updatedSkills = (user.skillsOffered || []).filter(s => s !== skill);
        await storage.updateUser(userId, { skillsOffered: updatedSkills });
      } else {
        updatedSkills = (user.skillsWanted || []).filter(s => s !== skill);
        await storage.updateUser(userId, { skillsWanted: updatedSkills });
      }
      res.json({ message: "Skill removed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to remove skill" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
