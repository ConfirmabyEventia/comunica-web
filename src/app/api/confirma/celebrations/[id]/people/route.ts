import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface CelebrationMoment {
  id: string;
  name: string;
  name_en: string | null;
  moment_type: string;
  starts_at: string;
  ends_at: string | null;
}

interface GuestMomentAssignment {
  celebration_moment_id: string;
  celebration_moments:
    | CelebrationMoment
    | CelebrationMoment[]
    | null;
}

interface GuestMomentResponse {
  celebration_moment_id: string;
  attending: boolean | null;
  responded_at: string | null;
}

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
          rsvp_attending,

          guest_moment_assignments (
            celebration_moment_id,

            celebration_moments (
              id,
              name,
              name_en,
              moment_type,
              starts_at,
              ends_at
            )
          ),

          guest_moment_responses (
            celebration_moment_id,
            attending,
            responded_at
          )
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
      (data as any[] | null)?.flatMap((group) =>
        (group.guests ?? []).map((guest: any) => {
          const assignments =
            (guest.guest_moment_assignments ??
              []) as GuestMomentAssignment[];

          const responses =
            (guest.guest_moment_responses ??
              []) as GuestMomentResponse[];

          /*
           * Creamos un mapa para encontrar rápidamente
           * la respuesta de cada experiencia.
           */
          const responseMap = new Map<
            string,
            GuestMomentResponse
          >();

          responses.forEach((response) => {
            responseMap.set(
              response.celebration_moment_id,
              response
            );
          });

          /*
           * Las experiencias se obtienen de las
           * asignaciones, porque eso representa
           * a qué experiencias está invitada
           * cada persona.
           */
          const experiences = assignments
            .map((assignment) => {
              const moment =
                assignment.celebration_moments;

              if (!moment) {
                return null;
              }

              const normalizedMoment =
                Array.isArray(moment)
                  ? moment[0] ?? null
                  : moment;

              if (!normalizedMoment) {
                return null;
              }

              const response =
                responseMap.get(
                  assignment.celebration_moment_id
                );

              let status:
                | "confirmed"
                | "declined"
                | "pending";

              if (response?.attending === true) {
                status = "confirmed";
              } else if (
                response?.attending === false
              ) {
                status = "declined";
              } else {
                status = "pending";
              }

              return {
                id: normalizedMoment.id,
                name: normalizedMoment.name,
                name_en:
                  normalizedMoment.name_en,
                moment_type:
                  normalizedMoment.moment_type,
                starts_at:
                  normalizedMoment.starts_at,
                ends_at:
                  normalizedMoment.ends_at,

                attending:
                  response?.attending ?? null,

                responded_at:
                  response?.responded_at ?? null,

                status,
              };
            })
            .filter(Boolean)
            .sort(
              (a: any, b: any) =>
                new Date(
                  a.starts_at
                ).getTime() -
                new Date(
                  b.starts_at
                ).getTime()
            );

          return {
            id: guest.id,
            guest_code:
              guest.guest_code,

            name: guest.full_name,

            phone: guest.phone,

            email: guest.email,

            is_principal_contact:
              guest.is_principal_contact,

            /*
             * Estos siguen siendo útiles como
             * estado general del invitado.
             */
            rsvp_status:
              guest.rsvp_status,

            rsvp_attending:
              guest.rsvp_attending,

            invitation_group_id:
              group.id,

            /*
             * Aquí está la información importante:
             * cada experiencia trae SU PROPIO estado.
             */
            experiences,
          };
        })
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