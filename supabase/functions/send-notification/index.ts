import { createClient } from "jsr:@supabase/supabase-js@2";

interface Notification {
  id: string;
  type: "follow" | "follow_request" | "like";
  actor_id: string;
  recipient_id: string;
  post_id?: string;
  read_at: string | null;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Notification;
  schema: "public";
  old_record: null | Notification;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const { data: tokenData } = await supabase
    .from("user_push_tokens")
    .select("token")
    .eq("user_id", payload.record.recipient_id)
    .single();

  if (!tokenData) {
    return new Response("No token found", {
      status: 404,
    });
  }

  const { data: userData } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", payload.record.actor_id)
    .single();

  if (!userData) {
    return new Response("No user found", {
      status: 404,
    });
  }

  const body =
    payload.record.type === "follow"
      ? " started following you"
      : payload.record.type === "follow_request"
        ? " sent you a follow request"
        : " liked your post";

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
    },
    body: JSON.stringify({
      to: tokenData.token,
      sound: "default",
      body: userData.username + body,
    }),
  }).then((res) => res.json());

  return new Response(JSON.stringify(res), {
    headers: { "Content-Type": "application/json" },
  });
});
