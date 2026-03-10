export default {
    async fetch(request, env) {
        const ALLOWED_ORIGIN = "https://midterms.veerbajaj.com";
        const origin = request.headers.get("Origin");

        const isAllowedOrigin =
            origin === ALLOWED_ORIGIN || origin === null;

        // ---- CORS PREFLIGHT ----
        if (request.method === "OPTIONS") {
            if (!isAllowedOrigin) {
                return new Response(null, { status: 403 });
            }

            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "86400"
                }
            });
        }

        // ---- ORIGIN LOCK ----
        if (!isAllowedOrigin) {
            return new Response(
                JSON.stringify({ error: "Forbidden origin" }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        // ---- METHOD CHECK ----
        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        // ---- PARSE BODY ----
        let body;
        try {
            body = await request.json();
        } catch {
            return new Response(
                JSON.stringify({ error: "Invalid JSON body" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // ---- FORWARD TO GEMINI ----
        const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": env.GEMINI_API_KEY
                },
                body: JSON.stringify(body)
            }
        );

        // ---- RETURN RESPONSE ----
        return new Response(geminiResponse.body, {
            status: geminiResponse.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": ALLOWED_ORIGIN
            }
        });
    }
};
