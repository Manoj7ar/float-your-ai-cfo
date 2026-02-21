import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Get account
    const { data: account } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!account) throw new Error("No account found");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    // Read file content as base64 for AI extraction
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use AI to extract invoice data
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an invoice data extractor. Extract the following fields from the invoice document and return ONLY a JSON object with no other text:
{
  "client_name": "string",
  "client_email": "string or null",
  "client_phone": "string or null",
  "invoice_number": "string or null",
  "amount": number (in euro cents, e.g. €2,400 = 240000),
  "invoice_date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null"
}
If you can't determine a field, use null. Amount must always be a positive integer in cents.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract invoice data from this PDF document (filename: ${file.name}).`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.type || "application/pdf"};base64,${base64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI extraction error:", response.status, t);
      throw new Error("AI extraction failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content ?? "";

    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse invoice data from AI response");

    const extracted = JSON.parse(jsonMatch[0]);

    // Determine status
    let status = "unpaid";
    if (extracted.due_date) {
      const due = new Date(extracted.due_date);
      const now = new Date();
      if (due < now) status = "overdue";
    }

    // Insert invoice
    const { data: invoice, error: insertError } = await supabase
      .from("invoices")
      .insert({
        account_id: account.id,
        client_name: extracted.client_name || "Unknown Client",
        client_email: extracted.client_email,
        client_phone: extracted.client_phone,
        invoice_number: extracted.invoice_number,
        amount: extracted.amount || 0,
        invoice_date: extracted.invoice_date,
        due_date: extracted.due_date,
        status,
      })
      .select()
      .single();

    if (insertError) throw new Error(`Failed to create invoice: ${insertError.message}`);

    return new Response(
      JSON.stringify({ success: true, invoice, extracted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-invoice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
