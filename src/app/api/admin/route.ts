import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "AayamAdmin2026";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, action, id, field, settings, member } = body;

    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("*").eq("key", "config").single();
      return data?.value || { whatsappLink: "https://chat.whatsapp.com/example-link" };
    };

    if (action === "fetch") {
      const currentSettings = await fetchSettings();
      if (password === "PUBLIC") return NextResponse.json({ settings: currentSettings });
      
      if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      
      const { data: registrations } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      return NextResponse.json({ registrations, settings: currentSettings });
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "updateSettings" && settings) {
      await supabase.from("settings").upsert({ key: "config", value: settings });
      return NextResponse.json({ success: true });
    }

    if (action === "update" && id && member) {
      delete member.id;
      delete member.created_at;
      await supabase.from("registrations").update(member).eq("id", id);
      return NextResponse.json({ success: true });
    }

    if (action === "add" && member) {
      member.isVerified = true;
      await supabase.from("registrations").insert([member]);
      return NextResponse.json({ success: true });
    }

    if (action === "verify" && id) {
      await supabase.from("registrations").update({ isVerified: true }).eq("id", id);
      return NextResponse.json({ success: true });
    }

    if (action === "toggleField" && id && field) {
      const { data: current } = await supabase.from("registrations").select(field).eq("id", id).single();
      await supabase.from("registrations").update({ [field]: !current[field] }).eq("id", id);
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && id) {
      await supabase.from("registrations").delete().eq("id", id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
