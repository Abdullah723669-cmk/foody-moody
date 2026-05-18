import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { products } from "../lib/data";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Read environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: Missing Supabase environment variables! Please add them to your .env.local file first.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  console.log("🚀 Starting migration to Supabase...");

  // 1. Migrate Products
  console.log("\n📦 Migrating products...");
  for (const item of products) {
    const { id, name, slug, description, price, category, image, badge, rating, reviews } = item;
    
    // Check if product already exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) {
      const { error } = await supabase.from("products").insert({
        name,
        slug,
        description,
        price,
        category,
        image,
        badge: badge || null,
        rating,
        reviews,
        stock: 50 // default initial stock
      });

      if (error) {
        console.error(`❌ Failed to migrate product: ${name}`, error);
      } else {
        console.log(`✅ Migrated product: ${name}`);
      }
    } else {
      console.log(`ℹ️ Product already exists, skipping: ${name}`);
    }
  }

  // 2. Migrate Custom Users (from lib/users.json)
  console.log("\n👤 Migrating custom users...");
  const usersFilePath = path.join(process.cwd(), "lib", "users.json");
  if (fs.existsSync(usersFilePath)) {
    try {
      const fileData = fs.readFileSync(usersFilePath, "utf-8");
      const customUsers = JSON.parse(fileData || "[]");

      for (const u of customUsers) {
        const { error } = await supabase.from("users").insert({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role || "user",
          status: u.status || "Active"
        });

        if (error) {
          // Ignore conflict errors since they might already be present
          if (error.code !== "23505") { 
            console.error(`❌ Failed to migrate user: ${u.email}`, error);
          } else {
            console.log(`ℹ️ User already exists, skipping: ${u.email}`);
          }
        } else {
          console.log(`✅ Migrated user: ${u.email}`);
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse users.json", err);
    }
  } else {
    console.log("ℹ️ No lib/users.json found, only default accounts migrated.");
  }

  console.log("\n🎉 Migration finished successfully!");
}

runMigration().catch(err => {
  console.error("💥 Migration failed unexpectedly", err);
});
