import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("celebrations")
      .select(
        `
        id,
        celebration_code,
        name,
        event_date,
        status,
        guest_count
        `
      )
      .order("event_date", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading CONFIRMA celebrations:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
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
      "Unexpected CONFIRMA celebrations error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "No fue posible consultar las celebraciones de CONFIRMA.",
      },
      { status: 500 }
    );
  }
}