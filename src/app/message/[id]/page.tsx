
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Props = {
  params: Promise<{ id: string }>;
};

type Person = {
  id: string;
  name: string;
  event_id: string;
  titular_name: string | null;
};

type Assignment = {
  person_id: string;
  table_number: string | null;
  table_name: string | null;
};

type Communication = {
  id: string;
  title: string;
  message: string | null;
  content_html: string | null;
  color_theme: string | null;
  typography: string | null;
  button_text: string | null;
  button_url: string | null;
  is_published: boolean;
};

const colorThemes: Record<
  string,
  {
    color: string;
    soft: string;
    border: string;
  }
> = {
  salvia: {
    color: "#A7A98A",
    soft: "#EEF0E7",
    border: "#A7A98A",
  },
  lavanda: {
    color: "#B8A5BD",
    soft: "#F1EBF3",
    border: "#B8A5BD",
  },
  terracota: {
    color: "#C97A5B",
    soft: "#F6E9E3",
    border: "#C97A5B",
  },
  arena: {
    color: "#D8C4A4",
    soft: "#F5EFE6",
    border: "#D8C4A4",
  },
  "azul-niebla": {
    color: "#7890A1",
    soft: "#E9EFF2",
    border: "#7890A1",
  },
  vino: {
    color: "#76283A",
    soft: "#F1E4E7",
    border: "#76283A",
  },
};

const typographyOptions: Record<
  string,
  {
    fontFamily: string;
  }
> = {
  editorial: {
    fontFamily: "'Cormorant Garamond', serif",
  },
  clasica: {
    fontFamily: "'Playfair Display', serif",
  },
  contemporanea: {
    fontFamily: "'Montserrat', sans-serif",
  },
  romantica: {
    fontFamily: "'Allura', cursive",
  },
};

