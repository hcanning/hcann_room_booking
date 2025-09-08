import { memStorage } from "../../shared/storage";

export async function onRequestGet(context: any) {
  try {
    const { id } = context.params;
    const room = await memStorage.getRoom(id);
    
    if (!room) {
      return new Response(JSON.stringify({ message: "Room not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify(room), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch room" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}