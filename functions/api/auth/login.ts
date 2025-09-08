import { loginSchema } from "../../../shared/schema";
import { memStorage } from "../../shared/storage";
import { signJWT } from "../../shared/jwt";

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { username, password } = loginSchema.parse(body);
    
    const admin = await memStorage.getAdminByUsername(username);
    if (!admin || admin.password !== password) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = await signJWT({
      adminId: admin.id,
      username: admin.username
    });

    return new Response(JSON.stringify({ 
      id: admin.id, 
      username: admin.username,
      token
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid request data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}