import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

type Props = {
  params: Promise<{ id: string }>;
};

type Communication = {
  id: string;
  title: string;
  message: string;
  content_html?: string | null;
  color_theme?: string | null;
  typography?: string | null;
  button_text?: string | null;
  button_url?: string | null;
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
    fontFamily:
      "'Cormorant Garamond', serif",
  },

  clasica: {
    fontFamily:
      "'Playfair Display', serif",
  },

  contemporanea: {
    fontFamily:
      "'Montserrat', sans-serif",
  },

  romantica: {
    fontFamily:
      "'Allura', cursive",
  },
};

export default async function PublicMessagePage({
  params,
}: Props) {
  const { id } = await params;

  const {
    data,
    error,
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
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const communication =
    data as Communication;

  const activeColor =
    colorThemes[
      communication.color_theme ||
        "lavanda"
    ] ||
    colorThemes.lavanda;

  const activeTypography =
    typographyOptions[
      communication.typography ||
        "editorial"
    ] ||
    typographyOptions.editorial;

  const htmlContent =
    communication.content_html?.trim();

  return (
    <main
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding:
          "34px 20px 60px",

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
        style={{
          width: "100%",
          maxWidth: "680px",
          marginTop: "7vh",

          background:
            "var(--color-surface)",

          border:
            `1.5px solid ${activeColor.border}`,

          borderRadius: "30px",

          padding:
            "42px 40px",

          boxSizing: "border-box",

          boxShadow:
            "0 16px 45px rgba(60, 50, 35, 0.06)",
        }}
      >
        {/* BRAND */}

        <p
          style={{
            margin: 0,
            fontFamily:
              "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing:
              "0.2em",
            textTransform:
              "uppercase",
            color:
              activeColor.color,
          }}
        >
          EVENSSE · COMUNICA
        </p>

        {/* TITLE */}

        <h1
          style={{
            margin:
              "16px 0 0",

            fontFamily:
              activeTypography.fontFamily,

            fontSize:
              "clamp(2.15rem, 6vw, 3.4rem)",

            fontWeight: 500,

            lineHeight: 1.08,

            color:
              activeColor.color,

            letterSpacing:
              "-0.02em",
          }}
        >
          {communication.title}
        </h1>

        {/* DECORATIVE LINE */}

        <div
          style={{
            width: "54px",
            height: "1px",
            margin:
              "24px 0 28px",
            background:
              activeColor.color,
          }}
        />

        {/* CONTENT */}

        <div
          style={{
            fontFamily:
              activeTypography.fontFamily,

            fontSize: "1.05rem",

            lineHeight: 1.75,

            color:
              "var(--color-text-secondary)",

            overflowWrap:
              "anywhere",
          }}
        >
          {htmlContent ? (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  htmlContent,
              }}
              style={{
                width: "100%",
              }}
            />
          ) : (
            <div
              style={{
                whiteSpace:
                  "pre-wrap",
              }}
            >
              {communication.message}
            </div>
          )}
        </div>

        {/* BUTTON */}

        {communication.button_text &&
          communication.button_url && (
            <a
              href={
                communication.button_url
              }
              target="_blank"
              rel="noreferrer"
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                marginTop:
                  "28px",

                minHeight:
                  "48px",

                padding:
                  "0 22px",

                borderRadius:
                  "999px",

                background:
                  activeColor.color,

                color: "#FFFFFF",

                fontFamily:
                  "var(--font-body)",

                fontSize:
                  "0.92rem",

                fontWeight: 500,

                textDecoration:
                  "none",
              }}
            >
              {
                communication.button_text
              }
            </a>
          )}
      </article>
    </main>
  );
}