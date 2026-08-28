import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

type ColorTheme = {
  id: string;
  name: string;
  color: string;
  soft: string;
};

type Typography = {
  id: string;
  name: string;
  font: string;
  fontFamily: string;
};

const colorThemes: ColorTheme[] = [
  {
    id: "salvia",
    name: "Salvia",
    color: "#A7A98A",
    soft: "#EEF0E7",
  },
  {
    id: "lavanda",
    name: "Lavanda",
    color: "#B8A5BD",
    soft: "#F1EBF3",
  },
  {
    id: "terracota",
    name: "Terracota",
    color: "#C97A5B",
    soft: "#F6E9E3",
  },
  {
    id: "arena",
    name: "Arena",
    color: "#D8C4A4",
    soft: "#F5EFE6",
  },
  {
    id: "azul-niebla",
    name: "Azul Niebla",
    color: "#7890A1",
    soft: "#E9EFF2",
  },
  {
    id: "vino",
    name: "Vino",
    color: "#76283A",
    soft: "#F1E4E7",
  },
];

const typographyOptions: Typography[] = [
  {
    id: "editorial",
    name: "Editorial",
    font: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', serif",
  },
  {
    id: "clasica",
    name: "Clásica",
    font: "Playfair Display",
    fontFamily: "'Playfair Display', serif",
  },
  {
    id: "contemporanea",
    name: "Contemporánea",
    font: "Montserrat",
    fontFamily: "'Montserrat', sans-serif",
  },
  {
    id: "romantica",
    name: "Suave",
    font: "Trebuchet MS",
    fontFamily: "'Trebuchet MS', Arial, sans-serif",
  },
];

type Person = {
  id: string;
  name: string;
  titular_name: string | null;
};

type Assignment = {
  person_id: string;
  table_number: string | null;
  table_name: string | null;
};

