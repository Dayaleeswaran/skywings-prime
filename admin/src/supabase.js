import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.");
}

export const supabase = createClient(url || "http://localhost:54321", anonKey || "missing-anon-key");

export const SITE_URL = (import.meta.env.VITE_SITE_URL || "http://localhost:5173").replace(/\/+$/, "");
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
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;

export function validateFile(file, kind = "image") {
  const types = kind === "video" ? ALLOWED_VIDEO : ALLOWED_IMAGE;
  const maxMb = kind === "video" ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  if (!types.includes(file.type)) return `Unsupported file type (${file.type || "unknown"}). Allowed: ${types.map(t => t.split("/")[1]).join(", ")}.`;
  if (file.size > maxMb * 1024 * 1024) return `File is too large (max ${maxMb} MB).`;
  return null;
}

export async function uploadFile(file, kind = "image") {
  const problem = validateFile(file, kind);
  if (problem) throw new Error(problem);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${kind}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
