const ALLOWED_ORIGINS = [
  "https://sociallearninglab.github.io",
  "https://localhost:8000",
  "http://127.0.0.1:5500",  // VS Code Live Server
  "http://localhost:5500",
];

function corsHeaders(origin) {
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    const { token } = await request.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "missing token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...headers } }
      );
    }

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET,
          response: token,
        }),
      }
    );

    const outcome = await result.json();

    return new Response(
      JSON.stringify({
        success: outcome.success,
        challenge_ts: outcome.challenge_ts,
        hostname: outcome.hostname,
        error_codes: outcome["error-codes"],
      }),
      {
        headers: { "Content-Type": "application/json", ...headers },
      }
    );
  },
};
