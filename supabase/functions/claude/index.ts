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

// Precios por modelo (US$ por 1M tokens: [entrada, salida]) para el costo estimado.
const PRICES: Record<string, [number, number]> = {
  "claude-3-5-haiku-latest": [0.80, 4.00],
  "claude-3-haiku-20240307": [0.25, 1.25],
  "claude-3-5-sonnet-latest": [3.00, 15.00],
  "claude-sonnet-4-20250514": [3.00, 15.00],
  "claude-3-opus-latest": [15.00, 75.00],
};
function costOf(model: string, inTok: number, outTok: number): number {
  const p = PRICES[model] || PRICES["claude-3-5-haiku-latest"];
  return inTok / 1e6 * p[0] + outTok / 1e6 * p[1];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { prompt, model, max_tokens, team_id, feature } = await req.json();
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

    // Métrica de uso (para cobro / dashboard admin). Requiere la tabla ai_usage (ver SQL).
    try {
      const mdl = model || "claude-3-5-haiku-latest";
      const inTok = usage.input_tokens || 0;
      const outTok = usage.output_tokens || 0;
      await supa.from("ai_usage").insert({
        team_id: team_id || null,
        user_id: user.id,
        model: mdl,
        in_tokens: inTok,
        out_tokens: outTok,
        cost: costOf(mdl, inTok, outTok),
        feature: feature || null,
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