export default async function PublicMessagePage({
  params,
}: Props) {
  const { id } = await params;

  const publicCode = id.trim().toUpperCase();

  /*
   * =========================================================
   * 1. BUSCAR EL CÓDIGO DEL TITULAR
   * =========================================================
   */

  const {
    data: groupCode,
    error: groupCodeError,
  } = await supabase
    .from("table_group_codes")
    .select(
      `
        principal_person_id,
        code
      `
    )
    .eq("code", publicCode)
    .single();

  if (groupCodeError || !groupCode) {
    notFound();
  }

  /*
   * =========================================================
   * 2. BUSCAR AL TITULAR
   * =========================================================
   */

  const {
    data: principal,
    error: principalError,
  } = await supabase
    .from("people")
    .select(
      `
        id,
        event_id,
        name,
        titular_name
      `
    )
    .eq(
      "id",
      groupCode.principal_person_id
    )
    .single();

  if (principalError || !principal) {
    notFound();
  }

  /*
   * =========================================================
   * 3. BUSCAR EL EVENTO
   *
   * El nombre del evento será utilizado para:
   *
   * {{nombre_de_los_novios}}
   *
   * y también:
   *
   * {{nombre_evento}}
   * =========================================================
   */

  const {
    data: event,
    error: eventError,
  } = await supabase
    .from("events")
    .select("name")
    .eq("id", principal.event_id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  const eventName =
    String(event.name ?? "").trim();

  /*
   * =========================================================
   * 4. BUSCAR TODOS LOS INTEGRANTES
   *    DEL GRUPO FAMILIAR
   * =========================================================
   */

  const {
    data: familyPeople,
    error: familyError,
  } = await supabase
    .from("people")
    .select(
      `
        id,
        name,
        titular_name
      `
    )
    .eq("event_id", principal.event_id)
    .eq("titular_name", principal.name)
    .order("name");

  if (familyError) {
    notFound();
  }

  const people: Person[] =
    familyPeople ?? [];

  /*
   * =========================================================
   * 5. BUSCAR LAS MESAS DE TODAS LAS PERSONAS
   * =========================================================
   */

  const personIds = people.map(
    (person) => person.id
  );

  let assignments: Assignment[] = [];

  if (personIds.length > 0) {
    const {
      data: assignmentData,
      error: assignmentError,
    } = await supabase
      .from("table_assignments")
      .select(
        `
          person_id,
          table_number,
          table_name
        `
      )
      .eq("event_id", principal.event_id)
      .in("person_id", personIds);

    if (assignmentError) {
      notFound();
    }

    assignments =
      (assignmentData ?? []) as Assignment[];
  }

  /*
   * =========================================================
   * 6. BUSCAR LA COMUNICACIÓN
   * =========================================================
   */

  const {
    data: communication,
    error: communicationError,
  } = await supabase
    .from("communications")
    .select(
      `
        id,
        title,
        message,
        content_html,
        color_theme,
        typography,
        button_text,
        button_url,
        is_published
      `
    )
    .eq(
      "internal_name",
      "Asignación de mesas"
    )
    .eq("is_published", true)
    .single();

  if (
    communicationError ||
    !communication
  ) {
    notFound();
  }

  /*
   * =========================================================
   * 7. TEMA
   * =========================================================
   */

  const activeColor =
    colorThemes.find(
      (theme) =>
        theme.id ===
        communication.color_theme
    ) ?? colorThemes[0];

  const activeTypography =
    typographyOptions.find(
      (font) =>
        font.id ===
        communication.typography
    ) ?? typographyOptions[0];

  /*
   * =========================================================
   * 8. MAPA DE ASIGNACIONES
   * =========================================================
   */

  const assignmentByPerson =
    new Map(
      assignments.map((assignment) => [
        assignment.person_id,
        assignment,
      ])
    );

  /*
   * =========================================================
   * 9. CONSTRUIR LAS TARJETAS DE MESAS
   *
   * CORRECCIÓN:
   *
   * Si table_number = "Mesa 2"
   * y table_name = "Mesa 2"
   *
   * NO mostramos:
   *
   * Mesa Mesa 2 · Mesa 2
   *
   * Mostramos solamente:
   *
   * Mesa 2
   * =========================================================
   */

  const assignmentHtml = people
    .map((person) => {
      const assignment =
        assignmentByPerson.get(
          person.id
        );

      const rawTableNumber =
        String(
          assignment?.table_number ?? ""
        ).trim();

      const rawTableName =
        String(
          assignment?.table_name ?? ""
        ).trim();

      let tableText =
        "Mesa por confirmar";

      const normalizedNumber =
        rawTableNumber.toLowerCase();

      const normalizedName =
        rawTableName.toLowerCase();

      if (
        rawTableNumber &&
        rawTableName &&
        normalizedNumber ===
          normalizedName
      ) {
        tableText = rawTableNumber;
      } else if (
        rawTableNumber &&
        rawTableName
      ) {
        /*
         * Si ambos campos son diferentes,
         * intentamos evitar repetir "Mesa".
         */

        const cleanNumber =
          rawTableNumber.replace(
            /^mesa\s*/i,
            ""
          );

        const cleanName =
          rawTableName.replace(
            /^mesa\s*/i,
            ""
          );

        if (
          cleanNumber &&
          cleanName &&
          cleanNumber.toLowerCase() ===
            cleanName.toLowerCase()
        ) {
          tableText = `Mesa ${cleanNumber}`;
        } else if (
          rawTableName
            .toLowerCase()
            .startsWith("mesa ")
        ) {
          tableText =
            rawTableName;
        } else if (
          rawTableNumber
            .toLowerCase()
            .startsWith("mesa ")
        ) {
          tableText =
            rawTableNumber;
        } else {
          tableText = `Mesa ${rawTableNumber} · ${rawTableName}`;
        }
      } else if (rawTableNumber) {
        if (
          rawTableNumber
            .toLowerCase()
            .startsWith("mesa ")
        ) {
          tableText =
            rawTableNumber;
        } else {
          tableText =
            `Mesa ${rawTableNumber}`;
        }
      } else if (rawTableName) {
        tableText =
          rawTableName;
      }

      return `
        <div style="
          margin: 0 0 14px;
          padding: 14px 16px;
          border-radius: 14px;
          background: ${activeColor.soft};
        ">
          <div style="
            font-weight: 600;
            color: ${activeColor.color};
          ">
            ${escapeHtml(person.name)}
          </div>

          <div style="
            margin-top: 4px;
            font-size: 0.92rem;
            color: #5F5A55;
          ">
            ${escapeHtml(tableText)}
          </div>
        </div>
      `;
    })
    .join("");

  /*
   * =========================================================
   * 10. REEMPLAZAR VARIABLES
   * =========================================================
   *
   * {{nombre_titular}}
   * {{asignacion_mesas}}
   * {{nombre_de_los_novios}}
   * {{nombre_evento}}
   */

  const replaceVariables = (
    content: string
  ): string => {
    return content
      .replace(
        /\{\{nombre_titular\}\}/g,
        escapeHtml(principal.name)
      )
      .replace(
        /\{\{asignacion_mesas\}\}/g,
        assignmentHtml
      )
      .replace(
        /\{\{nombre_de_los_novios\}\}/g,
        escapeHtml(eventName)
      )
      .replace(
        /\{\{nombre_evento\}\}/g,
        escapeHtml(eventName)
      );
  };

  /*
   * =========================================================
   * 11. CONTENIDO FINAL
   * =========================================================
   */

  const hasHtml =
    typeof communication.content_html ===
      "string" &&
    communication.content_html
      .trim()
      .length > 0;

  const renderedHtml = hasHtml
    ? replaceVariables(
        communication.content_html
      )
    : "";

  const renderedMessage =
    replaceVariables(
      communication.message ?? ""
    );

  /*
   * =========================================================
   * 12. RENDER
   * =========================================================
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "34px 20px 60px",
        background: `linear-gradient(
          180deg,
          ${activeColor.soft} 0%,
          #FBF9F4 48%,
          #F8F5EF 100%
        )`,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: "680px",
          marginTop: "7vh",
          background: "#FFFFFF",
          border: `1px solid ${activeColor.color}30`,
          borderRadius: "30px",
          padding: "42px 40px",
          boxSizing: "border-box",
          boxShadow:
            "0 16px 45px rgba(60, 50, 35, 0.06)",
        }}
      >
        {/* BRAND */}

        <p
          style={{
            margin: 0,
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: activeColor.color,
            textAlign: "center",
          }}
        >
          EVENSSE · COMUNICA
        </p>

        {/* DECORATIVE LINE */}

        <div
          style={{
            width: "54px",
            height: "1px",
            margin: "24px auto 0",
            background:
              activeColor.color,
          }}
        />

        {/* TITLE */}

        <h1
          style={{
            margin: "24px 0 0",
            fontFamily:
              activeTypography.fontFamily,
            fontSize:
              activeTypography.id ===
              "romantica"
                ? "clamp(2.8rem, 8vw, 4rem)"
                : "clamp(2.15rem, 6vw, 3.4rem)",
            fontWeight:
              activeTypography.id ===
              "romantica"
                ? 400
                : 500,
            lineHeight: 1.08,
            color: activeColor.color,
            textAlign: "center",
          }}
        >
          {communication.title}
        </h1>

        {/* MESSAGE */}

        <div
          style={{
            marginTop: "30px",
            fontFamily:
              activeTypography.fontFamily,
            fontSize:
              activeTypography.id ===
              "romantica"
                ? "1.35rem"
                : "1rem",
            lineHeight: 1.75,
            color: "#4F4A45",
            overflowWrap: "anywhere",
          }}
        >
          {hasHtml ? (
            <div
              dangerouslySetInnerHTML={{
                __html: renderedHtml,
              }}
            />
          ) : (
            <div
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              {renderedMessage}
            </div>
          )}
        </div>

        {/* BUTTON */}

        {communication.button_text &&
          communication.button_url && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <a
                href={
                  communication.button_url
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  display:
                    "inline-flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  marginTop: "30px",
                  minHeight: "48px",
                  padding: "0 24px",
                  borderRadius: "999px",
                  background:
                    activeColor.color,
                  color: "#FFFFFF",
                  fontFamily:
                    "'Montserrat', sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  boxShadow:
                    "0 8px 20px rgba(60, 50, 35, 0.10)",
                }}
              >
                {
                  communication.button_text
                }
              </a>
            </div>
          )}

        {/* FOOTER */}

        <div
          style={{
            marginTop: "38px",
            paddingTop: "22px",
            borderTop: `1px solid ${activeColor.color}20`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily:
                "'Montserrat', sans-serif",
              fontSize: "0.68rem",
              letterSpacing: "0.14em",
              textTransform:
                "uppercase",
              color: "#99918A",
            }}
          >
            COMUNICA · EVENSSE
          </span>
        </div>
      </article>

      <style>
        {`
          img {
            max-width: 100%;
            height: auto;
          }

          article p {
            margin-left: 0;
            margin-right: 0;
          }

          article img {
            display: block;
          }

          article a {
            overflow-wrap: anywhere;
          }
        `}
      </style>
    </main>
  );
}

/*
 * =========================================================
 * ESCAPAR TEXTO
 * =========================================================
 */

function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}