import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const email = data.email.toLowerCase();

    // 1. Validation check
    if (!email.endsWith(".study.iitm.ac.in") && !email.endsWith("@study.iitm.ac.in")) {
      return NextResponse.json({ error: "Access Denied. Please use the official format: rollno@branch.study.iitm.ac.in" }, { status: 400 });
    }

    // 2. Check for existing
    const { data: existing } = await supabase
      .from("registrations")
      .select("email")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "You are already registered in our archives." }, { status: 400 });
    }

    // 3. Insert new record
    const { error: insertError } = await supabase
      .from("registrations")
      .insert([{
        fullName: data.fullName,
        email: email,
        whatsapp: data.whatsapp,
        house: data.house,
        year: data.year,
        interests: data.interests || [],
        experience: data.experience || "No",
        expDetail: data.expDetail || "",
        motivation: data.motivation || "",
        specialSkills: data.specialSkills || "",
        isVerified: false,
        whatsappJoined: false,
        gspaceJoined: false
      }]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Database error" }, { status: 500 });
  }
}
