import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .neq("status", "Deleted")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role, status } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ role, status })
      .eq("email", email.toLowerCase())
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Soft delete by updating status
    const { error } = await supabase
      .from("users")
      .update({ status: "Deleted" })
      .eq("email", email.toLowerCase());

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete user" }, { status: 500 });
  }
}
