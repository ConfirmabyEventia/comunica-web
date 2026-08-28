import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

type Props = {
  params: Promise<{ id: string }>;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  message: string | null;
  content_html: string | null;
  color_theme: string | null;
  typography: string | null;
  button_text: string | null;
  button_url: string | null;
};

const colorThemes: Record<
  string,
  {
    name: string;
    color: string;
    soft: string;
    border: string;
  }
> = {
  salvia: {
    name: "Salvia",
    color: "#A7A98A",
    soft: "#EEF0E7",
    border: "#A7A98A",
  },

  lavanda: {
    name: "Lavanda",
    color: "#B8A5BD",
    soft: "#F1EBF3",
    border: "#B8A5BD",
  },

  terracota: {
    name: "Terracota",
    color: "#C97A5B",
    soft: "#F6E9E3",
    border: "#C97A5B",
  },

  arena: {
    name: "Arena",
    color: "#D8C4A4",
    soft: "#F5EFE6",
    border: "#D8C4A4",
  },

  "azul-niebla": {
    name: "Azul Niebla",
    color: "#7890A1",
    soft: "#E9EFF2",
    border: "#7890A1",
  },

  vino: {
    name: "Vino",
    color: "#76283A",
    soft: "#F1E4E7",
    border: "#76283A",
  },
};

const typographyOptions: Record<
  string,
  {
    name: string;
    fontFamily: string;
  }
> = {
  editorial: {
    name: "Editorial",
    fontFamily: "'Cormorant Garamond', serif",
  },

  clasica: {
    name: "Clásica",
    fontFamily: "'Playfair Display', serif",
  },

  contemporanea: {
    name: "Contemporánea",
    fontFamily: "'Montserrat', sans-serif",
  },

 romantica: {
  name: "Suave",
  fontFamily: "'Trebuchet MS', Arial, sans-serif",
},
};

export default async function TemplatePreviewPage({
  params,
}: Props) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("communication_templates")
    .select(
      `
        id,
        name,
        description,
        message,
        content_html,
        color_theme,
        typography,
        button_text,
        button_url
      `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const template = data as Template;

  const activeColor =
    colorThemes[
      template.color_theme || "lavanda"
    ] || colorThemes.lavanda;

  const activeTypography =
    typographyOptions[
      template.typography || "editorial"
    ] || typographyOptions.editorial;

  const htmlContent =
    template.content_html?.trim();

  return (
    <main
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "34px 20px 60px",
        background: `linear-gradient(
          180deg,
          ${activeColor.soft} 0%,
          #FAF8F3 48%,
          #FAF8F3 100%
        )`,
      }}
    >
      {/* TOP BAR */}

      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <Link
          href="/dashboard/templates"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontSize: "0.86rem",
          }}
        >
          ← Volver a plantillas
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: activeColor.color,
            }}
          />

          <span
            style={{
              fontSize: "0.76rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
            }}
          >
            Vista previa
          </span>
        </div>
      </div>

      {/* TEMPLATE INFO */}

      <section
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto 26px",
          background: "#FFFFFF",
          border: "1px solid var(--color-border)",
          borderRadius: "22px",
          padding: "20px 24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.68rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Plantilla
            </p>

            <h1
              style={{
                margin: "6px 0 0",
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              {template.name}
            </h1>

            {template.description && (
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {template.description}
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                borderRadius: "999px",
                padding: "7px 12px",
                background: activeColor.soft,
                color: activeColor.color,
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {activeColor.name}
            </span>

            <span
              style={{
                borderRadius: "999px",
                padding: "7px 12px",
                background: "#F7F3EB",
                color: "var(--color-text-secondary)",
                fontSize: "0.75rem",
              }}
            >
              {activeTypography.name}
            </span>

            {/* EDIT TEMPLATE */}

            <Link
              href={`/dashboard/communications/new?template=${template.id}&editTemplate=true`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "38px",
                padding: "0 16px",
                borderRadius: "999px",
                background: activeColor.color,
                color: "#FFFFFF",
                fontSize: "0.78rem",
                fontWeight: 500,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Editar plantilla →
            </Link>
          </div>
        </div>
      </section>

      {/* PUBLIC-STYLE PREVIEW */}

      <article
        style={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          background: "var(--color-surface)",
          border: `1.5px solid ${activeColor.border}`,
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
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: activeColor.color,
          }}
        >
          EVENSSE · COMUNICA
        </p>

        {/* TITLE */}

        <h2
          style={{
            margin: "16px 0 0",
            fontFamily:
              activeTypography.fontFamily,
            fontSize:
              "clamp(2.15rem, 6vw, 3.4rem)",
            fontWeight: 500,
            lineHeight: 1.08,
            color: activeColor.color,
            letterSpacing: "-0.02em",
          }}
        >
          {template.name}
        </h2>

        {/* LINE */}

        <div
          style={{
            width: "54px",
            height: "1px",
            margin: "24px 0 28px",
            background: activeColor.color,
          }}
        />

        {/* CONTENT */}

        <div
          style={{
            fontFamily:
              activeTypography.fontFamily,
            fontSize: "1.05rem",
            lineHeight: 1.75,
            color: "var(--color-text-secondary)",
            overflowWrap: "anywhere",
          }}
        >
          {htmlContent ? (
            <div
              dangerouslySetInnerHTML={{
                __html: htmlContent,
              }}
              style={{
                width: "100%",
              }}
            />
          ) : (
            <div
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              {template.message || ""}
            </div>
          )}
        </div>

        {/* BUTTON */}

        {template.button_text &&
          template.button_url && (
            <a
              href={template.button_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "28px",
                minHeight: "48px",
                padding: "0 22px",
                borderRadius: "999px",
                background: activeColor.color,
                color: "#FFFFFF",
                fontFamily: "var(--font-body)",
                fontSize: "0.92rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              {template.button_text}
            </a>
          )}
      </article>
    </main>
  );
}