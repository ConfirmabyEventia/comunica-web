import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl =
      process.env.WP_STUDIO_SUPABASE_URL ??
      process.env.CONFIRMA_SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.WP_STUDIO_SUPABASE_SERVICE_ROLE_KEY ??
      process.env.CONFIRMA_SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          ok: false,
          weddingPlanners: [],
          error:
            "Faltan las variables de conexión de WP STUDIO/CONFIRMA.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase
      .from("wedding_planners")
      .select("wp_id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error(
        "Error cargando Wedding Planners:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          weddingPlanners: [],
          error:
            "No fue posible cargar los Wedding Planners.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      weddingPlanners: data ?? [],
    });
  } catch (error) {
    console.error(
      "Error en /api/wedding-planners:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        weddingPlanners: [],
        error:
          error instanceof Error
            ? error.message
            : "No fue posible cargar los Wedding Planners.",
      },
      { status: 500 }
    );
  }
}