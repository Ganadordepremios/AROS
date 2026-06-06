// Tempo OS — Edge Function "claude"
// Proxy seguro a la API de Anthropic: la API key vive como secreto en el servidor,
// nunca en el cliente. Solo usuarios autenticados pueden llamarla.
// Despliega con verify_jwt = ON (por defecto).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { prompt, model, max_tokens } = await req.json();
    if (!prompt) return j({ error: "missing prompt" }, 400);

    // Usuario autenticado (del JWT que envía el cliente)
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: ud } = await supa.auth.getUser(token);
    const user = ud?.user;
    if (!user) return j({ error: "no autorizado" }, 401);

    // Llamada a Anthropic (la key nunca sale del servidor)
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-3-5-haiku-latest",
        max_tokens: max_tokens || 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    if (data.error) return j({ error: data.error.message }, 200);

    const text = (data.content || []).map((b: any) => b.text || "").join("");
    const usage = data.usage || {};

    // Métrica de uso (para cobro). Requiere la tabla ai_usage (ver SQL).
    try {
      await supa.from("ai_usage").insert({
        user_id: user.id,
        model: model || "claude-3-5-haiku-latest",
        in_tokens: usage.input_tokens || 0,
        out_tokens: usage.output_tokens || 0,
      });
    } catch (_) { /* la métrica es best-effort */ }

    return j({ text, usage }, 200);
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});

function j(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "content-type": "application/json" } });
}
