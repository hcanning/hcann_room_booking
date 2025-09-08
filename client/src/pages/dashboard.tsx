import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { storage, type Room, type Booking } from "@/lib/storage";
import RoomCard from "@/components/room-card";
import BookingModal from "@/components/booking-modal";
import { User } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'manage'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.reload();
      return;
    }
  }, [user, authLoading]);

  // Load rooms on component mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await storage.getRooms();
        // Add today's availability to each room
        const today = new Date().toISOString().split('T')[0];
        const roomsWithAvailability = roomsData.map(room => ({
          ...room,
          todayAvailability: generateTimeSlots(room.id, today)
        }));
        setRooms(roomsWithAvailability);
      } catch (error) {
        console.error('Failed to load rooms:', error);
        toast({
          title: "Error",
          description: "Failed to load rooms data",
          variant: "destructive",
        });
      } finally {
        setRoomsLoading(false);
      }
    };

    loadRooms();
  }, [toast]);

  // Load bookings when manage tab is active
  useEffect(() => {
    if (activeTab === 'manage') {
      const loadBookings = async () => {
        setBookingsLoading(true);
        try {
          const bookingsData = await storage.getBookings();
          // Add room names to bookings
          const bookingsWithRoomNames = bookingsData.map(booking => {
            const room = rooms.find(r => r.id === booking.roomId);
            return {
              ...booking,
              roomName: room?.name || 'Unknown Room',
              userName: booking.contactName,
              status: 'confirmed'
            };
          });
          setBookings(bookingsWithRoomNames);
        } catch (error) {
          console.error('Failed to load bookings:', error);
          toast({
            title: "Error",
            description: "Failed to load bookings data",
            variant: "destructive",
          });
        } finally {
          setBookingsLoading(false);
        }
      };

      loadBookings();
    }
  }, [activeTab, rooms, toast]);

  // Generate time slots for a room on a specific date
  const generateTimeSlots = (roomId: string, date: string) => {
    const slots = [];
    const hours = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    
    for (const hour of hours) {
      const isAvailable = storage.isRoomAvailable(roomId, date, hour, getEndTime(hour));
      slots.push({
        time: hour,
        available: isAvailable
      });
    }
    
    return slots;
  };

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  const handleLogout = () => {
    storage.logout();
    window.location.reload();
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await storage.deleteBooking(id);
      // Refresh bookings list
      const bookingsData = await storage.getBookings();
      const bookingsWithRoomNames = bookingsData.map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        return {
          ...booking,
          roomName: room?.name || 'Unknown Room',
          userName: booking.contactName,
          status: 'confirmed'
        };
      });
      setBookings(bookingsWithRoomNames);
      
      // Refresh room availability
      const today = new Date().toISOString().split('T')[0];
      const roomsWithAvailability = rooms.map(room => ({
        ...room,
        todayAvailability: generateTimeSlots(room.id, today)
      }));
      setRooms(roomsWithAvailability);
      
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const handleBookingSuccess = async () => {
    // Refresh rooms availability after successful booking
    const today = new Date().toISOString().split('T')[0];
    const roomsWithAvailability = rooms.map(room => ({
      ...room,
      todayAvailability: generateTimeSlots(room.id, today)
    }));
    setRooms(roomsWithAvailability);
    
    // If on manage tab, refresh bookings too
    if (activeTab === 'manage') {
      const bookingsData = await storage.getBookings();
      const bookingsWithRoomNames = bookingsData.map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        return {
          ...booking,
          roomName: room?.name || 'Unknown Room',
          userName: booking.contactName,
          status: 'confirmed'
        };
      });
      setBookings(bookingsWithRoomNames);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground" data-testid="text-app-title">
                Room Booking System
              </h1>
              <span className="text-sm text-muted-foreground">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground" data-testid="text-username">
                  {user?.username}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rooms'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-rooms"
            >
              Available Rooms
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manage'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-manage"
            >
              Manage Bookings
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rooms' && (
          <div>
            {/* Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Filter Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="capacity-filter">Capacity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any capacity</SelectItem>
                        <SelectItem value="small">Up to 10 people</SelectItem>
                        <SelectItem value="medium">10-20 people</SelectItem>
                        <SelectItem value="large">20+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="equipment-filter">Equipment</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any equipment</SelectItem>
                        <SelectItem value="projector">Projector required</SelectItem>
                        <SelectItem value="video">Video conference</SelectItem>
                        <SelectItem value="whiteboard">Interactive whiteboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="building-filter">Building</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All buildings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All buildings</SelectItem>
                        <SelectItem value="science">Science Center</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="union">Student Union</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date-filter">Date</Label>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Grid */}
            {roomsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="w-full h-48 bg-muted animate-pulse" />
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-muted animate-pulse rounded" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBookRoom={handleBookRoom}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Current Bookings</h2>
              </div>
              
              {bookingsLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {booking.roomName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {booking.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {booking.date === new Date().toISOString().split('T')[0] ? 'Today' : booking.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default">
                              confirmed
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="text-destructive hover:text-destructive/80"
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              Cancel
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            No bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BookingModal
        room={selectedRoom}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}