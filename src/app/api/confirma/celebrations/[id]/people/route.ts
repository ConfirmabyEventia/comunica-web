import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("invitation_groups")
      .select(
        `
        id,
        celebration_id,
        guests (
          id,
          guest_code,
          full_name,
          phone,
          email,
          is_principal_contact,
          rsvp_status,
          rsvp_attending
        )
        `
      )
      .eq("celebration_id", id);

    if (error) {
      console.error(
        "Error loading CONFIRMA people:",
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

    const people =
      data?.flatMap((group) =>
        (group.guests ?? []).map((guest) => ({
          id: guest.id,
          guest_code: guest.guest_code,
          name: guest.full_name,
          phone: guest.phone,
          email: guest.email,
          is_principal_contact:
            guest.is_principal_contact,
          rsvp_status:
            guest.rsvp_status,
          rsvp_attending:
            guest.rsvp_attending,
          invitation_group_id:
            group.id,
        }))
      ) ?? [];

    return NextResponse.json({
      ok: true,
      people,
    });
  } catch (error) {
    console.error(
      "Unexpected CONFIRMA people error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "No fue posible cargar las personas de CONFIRMA.",
      },
      { status: 500 }
    );
  }
}