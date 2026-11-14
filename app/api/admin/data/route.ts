import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Tumhare /api/admin/me jaisa hi auth - Cookie se role check
function checkAuth(req: NextRequest) {
  const role = req.cookies.get("role")?.value || null;
  if (!role) return null;
  if (role !== "admin" && role !== "master") return null;
  return { role, isMaster: role === "master" };
}

export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;
  const isMaster = auth.isMaster;

  try {
    if (action === "get-all") {
      const [tools, offers, posts, comments] = await Promise.all([
        supabaseAdmin.from("tools").select("*").order("name"),
        supabaseAdmin.from("notifications").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("blogs").select("*").neq("is_deleted", true).order("created_at", { ascending: false }),
        supabaseAdmin.from("comments").select("*").neq("is_deleted", true).order("created_at", { ascending: false }),
      ]);
      return NextResponse.json({ tools: tools.data, offers: offers.data, posts: posts.data, comments: comments.data });
    }

    if (action === "get-trash" && isMaster) {
      const tp = await supabaseAdmin.from("blogs").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false });
      const tc = await supabaseAdmin.from("comments").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false });
      return NextResponse.json({ trashPosts: tp.data, trashComments: tc.data });
    }

    if (action === "get-trash-count") {
      const c1 = await supabaseAdmin.from("blogs").select("id", { count: "exact", head: true }).eq("is_deleted", true);
      const c2 = await supabaseAdmin.from("comments").select("id", { count: "exact", head: true }).eq("is_deleted", true);
      return NextResponse.json({ count: (c1.count || 0) + (c2.count || 0) });
    }

    if (action === "toggle-tool") {
      const { error } = await supabaseAdmin.from("tools").update({ is_active: body.is_active }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "toggle-menu") {
      const { error } = await supabaseAdmin.from("tools").update({ menu_visible: body.menu_visible }).eq("id", body.id);
      if (error) throw error;
      await supabaseAdmin.from("tool_history").insert([{ tool_id: body.id, tool_name: body.name, action: body.menu_visible ? "Menu ON" : "Menu OFF", by_role: isMaster ? "master" : "admin" }]);
      return NextResponse.json({ success: true });
    }

    if (action === "public-off") {
      const { error } = await supabaseAdmin.from("tools").update({ public_open: false, public_reason: body.reason, public_off_at: new Date().toISOString(), public_auto_on_at: body.autoOnAt, public_locked_by: isMaster ? "master" : null }).eq("id", body.id);
      if (error) throw error;
      await supabaseAdmin.from("tool_history").insert([{ tool_id: body.id, tool_name: body.name, action: "Public OFF", by_role: isMaster ? "master" : "admin", reason: body.reason, auto_on_at: body.autoOnAt }]);
      return NextResponse.json({ success: true });
    }

    if (action === "public-on") {
      const { data } = await supabaseAdmin.from("tools").select("public_locked_by").eq("id", body.id).single();
      if (data?.public_locked_by === "master" && !isMaster) return NextResponse.json({ error: "Master locked" }, { status: 403 });
      const { error } = await supabaseAdmin.from("tools").update({ public_open: true, public_reason: "", public_auto_on_at: null, public_locked_by: null }).eq("id", body.id);
      if (error) throw error;
      await supabaseAdmin.from("tool_history").insert([{ tool_id: body.id, tool_name: body.name, action: "Public ON", by_role: isMaster ? "master" : "admin" }]);
      return NextResponse.json({ success: true });
    }

    if (action === "update-tool") {
      const { error } = await supabaseAdmin.from("tools").update({ name: body.name, slug: body.slug }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "fix-slugs") {
      for (const t of body.tools) {
        if (!t.slug) {
          const newSlug = String(t.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          await supabaseAdmin.from("tools").update({ slug: newSlug }).eq("id", t.id);
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === "tool-history") {
      const { data } = await supabaseAdmin.from("tool_history").select("*").eq("tool_id", body.toolId).order("created_at", { ascending: false }).limit(10);
      return NextResponse.json({ data });
    }

    if (action === "create-blog") {
      const { error } = await supabaseAdmin.from("blogs").insert([{ title: body.title, content: body.content, slug: body.slug }]);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "update-blog") {
      const { error } = await supabaseAdmin.from("blogs").update({ title: body.title, content: body.content, slug: body.slug }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "trash-blog") {
      const { error } = await supabaseAdmin.from("blogs").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: isMaster ? "master" : "admin" }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "trash-comment") {
      const { error } = await supabaseAdmin.from("comments").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: isMaster ? "master" : "admin" }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "approve-comment") {
      const { error } = await supabaseAdmin.from("comments").update({ is_approved: body.val, status: body.val ? "approved" : "pending" }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "restore-blog") {
      const { error } = await supabaseAdmin.from("blogs").update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete-blog-permanent" && isMaster) {
      const { error } = await supabaseAdmin.from("blogs").delete().eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "restore-comment") {
      const { error } = await supabaseAdmin.from("comments").update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete-comment-permanent" && isMaster) {
      const { error } = await supabaseAdmin.from("comments").delete().eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "upsert-notification") {
      if (body.id) {
        const { error } = await supabaseAdmin.from("notifications").update(body.payload).eq("id", body.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from("notifications").insert([body.payload]);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === "toggle-notification") {
      const { error } = await supabaseAdmin.from("notifications").update({ is_active: body.val }).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "delete-notification") {
      const { error } = await supabaseAdmin.from("notifications").delete().eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
