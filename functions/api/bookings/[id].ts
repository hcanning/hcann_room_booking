import { memStorage } from "../../shared/storage";
import { verifyJWT } from "../../shared/jwt";

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

export async function onRequestPatch(context: any) {
  const authResult = await requireAuth(context.request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { id } = context.params;
    const body = await context.request.json();
    const booking = await memStorage.updateBooking(id, body);
    
    if (!booking) {
      return new Response(JSON.stringify({ message: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify(booking), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to update booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestDelete(context: any) {
  const authResult = await requireAuth(context.request);
  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const { id } = context.params;
    const deleted = await memStorage.deleteBooking(id);
    
    if (!deleted) {
      return new Response(JSON.stringify({ message: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ message: "Booking deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to delete booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}