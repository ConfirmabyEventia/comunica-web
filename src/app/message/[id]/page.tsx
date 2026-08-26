import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicMessagePage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("communications")
    .select(
      "id, title, message, button_text, button_url, is_published"
    )
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "34px 20px 60px",
        background:
          "linear-gradient(180deg, #FBF9F4 0%, var(--color-background) 100%)",
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
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "30px",
          padding: "42px 40px",
          boxSizing: "border-box",
          boxShadow: "0 16px 45px rgba(60, 50, 35, 0.06)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          EVENSSE · COMUNICA
        </p>

        <h1
          style={{
            margin: "16px 0 0",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.15rem, 6vw, 3.4rem)",
            fontWeight: 500,
            lineHeight: 1.08,
            color: "var(--color-text)",
          }}
        >
          {data.title}
        </h1>

        <div
          style={{
            marginTop: "24px",
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--color-text-secondary)",
            whiteSpace: "pre-wrap",
          }}
        >
          {data.message}
        </div>

        {data.button_text && data.button_url && (
          <a
            href={data.button_url}
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
              background: "var(--color-primary)",
              color: "#FFFFFF",
              fontSize: "0.92rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {data.button_text}
          </a>
        )}
      </article>
    </main>
  );
}
