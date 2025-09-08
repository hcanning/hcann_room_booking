import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertBookingSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'university-booking-secret-key',
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      res.json({ id: admin.id, username: admin.username });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const admin = await storage.getAdminByUsername('hcanning'); // Since we only have one admin
      if (!admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json({ id: admin.id, username: admin.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Room routes
  app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      
      // Get today's bookings to show availability
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = await storage.getBookingsByDate(today);
      
      const roomsWithAvailability = rooms.map(room => {
        const roomBookings = todayBookings.filter(booking => 
          booking.roomId === room.id && booking.status === 'confirmed'
        );
        
        // Create time slots for today (9 AM to 5 PM)
        const timeSlots = [];
        for (let hour = 9; hour < 17; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          const isBooked = roomBookings.some(booking => 
            booking.startTime <= timeSlot && booking.endTime > timeSlot
          );
          timeSlots.push({
            time: timeSlot,
            available: !isBooked
          });
        }

        return {
          ...room,
          todayAvailability: timeSlots
        };
      });

      res.json(roomsWithAvailability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get('/api/rooms/:id', async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  // Booking routes
  app.get('/api/bookings', requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', requireAuth, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check for conflicts
      const existingBookings = await storage.getBookingsByRoom(bookingData.roomId);
      const hasConflict = existingBookings.some(booking => 
        booking.date === bookingData.date &&
        booking.status === 'confirmed' &&
        (
          (bookingData.startTime >= booking.startTime && bookingData.startTime < booking.endTime) ||
          (bookingData.endTime > booking.startTime && bookingData.endTime <= booking.endTime) ||
          (bookingData.startTime <= booking.startTime && bookingData.endTime >= booking.endTime)
        )
      );

      if (hasConflict) {
        return res.status(409).json({ message: "Time slot is already booked" });
      }

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.patch('/api/bookings/:id', requireAuth, async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete('/api/bookings/:id', requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
