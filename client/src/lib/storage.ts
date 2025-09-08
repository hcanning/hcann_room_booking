// Static storage for client-side only application

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  imageUrl: string;
  equipment: string[];
  isAccessible: boolean;
  description: string;
}

export interface Booking {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number;
  contactName: string;
  contactEmail: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
}

// Default admin credentials
const ADMIN_CREDENTIALS = {
  username: "hcanning",
  password: "technics1"
};

class StaticStorage {
  private rooms: Room[] = [];
  private bookings: Booking[] = [];

  async initialize() {
    // Load rooms from JSON file
    try {
      const response = await fetch('/data/rooms.json');
      this.rooms = await response.json();
    } catch (error) {
      console.error('Failed to load rooms data:', error);
      this.rooms = [];
    }

    // Load bookings from localStorage
    const savedBookings = localStorage.getItem('roomBookings');
    if (savedBookings) {
      try {
        this.bookings = JSON.parse(savedBookings);
      } catch (error) {
        console.error('Failed to parse saved bookings:', error);
        this.bookings = [];
      }
    }
  }

  // Authentication
  login(username: string, password: string): Admin | null {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const admin = { id: "admin-1", username };
      localStorage.setItem('currentAdmin', JSON.stringify(admin));
      return admin;
    }
    return null;
  }

  logout() {
    localStorage.removeItem('currentAdmin');
  }

  getCurrentAdmin(): Admin | null {
    const saved = localStorage.getItem('currentAdmin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return this.rooms;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return this.bookings;
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    this.bookings.push(booking);
    this.saveBookings();
    return booking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      this.saveBookings();
      return true;
    }
    return false;
  }

  private saveBookings() {
    localStorage.setItem('roomBookings', JSON.stringify(this.bookings));
  }

  // Utility method to check if a room is available at a specific time
  isRoomAvailable(roomId: string, date: string, startTime: string, endTime: string): boolean {
    const roomBookings = this.bookings.filter(b => b.roomId === roomId && b.date === date);
    
    for (const booking of roomBookings) {
      // Check for time overlap
      if (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      ) {
        return false;
      }
    }
    return true;
  }
}

export const storage = new StaticStorage();