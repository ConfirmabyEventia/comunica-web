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
          celebrations: [],
          error:
            "Faltan las variables de conexión de CONFIRMA/WP STUDIO.",
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
      .from("celebrations")
      .select(
        "id, name, event_date, celebration_code, wp_id, important_details"
      )
      .order("event_date", {
        ascending: true,
        nullsFirst: false,
      });

    if (error) {
      console.error(
        "Error cargando celebraciones de CONFIRMA:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          celebrations: [],
          error:
            "No fue posible cargar las celebraciones de CONFIRMA.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      celebrations: data ?? [],
    });
  } catch (error) {
    console.error(
      "Error en /api/confirma/celebrations:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        celebrations: [],
        error:
          error instanceof Error
            ? error.message
            : "No fue posible cargar las celebraciones de CONFIRMA.",
      },
      { status: 500 }
    );
  }
}