export default async function MessagePage({ params }: Props) {
  const { id } = await params;
  const code = decodeURIComponent(id).trim();

  // Los UUID corresponden a comunicaciones de COMUNICA.
  // Los códigos alfanuméricos corresponden a asignaciones de mesas.
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      code
    );

  if (isUUID) {
    const { data, error } = await supabase
      .from("communications")
      .select(
        "id, title, message, content_html, color_theme, typography, button_text, button_url, is_published"
      )
      .eq("id", code)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      console.error("Error buscando comunicación:", error);
      throw new Error("No fue posible consultar la comunicación.");
    }

    if (!data) {
      notFound();
    }

    const communication = data as Communication;

    const activeColor =
      colorThemes[communication.color_theme || "lavanda"] ||
      colorThemes.lavanda;

    const activeTypography =
      typographyOptions[
        communication.typography || "editorial"
      ] || typographyOptions.editorial;

    const htmlContent = communication.content_html?.trim();

    return (
      <main
        className="public-message-main"
        style={{
          minHeight: "100vh",
          boxSizing: "border-box",
          padding: "24px 12px 40px",
          background: `linear-gradient(
            180deg,
            ${activeColor.soft} 0%,
            #FAF8F3 48%,
            #FAF8F3 100%
          )`,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <article
          className="public-message-card"
          style={{
            width: "100%",
            maxWidth: "680px",
            marginTop: "3vh",
            background: "var(--color-surface, #FFFFFF)",
            border: `1.5px solid ${activeColor.border}`,
            borderRadius: "24px",
            padding: "32px 24px",
            boxSizing: "border-box",
            boxShadow: "0 16px 45px rgba(60, 50, 35, 0.06)",
            minWidth: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body, Arial, sans-serif)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: activeColor.color,
            }}
          >
            EVENSSE · COMUNICA
          </p>

          <h1
            style={{
              margin: "16px 0 0",
              fontFamily: activeTypography.fontFamily,
              fontSize: "clamp(2rem, 6vw, 3.4rem)",
              fontWeight: 500,
              lineHeight: 1.08,
              color: activeColor.color,
              letterSpacing: "-0.02em",
              overflowWrap: "anywhere",
              textAlign: "center",
            }}
          >
            {communication.title}
          </h1>

          <div
            style={{
              width: "54px",
              height: "1px",
              margin: "24px 0 28px",
              background: activeColor.color,
            }}
          />

          <div
            className="public-message-content"
            style={{
              width: "100%",
              minWidth: 0,
              fontFamily: activeTypography.fontFamily,
              fontSize: "1.05rem",
              lineHeight: 1.75,
              color: "var(--color-text-secondary, #665D54)",
              overflowWrap: "anywhere",
            }}
          >
            {htmlContent ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: htmlContent,
                }}
              />
            ) : (
              <div style={{ whiteSpace: "pre-wrap" }}>
                {communication.message ?? ""}
              </div>
            )}
          </div>

          {communication.button_text &&
            communication.button_url && (
              <a
                href={communication.button_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "28px",
                  minHeight: "48px",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  padding: "0 22px",
                  borderRadius: "999px",
                  background: activeColor.color,
                  color: "#FFFFFF",
                  fontFamily: "var(--font-body, Arial, sans-serif)",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  overflowWrap: "anywhere",
                }}
              >
                {communication.button_text}
              </a>
            )}
        </article>
      </main>
    );
  }

  // A partir de aquí se conserva la lógica de asignaciones de mesas.
  const { data: groupCode, error: codeError } = await supabase
    .from("table_group_codes")
    .select("event_id, principal_person_id, code")
    .eq("code", code)
    .maybeSingle();

  if (codeError) {
    console.error("Error buscando código de mesas:", codeError);
    throw new Error("No fue posible consultar el código de acceso.");
  }

  if (!groupCode) {
    notFound();
  }

  // Encontrar al titular del grupo.
  const { data: principal, error: principalError } = await supabase
    .from("people")
    .select("id, name, event_id, titular_name")
    .eq("id", groupCode.principal_person_id)
    .eq("event_id", groupCode.event_id)
    .maybeSingle();

  if (principalError) {
    console.error("Error buscando titular:", principalError);
    throw new Error("No fue posible consultar los datos del titular.");
  }

  if (!principal) {
    notFound();
  }

  // Obtener los integrantes del grupo familiar.
  const { data: eventPeople, error: peopleError } = await supabase
    .from("people")
    .select("id, name, event_id, titular_name")
    .eq("event_id", groupCode.event_id);

  if (peopleError) {
    console.error("Error buscando integrantes:", peopleError);
    throw new Error("No fue posible consultar los integrantes del grupo.");
  }

  const principalName = principal.name.trim();

  const members: Person[] = (eventPeople ?? []).filter(
    (person: Person) =>
      person.id === principal.id ||
      (person.titular_name ?? "").trim() === principalName
  );

  // Buscar las mesas asignadas a los integrantes.
  const memberIds = members.map((person) => person.id);
  let assignments: Assignment[] = [];

  if (memberIds.length > 0) {
    const { data, error: assignmentsError } = await supabase
      .from("table_assignments")
      .select("person_id, table_number, table_name")
      .eq("event_id", groupCode.event_id)
      .in("person_id", memberIds);

    if (assignmentsError) {
      console.error("Error buscando asignaciones:", assignmentsError);
      throw new Error("No fue posible consultar las mesas asignadas.");
    }

    assignments = (data ?? []) as Assignment[];
  }

  // Consultar el nombre de la celebración.
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("name")
    .eq("id", groupCode.event_id)
    .maybeSingle();

  if (eventError) {
    console.error("Error buscando celebración:", eventError);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 18px",
        background: "#F7F5EF",
        color: "#4F5142",
        fontFamily: "Georgia, serif",
      }}
    >
      <article
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          padding: "36px 26px",
          background: "#FFFFFF",
          border: "1px solid #E6E3D9",
          borderRadius: "22px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        }}
      >
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#8B8D70",
          }}
        >
          Información para invitados
        </p>

        <h1
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 400,
            margin: "20px 0 10px",
          }}
        >
          Tu asignación de mesas
        </h1>

        <p style={{ textAlign: "center", lineHeight: 1.7 }}>
          Hola, <strong>{principal.name}</strong>. 🤍
          <br />
          Aquí puedes consultar la mesa asignada a cada integrante de tu
          grupo familiar.
        </p>

        {event?.name && (
          <p
            style={{
              textAlign: "center",
              margin: "22px 0",
              color: "#777866",
              fontSize: "15px",
            }}
          >
            {event.name}
          </p>
        )}

        <div
          style={{
            marginTop: "28px",
            padding: "22px",
            background: "#F7F6F0",
            borderRadius: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "19px",
              fontWeight: 400,
              marginTop: 0,
              marginBottom: "18px",
            }}
          >
            Grupo familiar
          </h2>

          {members.map((person) => {
            const assignment = assignments.find(
              (item) => item.person_id === person.id
            );

            const table =
              assignment?.table_number?.trim() ||
              assignment?.table_name?.trim();

            return (
              <div
                key={person.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  padding: "15px 0",
                  borderBottom: "1px solid #E5E2D8",
                }}
              >
                <span style={{ lineHeight: 1.5 }}>{person.name}</span>

                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: "Arial, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#596047",
                    background: "#E9EBDD",
                    borderRadius: "9px",
                    padding: "9px 12px",
                  }}
                >
                  {table || "Mesa pendiente"}
                </span>
              </div>
            );
          })}

          {members.length === 0 && (
            <p>No encontramos integrantes asociados a este grupo.</p>
          )}
        </div>

        <p
          style={{
            marginTop: "26px",
            textAlign: "center",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          Te recomendamos revisar la información de cada integrante.
          <br />
          ¡Esperamos que disfruten muchísimo esta celebración! ✨
        </p>
      </article>
    </main>
  );
}
