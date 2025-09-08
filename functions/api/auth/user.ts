import { memStorage } from "../../shared/storage";
import { verifyJWT } from "../../shared/jwt";

export async function onRequestGet(context: any) {
  try {
    const authHeader = context.request.headers.get('authorization');
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

    const admin = await memStorage.getAdminByUsername('hcanning'); // Since we only have one admin
    if (!admin) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ id: admin.id, username: admin.username }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}