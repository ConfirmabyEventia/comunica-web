import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.WP_STUDIO_SUPABASE_URL;
  const serviceRoleKey = process.env.WP_STUDIO_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Faltan las variables de conexión de WP STUDIO." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("wedding_planners")
    .select("wp_id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading Wedding Planners:", error);
    return NextResponse.json(
      { error: "No fue posible cargar los Wedding Planners." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    weddingPlanners: data ?? [],
  });
}
