import { type Admin, type InsertAdmin, type Room, type InsertRoom, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Room operations
  getAllRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  
  // Booking operations
  getAllBookings(): Promise<(Booking & { roomName: string })[]>;
  getBookingsByRoom(roomId: string): Promise<Booking[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private admins: Map<string, Admin>;
  private rooms: Map<string, Room>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.admins = new Map();
    this.rooms = new Map();
    this.bookings = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Create default admin
    const adminId = randomUUID();
    const defaultAdmin: Admin = {
      id: adminId,
      username: "hcanning",
      password: "technics1", // In production, this should be hashed
      createdAt: new Date(),
    };
    this.admins.set(adminId, defaultAdmin);

    // Create sample rooms
    const sampleRooms: InsertRoom[] = [
      {
        name: "Conference Room A",
        building: "Science Center",
        floor: "Floor 3",
        capacity: 12,
        imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        equipment: ["65\" Display", "Video Conf", "Whiteboard"],
        isAccessible: true,
        description: "Modern conference room with state-of-the-art AV equipment",
      },
      {
        name: "Lecture Hall B",
        building: "Science Center",
        floor: "Floor 1",
        capacity: 50,
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        equipment: ["Projector", "Audio System", "Computer"],
        isAccessible: true,
        description: "Large lecture hall with tiered seating",
      },
      {
        name: "Study Room C",
        building: "Library",
        floor: "Floor 2",
        capacity: 6,
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        equipment: ["32\" Display", "Whiteboard"],
        isAccessible: true,
        description: "Intimate study space for small groups",
      },
      {
        name: "Executive Room D",
        building: "Administration Building",
        floor: "Floor 5",
        capacity: 8,
        imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        equipment: ["75\" Display", "Video Conf", "Smart Board", "Computer"],
        isAccessible: true,
        description: "Premium executive meeting space",
      },
      {
        name: "Collaboration Space E",
        building: "Student Union",
        floor: "Floor 2",
        capacity: 15,
        imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        equipment: ["Whiteboards", "High-speed WiFi", "Power Outlets"],
        isAccessible: true,
        description: "Flexible collaboration space for group work",
      },
      {
        name: "Computer Lab F",
        building: "Engineering Building",
        floor: "Floor 1",
        capacity: 25,
        imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        equipment: ["25 Computers", "Projector", "Printer"],
        isAccessible: true,
        description: "Fully equipped computer laboratory",
      },
    ];

    sampleRooms.forEach(room => {
      const id = randomUUID();
      const fullRoom: Room = {
        ...room,
        id,
        createdAt: new Date(),
      };
      this.rooms.set(id, fullRoom);
    });

    // Create some sample bookings for today
    const today = new Date().toISOString().split('T')[0];
    const roomIds = Array.from(this.rooms.keys());
    
    const sampleBookings: InsertBooking[] = [
      {
        roomId: roomIds[0],
        userName: "Dr. Smith",
        date: today,
        startTime: "11:00",
        endTime: "12:00",
        purpose: "Faculty meeting",
      },
      {
        roomId: roomIds[2],
        userName: "John Davis",
        date: today,
        startTime: "09:00",
        endTime: "11:00",
        purpose: "Study group session",
      },
      {
        roomId: roomIds[1],
        userName: "Prof. Johnson",
        date: today,
        startTime: "09:00",
        endTime: "10:00",
        purpose: "Physics lecture",
        status: "completed",
      },
    ];

    sampleBookings.forEach(booking => {
      const id = randomUUID();
      const fullBooking: Booking = {
        ...booking,
        id,
        status: booking.status || "confirmed",
        createdAt: new Date(),
      };
      this.bookings.set(id, fullBooking);
    });
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id, createdAt: new Date() };
    this.admins.set(id, admin);
    return admin;
  }

  // Room operations
  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = { ...insertRoom, id, createdAt: new Date() };
    this.rooms.set(id, room);
    return room;
  }

  // Booking operations
  async getAllBookings(): Promise<(Booking & { roomName: string })[]> {
    const bookings = Array.from(this.bookings.values());
    return bookings.map(booking => {
      const room = this.rooms.get(booking.roomId);
      return {
        ...booking,
        roomName: room?.name || "Unknown Room",
      };
    });
  }

  async getBookingsByRoom(roomId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.roomId === roomId);
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.date === date);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      status: "confirmed",
      createdAt: new Date() 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }
}

export const storage = new MemStorage();
