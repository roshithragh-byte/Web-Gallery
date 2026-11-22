import { createFamilySession } from "@/lib/drive/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const passphrase = typeof body.passphrase === "string" ? body.passphrase : "";
    if (!passphrase) {
      return Response.json({ error: "Passphrase is required." }, { status: 400 });
    }
    await createFamilySession(passphrase);
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Access denied.";
    return Response.json({ error: message }, { status: 401 });
  }
}
