import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

function getAttachmentDir(cleanId: string): string {
  return path.join(process.cwd(), "public", "uploads", "attachments", cleanId);
}

function getManifestPath(cleanId: string): string {
  return path.join(getAttachmentDir(cleanId), "manifest.json");
}

async function readManifest(cleanId: string): Promise<any[]> {
  try {
    const manifestPath = getManifestPath(cleanId);
    if (fs.existsSync(manifestPath)) {
      const content = await fs.promises.readFile(manifestPath, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(`[Attachments API] Failed to read manifest for ${cleanId}:`, err);
  }
  return [];
}

async function writeManifest(cleanId: string, attachments: any[]): Promise<void> {
  const dir = getAttachmentDir(cleanId);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
  await fs.promises.writeFile(getManifestPath(cleanId), JSON.stringify(attachments, null, 2), "utf8");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const cleanId = (resolvedParams.id || "").trim().toUpperCase();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const attachments = await readManifest(cleanId);

    return NextResponse.json(
      { success: true, count: attachments.length, attachments },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[Attachments GET error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch attachments" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const cleanId = (resolvedParams.id || "").trim().toUpperCase();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Ticket ID is required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploader = (formData.get("uploader") as string) || "Technician";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dir = getAttachmentDir(cleanId);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    // Sanitize filename and create unique timestamped name
    const ext = path.extname(file.name) || "";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const uniqueFileName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(dir, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);

    const sizeBytes = buffer.length;
    let sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`;
    if (sizeBytes > 1024 * 1024) {
      sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    let fileType = "generic";
    const nameLower = file.name.toLowerCase();
    if (file.type.includes("pdf") || nameLower.endsWith(".pdf")) fileType = "pdf";
    else if (file.type.includes("image") || nameLower.endsWith(".png") || nameLower.endsWith(".jpg") || nameLower.endsWith(".jpeg") || nameLower.endsWith(".webp")) fileType = "image";
    else if (nameLower.endsWith(".zip") || nameLower.endsWith(".tar") || nameLower.endsWith(".gz") || nameLower.endsWith(".7z")) fileType = "archive";
    else if (nameLower.endsWith(".bin") || nameLower.endsWith(".hex") || nameLower.endsWith(".img") || nameLower.endsWith(".dd") || nameLower.endsWith(".mdf")) fileType = "binary";
    else if (file.type.includes("text") || nameLower.endsWith(".log") || nameLower.endsWith(".txt") || nameLower.endsWith(".json")) fileType = "text";

    const newAttachment = {
      id: `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: file.name,
      size: sizeStr,
      type: fileType,
      url: `/uploads/attachments/${cleanId}/${uniqueFileName}`,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      uploadedBy: uploader,
    };

    const currentList = await readManifest(cleanId);
    const updatedList = [...currentList, newAttachment];
    await writeManifest(cleanId, updatedList);

    // Broadcast Realtime update via Supabase ticket_messages
    try {
      const supabase = createAdminClient();
      await supabase.from("ticket_messages").insert([
        {
          ticket_id: cleanId,
          sender: "Technician",
          author: uploader,
          text: `Attached file to laboratory records: "${file.name}" (${sizeStr})`,
          created_at: new Date().toISOString(),
        },
      ]);

      await supabase.from("audit_logs").insert([
        {
          id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          actor: uploader,
          action: "UPLOAD_ATTACHMENT",
          target: `Ticket #${cleanId} (${file.name})`,
          ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (realtimeErr) {
      console.warn("[Attachments API] Supabase broadcast note:", realtimeErr);
    }

    return NextResponse.json(
      { success: true, attachment: newAttachment },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[Attachments POST error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload attachment" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const cleanId = (resolvedParams.id || "").trim().toUpperCase();

    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!cleanId || !attachmentId) {
      return NextResponse.json(
        { success: false, error: "Ticket ID and attachmentId are required" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const currentList = await readManifest(cleanId);
    const target = currentList.find((a) => a.id === attachmentId);

    if (target && target.url) {
      const fileName = path.basename(target.url);
      const filePath = path.join(getAttachmentDir(cleanId), fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch(() => {});
      }
    }

    const updatedList = currentList.filter((a) => a.id !== attachmentId);
    await writeManifest(cleanId, updatedList);

    return NextResponse.json(
      { success: true, count: updatedList.length },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("[Attachments DELETE error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete attachment" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
