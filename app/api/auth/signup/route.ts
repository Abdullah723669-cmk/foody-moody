import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email address is already registered" }, { status: 400 });
    }

    // Save new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name,
        email: email.toLowerCase(),
        password,
        role: "user",
        status: "Active"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: { name: newUser.name, email: newUser.email } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
