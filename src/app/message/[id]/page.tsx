
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

export default async function MessagePage({ params }: Props) {
  const { id } = await params;
  const code = decodeURIComponent(id).trim();

  // Los enlaces de comunicaciones usan UUID; los de mesas usan códigos.
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

    if (!data) notFound();

    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 18px",
          background: "#F7F5EF",
          color: "#4F5142",
          fontFamily: data.typography || "Georgia, serif",
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
          <h1
            style={{
              textAlign: "center",
              fontSize: "32px",
              fontWeight: 400,
              margin: "0 0 24px",
            }}
          >
            {data.title}
          </h1>

          {data.content_html ? (
            <div dangerouslySetInnerHTML={{ __html: data.content_html }} />
          ) : (
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {data.message}
            </p>
          )}

          {data.button_text && data.button_url && (
            <p style={{ textAlign: "center", marginTop: "28px" }}>
              <a
                href={data.button_url}
                style={{
                  display: "inline-block",
                  padding: "12px 22px",
                  borderRadius: "10px",
                  background: data.color_theme || "#596047",
                  color: "#FFFFFF",
                  textDecoration: "none",
                }}
              >
                {data.button_text}
              </a>
            </p>
          )}
        </article>
      </main>
    );
  }

  // Desde aquí continúa la página de asignación de mesas.
  const { data: groupCode, error: codeError } = await supabase
    .from("table_group_codes")
    .select("event_id, principal_person_id, code")
    .eq("code", code)
    .maybeSingle();

  if (codeError) {
    console.error("Error buscando código de mesas:", codeError);
    throw new Error("No fue posible consultar el código de acceso.");
  }

  if (!groupCode) notFound();

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

  if (!principal) notFound();

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
