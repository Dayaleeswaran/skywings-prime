import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.");
}

// Falls back to a placeholder so the UI still renders (with empty data) when env vars are missing.
export const supabase = createClient(url || "http://localhost:54321", anonKey || "missing-anon-key");

// Tiny query builder so call sites read like: db.get("services", [Query.equal("visible", true), Query.orderAsc("sort_order")])
export const Query = {
  equal: (col, val) => ({ type: "equal", col, val }),
  orderAsc: col => ({ type: "order", col, ascending: true }),
  orderDesc: col => ({ type: "order", col, ascending: false }),
  limit: n => ({ type: "limit", n }),
};

export function applyQueries(builder, queries = []) {
  let q = builder;
  for (const x of queries) {
    if (x.type === "equal") q = Array.isArray(x.val) ? q.in(x.col, x.val) : q.eq(x.col, x.val);
    else if (x.type === "order") q = q.order(x.col, { ascending: x.ascending });
    else if (x.type === "limit") q = q.limit(x.n);
  }
  return q;
}
