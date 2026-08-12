import mockExtraction from "./mock-data/beawars-sample.json" with { type: "json" };

interface ExtractInvoiceRequest {
  file_path: string;
}

// NOTE: "*" is fine for local dev — narrow this to your actual app
// origin(s) before this goes anywhere near production. Also check
// whether any other edge function in this repo already defines a
// shared corsHeaders constant somewhere — if so, import that instead
// of duplicating this here.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// TODO: replace this mock with a real Claude Vision extraction call
// against the file at filePath, returning the same shape as
// mock-data/beawars-sample.json. Everything else in this file (CORS,
// validation, response wrapping) should stay unchanged when that
// swap happens.
function getMockExtraction(filePath: string) {
  return mockExtraction;
}

Deno.serve(async (req) => {
  // Browser preflight — must be handled before any other checks,
  // and must not require a body or auth.
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  let body: ExtractInvoiceRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.file_path) {
    return new Response(JSON.stringify({ error: "file_path is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const extraction = getMockExtraction(body.file_path);

  return new Response(JSON.stringify(extraction), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
