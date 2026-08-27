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
    name: "Romántica",
    font: "Allura",
    fontFamily: "'Allura', cursive",
  },
];

export default async function PublicMessagePage({
  params,
}: Props) {
  const { id } = await params;

  const { data, error } = await supabase
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
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const activeColor =
    colorThemes.find(
      (theme) => theme.id === data.color_theme
    ) ?? colorThemes[1];

  const activeTypography =
    typographyOptions.find(
      (font) => font.id === data.typography
    ) ?? typographyOptions[0];

  /*
   * Comunicaciones nuevas:
   * usamos content_html para conservar formato,
   * imágenes, alineación, negrita, cursiva, etc.
   *
   * Comunicaciones antiguas:
   * si content_html es null, usamos message como respaldo.
   */
  const hasHtml =
    typeof data.content_html === "string" &&
    data.content_html.trim().length > 0;

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
            background: activeColor.color,
          }}
        />

        {/* TITLE */}
        <h1
          style={{
            margin: "24px 0 0",
            fontFamily: activeTypography.fontFamily,
            fontSize:
              activeTypography.id === "romantica"
                ? "clamp(2.8rem, 8vw, 4rem)"
                : "clamp(2.15rem, 6vw, 3.4rem)",
            fontWeight:
              activeTypography.id === "romantica"
                ? 400
                : 500,
            lineHeight: 1.08,
            color: activeColor.color,
            textAlign: "center",
          }}
        >
          {data.title}
        </h1>

        {/* MESSAGE */}
        <div
          style={{
            marginTop: "30px",
            fontFamily: activeTypography.fontFamily,
            fontSize:
              activeTypography.id === "romantica"
                ? "1.35rem"
                : "1rem",
            lineHeight: 1.75,
            color: "#4F4A45",
            overflowWrap: "anywhere",
          }}
        >

          <div
  style={{
    background: "red",
    color: "white",
    padding: "10px",
    marginBottom: "20px",
    fontWeight: 700,
  }}
>
  PRUEBA HTML NUEVA
</div>
          {hasHtml ? (
            <div
              dangerouslySetInnerHTML={{
                __html: data.content_html,
              }}
            />
          ) : (
            <div
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              {data.message}
            </div>
          )}
        </div>

        {/* BUTTON */}
        {data.button_text && data.button_url && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <a
              href={data.button_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "30px",
                minHeight: "48px",
                padding: "0 24px",
                borderRadius: "999px",
                background: activeColor.color,
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
              {data.button_text}
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
              textTransform: "uppercase",
              color: "#99918A",
            }}
          >
            COMUNICA · EVENSSE
          </span>
        </div>
      </article>

      {/* 
        Small global adjustments for HTML generated
        by the communication editor.
      */}
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