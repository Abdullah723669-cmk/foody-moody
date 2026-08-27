import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all products
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ products: products || [] });
  } catch (e: any) {
    console.error("Error fetching products from Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to fetch products" }, { status: 500 });
  }
}

// POST create a new product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, price, stock, image, description } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
    }

    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const newProduct = {
      name,
      slug: slug + "-" + Math.floor(100 + Math.random() * 900),
      description: description || `Delicious hot freshly made ${name}. Custom chef special recipe!`,
      price: parseFloat(price) || 0,
      category: category || "burgers",
      image: image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
      rating: 4.8,
      reviews: 1,
      stock: stock !== undefined ? parseInt(stock) : 50,
      badge: body.badge || null,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (e: any) {
    console.error("Error inserting product into Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to create product" }, { status: 500 });
  }
}

// PUT update product stock or info
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, stock, name, price, category, image, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (stock !== undefined) updatePayload.stock = parseInt(stock);
    if (name !== undefined) updatePayload.name = name;
    if (price !== undefined) updatePayload.price = parseFloat(price);
    if (category !== undefined) updatePayload.category = category;
    if (image !== undefined) updatePayload.image = image;
    if (description !== undefined) updatePayload.description = description;

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (e: any) {
    console.error("Error updating product in Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Error deleting product from Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to delete product" }, { status: 500 });
  }
}
