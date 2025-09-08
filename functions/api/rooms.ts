import { memStorage } from "../shared/storage";

export async function onRequestGet(context: any) {
  try {
    const rooms = await memStorage.getAllRooms();
    
    // Get today's bookings to show availability
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await memStorage.getBookingsByDate(today);
    
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

    return new Response(JSON.stringify(roomsWithAvailability), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch rooms" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}