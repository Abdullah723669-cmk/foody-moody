import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "lib", "users.json");

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Read existing users
    let users = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      users = JSON.parse(data || "[]");
    }

    // Check if user already exists
    if (
      users.some((u: any) => u.email.toLowerCase() === email.toLowerCase()) || 
      email.toLowerCase() === "admin@example.com" || 
      email.toLowerCase() === "user@example.com"
    ) {
      return NextResponse.json({ error: "Email address is already registered" }, { status: 400 });
    }

    // Save new user
    const newUser = {
      id: String(users.length + 3),
      name,
      email: email.toLowerCase(),
      password,
      role: "user"
    };
    users.push(newUser);

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true, user: { name, email } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
