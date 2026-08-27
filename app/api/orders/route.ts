import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET orders (all for admin, user-filtered for normal users)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userEmailParam = searchParams.get("userEmail");

    let query = supabase.from("orders").select("*").order("id", { ascending: false });

    const isAdmin = (session?.user as any)?.role === "admin";

    if (!isAdmin) {
      const emailFilter = session?.user?.email || userEmailParam;
      const nameFilter = session?.user?.name;

      if (!emailFilter && !nameFilter) {
        return NextResponse.json({ orders: [] });
      }

      // Supabase query to match user
      if (emailFilter && nameFilter) {
        query = query.or(`user.ilike.%${emailFilter}%,user.ilike.%${nameFilter}%`);
      } else if (emailFilter) {
        query = query.ilike("user", `%${emailFilter}%`);
      } else if (nameFilter) {
        query = query.ilike("user", `%${nameFilter}%`);
      }
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Normalize order items and fields if necessary
    const formattedOrders = (orders || []).map((o: any) => {
      let parsedItems = o.items;
      if (typeof parsedItems === "string") {
        try {
          parsedItems = JSON.parse(parsedItems);
        } catch {
          parsedItems = [];
        }
      }

      // Check if address/phone/userEmail are stored inside items metadata
      let address = o.address || "123 Fast Food Blvd";
      let phone = o.phone || "+1 (555) 019-2834";
      let userEmail = o.userEmail;
      let actualItems = parsedItems;

      if (parsedItems && !Array.isArray(parsedItems) && parsedItems.items) {
        address = parsedItems.address || address;
        phone = parsedItems.phone || phone;
        userEmail = parsedItems.userEmail || userEmail;
        actualItems = parsedItems.items;
      }

      return {
        id: o.id,
        user: o.user,
        userEmail: userEmail || o.user,
        date: o.date,
        total: parseFloat(o.total) || 0,
        status: o.status,
        address: address,
        phone: phone,
        items: Array.isArray(actualItems) ? actualItems : [],
        created_at: o.created_at,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (e: any) {
    console.error("Error fetching orders from Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to fetch orders" }, { status: 500 });
  }
}

// POST create a new order
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, userEmail, address, phone, total, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    const orderDate = new Date().toISOString().split("T")[0];
    const userIdentifier = userEmail ? `${user || "Customer"} (${userEmail})` : (user || "Customer");

    // Package items and order shipping details into JSON structure
    const payloadItems = {
      items: items.map((i: any) => ({
        id: i.id,
        name: i.name,
        qty: i.quantity || i.qty || 1,
        price: parseFloat(i.price) || 0,
      })),
      address: address || "123 Fast Food Blvd",
      phone: phone || "+1 (555) 019-2834",
      userEmail: userEmail || "",
    };

    const { data: newOrder, error } = await supabase
      .from("orders")
      .insert({
        user: userIdentifier,
        items: payloadItems,
        total: parseFloat(total) || 0,
        status: "Pending",
        date: orderDate,
      })
      .select()
      .single();

    if (error) throw error;

    // Deduct stocks in Supabase products table
    for (const item of items) {
      if (item.id) {
        const { data: prod } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (prod && prod.stock !== undefined) {
          const newStock = Math.max(0, prod.stock - (item.quantity || item.qty || 1));
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        user: newOrder.user,
        userEmail: userEmail,
        date: newOrder.date,
        total: newOrder.total,
        status: newOrder.status,
        address: address,
        phone: phone,
        items: payloadItems.items,
      },
    });
  } catch (e: any) {
    console.error("Error creating order in Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to create order" }, { status: 500 });
  }
}

// PUT update order status
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order: data });
  } catch (e: any) {
    console.error("Error updating order in Supabase:", e);
    return NextResponse.json({ error: e.message || "Failed to update order" }, { status: 500 });
  }
}
