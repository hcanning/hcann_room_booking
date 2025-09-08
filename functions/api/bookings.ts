import { insertBookingSchema } from "../../shared/schema";
import { memStorage } from "../shared/storage";
import { verifyJWT } from "../shared/jwt";

async function requireAuth(request: Request): Promise<{ adminId: string } | Response> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const decoded = await verifyJWT(token);
  if (!decoded) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  return { adminId: decoded.adminId };
}

export async function onRequestGet(context: any) {
  const authResult = await requireAuth(context.request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const bookings = await memStorage.getAllBookings();
    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch bookings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context: any) {
  const authResult = await requireAuth(context.request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body = await context.request.json();
    const bookingData = insertBookingSchema.parse(body);
    
    // Check for conflicts
    const existingBookings = await memStorage.getBookingsByRoom(bookingData.roomId);
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
      return new Response(JSON.stringify({ message: "Time slot is already booked" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    const booking = await memStorage.createBooking(bookingData);
    return new Response(JSON.stringify(booking), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid booking data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}