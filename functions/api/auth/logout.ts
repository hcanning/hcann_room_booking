export async function onRequestPost(context: any) {
  // With JWT, logout is handled client-side by removing the token
  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}