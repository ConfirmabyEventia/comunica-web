import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("celebrations")
      .select("id")
      .limit(1);

    if (error) {
      console.error("CONFIRMA connection error:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          details: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "COMUNICA está conectado a CONFIRMA.",
      foundCelebrations: data?.length ?? 0,
    });
  } catch (error) {
    console.error("Unexpected connection error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected connection error",
      },
      { status: 500 }
    );
  }
}