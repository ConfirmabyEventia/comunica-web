import { NextResponse } from "next/server";

import { confirmaServer } from "@/lib/confirmaServer";

export async function GET() {
  try {
    const {
      data,
      error,
    } = await confirmaServer
      .from("celebrations")
      .select(
        `
          id,
          name,
          event_date,
          important_details
        `
      )
      .neq("status", "archived")
      .order("event_date", {
        ascending: true,
      });

    if (error) {
      console.error(
        "ERROR LEYENDO CELEBRACIONES DE CONFIRMA:",
        error
      );

      return NextResponse.json(
        {
          error:
            "No fue posible cargar las celebraciones de CONFIRMA.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      celebrations: data ?? [],
    });
  } catch (error) {
    console.error(
      "ERROR EN API CONFIRMA:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado.",
      },
      {
        status: 500,
      }
    );
  }
}