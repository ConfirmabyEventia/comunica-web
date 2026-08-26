"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewCommunicationPage() {
  const [internalName, setInternalName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const publicUrl = createdId
    ? `https://comunica.evensse.com/message/${createdId}`
    : "";

  async function handleSave() {
    if (!internalName.trim() || !title.trim() || !message.trim()) {
      setError("Completa el nombre interno, el título y el mensaje.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setCopied(false);

      const { data, error: insertError } = await supabase
        .from("communications")
        .insert({
          internal_name: internalName.trim(),
          title: title.trim(),
          message: message.trim(),
          button_text: buttonText.trim() || null,
          button_url: buttonUrl.trim() || null,
          status: "Borrador",
          is_published: true,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      setCreatedId(data.id);
    } catch (err) {
      console.error("Error creating communication:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible crear la comunicación."
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("No fue posible copiar el enlace.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
      }}
    >
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "30px 46px 70px",
        }}
      >
        <Link
          href="/dashboard/communications"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "52px",
            color: "#D2C2A3",
            fontSize: "0.95rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>←</span>
          <span>Comunicaciones</span>
        </Link>

        <section style={{ marginBottom: "34px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
            }}
          >
            COMUNICA
          </p>

          <h1
            style={{
              margin: "10px 0 0",
              fontFamily: "var(--font-display)",
              fontSize: "3.35rem",
              fontWeight: 500,
              lineHeight: 1.05,
              color: "var(--color-text)",
            }}
          >
            Nueva comunicación
          </h1>

          <p
            style={{
              maxWidth: "650px",
              margin: "12px 0 0",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "var(--color-text-secondary)",
            }}
          >
            Crea el mensaje que compartirás por WhatsApp y genera el enlace
            público para SendPulse.
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "28px",
              padding: "30px 34px",
            }}
          >
            <div
              style={{
                marginBottom: "6px",
                fontSize: "0.76rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Contenido
            </div>

            <h2
              style={{
                margin: "4px 0 24px",
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              Escribe tu comunicación
            </h2>

            <label htmlFor="internal-name" style={labelStyle}>
              Nombre interno *
            </label>

            <input
              id="internal-name"
              value={internalName}
              onChange={(e) => setInternalName(e.target.value)}
              placeholder="Ej. Recordatorio de información"
              style={inputStyle}
            />

            <label htmlFor="title" style={labelStyle}>
              Título *
            </label>

            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Tenemos información importante para ti"
              style={inputStyle}
            />

            <label htmlFor="message" style={labelStyle}>
              Mensaje *
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe aquí el mensaje que verá la persona..."
              rows={11}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.65,
                minHeight: "230px",
              }}
            />

            <label htmlFor="button-text" style={labelStyle}>
              Texto del botón
              <span style={optionalStyle}>Opcional</span>
            </label>

            <input
              id="button-text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Ej. Ver información"
              style={inputStyle}
            />

            <label htmlFor="button-url" style={labelStyle}>
              Enlace del botón
              <span style={optionalStyle}>Opcional</span>
            </label>

            <input
              id="button-url"
              value={buttonUrl}
              onChange={(e) => setButtonUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />

            {error && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "#FBF4F1",
                  border: "1px solid #E8D8D1",
                  color: "#765F56",
                  fontSize: "0.88rem",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !!createdId}
              style={{
                width: "100%",
                minHeight: "50px",
                marginTop: "24px",
                border: "none",
                borderRadius: "999px",
                background:
                  saving || createdId
                    ? "#D9D5CC"
                    : "var(--color-primary)",
                color: "#FFFFFF",
                fontSize: "0.94rem",
                fontWeight: 500,
                cursor:
                  saving || createdId ? "not-allowed" : "pointer",
              }}
            >
              {saving
                ? "Guardando..."
                : createdId
                  ? "Comunicación creada"
                  : "Crear comunicación"}
            </button>
          </section>

          <section
            style={{
              background: "#FBF9F4",
              border: "1px solid var(--color-border)",
              borderRadius: "28px",
              padding: "30px",
              position: "sticky",
              top: "24px",
            }}
          >
            <div
              style={{
                fontSize: "0.76rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Vista previa
            </div>

            <h2
              style={{
                margin: "4px 0 22px",
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              Así lo verá la persona
            </h2>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #EEE7DA",
                borderRadius: "22px",
                padding: "24px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "1.55rem",
                  lineHeight: 1.15,
                  color: "var(--color-text)",
                }}
              >
                {title || "Título de tu comunicación"}
              </p>

              <div
                style={{
                  marginTop: "16px",
                  fontSize: "0.94rem",
                  lineHeight: 1.7,
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message ||
                  "Aquí aparecerá el contenido de tu mensaje."}
              </div>

              {buttonText.trim() && (
                <div
                  style={{
                    display: "inline-flex",
                    marginTop: "22px",
                    padding: "11px 18px",
                    borderRadius: "999px",
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    fontSize: "0.86rem",
                    fontWeight: 500,
                  }}
                >
                  {buttonText}
                </div>
              )}
            </div>
          </section>
        </div>

        {createdId && (
          <section
            style={{
              marginTop: "22px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "28px",
              padding: "28px 30px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Enlace listo
            </p>

            <h2
              style={{
                margin: "7px 0 8px",
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              Ya puedes usarlo en SendPulse
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "var(--color-text-secondary)",
              }}
            >
              Este es el enlace que corresponde a{" "}
              <strong style={{ fontWeight: 500 }}>
                {"{{1}}"}
              </strong>{" "}
              en tu plantilla de WhatsApp.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "stretch",
              }}
            >
              <input
                readOnly
                value={publicUrl}
                style={{
                  ...inputStyle,
                  marginBottom: 0,
                  flex: 1,
                  background: "#FBF9F4",
                }}
              />

              <button
                type="button"
                onClick={copyLink}
                style={{
                  minWidth: "135px",
                  border: "none",
                  borderRadius: "999px",
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "0 18px",
                }}
              >
                {copied ? "¡Copiado!" : "Copiar enlace"}
              </button>
            </div>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                marginTop: "16px",
                color: "var(--color-accent)",
                fontSize: "0.88rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Abrir página pública →
            </a>
          </section>
        )}
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "9px",
  marginTop: "20px",
  fontSize: "0.76rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-secondary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  padding: "12px 15px",
  border: "1px solid var(--color-border)",
  borderRadius: "14px",
  outline: "none",
  background: "#FFFFFF",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.92rem",
};

const optionalStyle: React.CSSProperties = {
  marginLeft: "7px",
  fontSize: "0.68rem",
  letterSpacing: "0.02em",
  textTransform: "none",
  color: "#A9A39A",
};