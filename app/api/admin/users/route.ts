import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

// Default users in the system
const defaultUsers = [
  { id: "1", name: "Admin User", email: "admin@example.com", role: "admin", status: "Active" },
  { id: "2", name: "Demo User", email: "user@example.com", role: "user", status: "Active" },
  { id: "3", name: "John Doe", email: "john@example.com", role: "user", status: "Inactive" },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let customUsers = [];
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, "utf-8");
      customUsers = JSON.parse(data || "[]");
    }

    // Combine default and custom users, making sure there are no duplicate email addresses
    const combined = [...defaultUsers];

    customUsers.forEach((u: any) => {
      const index = combined.findIndex(d => d.email.toLowerCase() === u.email.toLowerCase());
      if (index !== -1) {
        // If the custom user exists (e.g. role/status updated), overwrite the default attributes
        combined[index] = {
          ...combined[index],
          role: u.role || combined[index].role,
          status: u.status || combined[index].status,
        };
      } else {
        combined.push({
          id: u.id || String(combined.length + 1),
          name: u.name,
          email: u.email,
          role: u.role || "user",
          status: u.status || "Active",
        });
      }
    });

    const finalUsers = combined.filter(u => u.status !== "Deleted");
    return NextResponse.json({ users: finalUsers });
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

    let users = [];
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, "utf-8");
      users = JSON.parse(data || "[]");
    }

    // Find custom user
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex !== -1) {
      if (role) users[userIndex].role = role;
      if (status) users[userIndex].status = status;
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
      return NextResponse.json({ success: true, user: users[userIndex] });
    } else {
      // If it's a default user, add them to lib/users.json with updated fields to persist changes
      const defaultMatch = [
        { id: "1", name: "Admin User", email: "admin@example.com", role: "admin", password: "admin123", status: "Active" },
        { id: "2", name: "Demo User", email: "user@example.com", role: "user", password: "user123", status: "Active" },
        { id: "3", name: "John Doe", email: "john@example.com", role: "user", password: "john123", status: "Inactive" },
      ].find(d => d.email.toLowerCase() === email.toLowerCase());

      if (defaultMatch) {
        const newUser = {
          ...defaultMatch,
          role: role || defaultMatch.role,
          status: status || defaultMatch.status,
        };
        users.push(newUser);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        return NextResponse.json({ success: true, user: newUser });
      }

      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
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

    let users = [];
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, "utf-8");
      users = JSON.parse(data || "[]");
    }

    const originalLength = users.length;
    const newUsers = users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());

    const defaultMatch = [
      { id: "1", name: "Admin User", email: "admin@example.com", role: "admin", password: "admin123", status: "Active" },
      { id: "2", name: "Demo User", email: "user@example.com", role: "user", password: "user123", status: "Active" },
      { id: "3", name: "John Doe", email: "john@example.com", role: "user", password: "john123", status: "Inactive" },
    ].find(d => d.email.toLowerCase() === email.toLowerCase());

    if (defaultMatch && originalLength === newUsers.length) {
      newUsers.push({ ...defaultMatch, status: "Deleted" });
    }

    fs.writeFileSync(usersFilePath, JSON.stringify(newUsers, null, 2));

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to delete user" }, { status: 500 });
  }
}
