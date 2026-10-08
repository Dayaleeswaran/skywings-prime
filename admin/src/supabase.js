import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.");
}

export const supabase = createClient(url || "http://localhost:54321", anonKey || "missing-anon-key");

// Public website address (used by the "View Website" link). When the variable is missing the link points to the local site
// during development and is hidden in production, so it can never send someone to a localhost address.
const isLocalAdmin = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
export const SITE_URL = (import.meta.env.VITE_SITE_URL || (isLocalAdmin ? "http://localhost:5177" : "")).replace(/\/+$/, "");
export const BUCKET = "uploads";

// Query helpers: dbList("services", [Query.orderAsc("sort_order"), Query.limit(100)])
export const Query = {
  equal: (col, val) => ({ type: "equal", col, val }),
  greaterThanEqual: (col, val) => ({ type: "gte", col, val }),
  orderAsc: col => ({ type: "order", col, ascending: true }),
  orderDesc: col => ({ type: "order", col, ascending: false }),
  limit: n => ({ type: "limit", n }),
};

function apply(builder, queries = []) {
  let q = builder;
  for (const x of queries) {
    if (x.type === "equal") q = Array.isArray(x.val) ? q.in(x.col, x.val) : q.eq(x.col, x.val);
    else if (x.type === "gte") q = q.gte(x.col, x.val);
    else if (x.type === "order") q = q.order(x.col, { ascending: x.ascending });
    else if (x.type === "limit") q = q.limit(x.n);
  }
  return q;
}

const unwrap = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

export async function dbList(table, queries = []) {
  const { data, error, count } = await apply(supabase.from(table).select("*", { count: "exact" }), queries);
  if (error) throw new Error(error.message);
  return { documents: data || [], total: count ?? (data || []).length };
}
export async function dbCount(table) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}
export const dbInsert = async (table, payload) => unwrap(await supabase.from(table).insert(payload).select().single());
export const dbUpdate = async (table, id, payload) => unwrap(await supabase.from(table).update(payload).eq("id", id).select().single());
export const dbDelete = async (table, id) => unwrap(await supabase.from(table).delete().eq("id", id));

// ── Storage ──
export const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
export const ALLOWED_VIDEO = ["video/mp4", "video/webm"];
const MAX_IMAGE_MB = 25; // originals may be large: they are shrunk below before upload
const MAX_VIDEO_MB = 50;

export function validateFile(file, kind = "image") {
  const types = kind === "video" ? ALLOWED_VIDEO : ALLOWED_IMAGE;
  const maxMb = kind === "video" ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  if (!types.includes(file.type)) return `Unsupported file type (${file.type || "unknown"}). Allowed: ${types.map(t => t.split("/")[1]).join(", ")}.`;
  if (file.size > maxMb * 1024 * 1024) return `File is too large (max ${maxMb} MB).`;
  return null;
}

// Phone / camera photos are often 5-10 MB. Resize to at most 1600 px on the long side and re-encode (WebP, or JPEG where WebP
// is not available) so pages load fast. SVG and GIF are left untouched; a file that is already small is kept as it is.
export async function optimizeImage(file, maxSide = 1600) {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    let blob = await new Promise(r => canvas.toBlob(r, "image/webp", 0.82));
    if (!blob || blob.type !== "image/webp") blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], `photo.${ext}`, { type: blob.type });
  } catch {
    return file; // if the browser cannot decode it, upload the original
  }
}

export async function uploadFile(original, kind = "image") {
  const problem = validateFile(original, kind);
  if (problem) throw new Error(problem);
  const file = kind === "image" ? await optimizeImage(original) : original;
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${kind}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
