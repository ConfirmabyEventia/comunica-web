"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Sidebar from "@/components/studio/Sidebar";
import { supabase } from "@/lib/supabase/client";

type Template = {
  id: string;
  name: string;
  description: string | null;
  message: string;
  content_html: string | null;
  color_theme: string | null;
  typography: string | null;
  button_text: string | null;
  button_url: string | null;
  created_at: string;
  updated_at: string;
};

const colorNames: Record<string, string> = {
  salvia: "Salvia",
  lavanda: "Lavanda",
  terracota: "Terracota",
  arena: "Arena",
  "azul-niebla": "Azul Niebla",
  vino: "Vino",
};

const typographyNames: Record<string, string> = {
  editorial: "Editorial",
  clasica: "Clásica",
  contemporanea: "Contemporánea",
  romantica: "Suave",
};
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingTemplateId, setDeletingTemplateId] =
    useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
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
              button_url,
              created_at,
              updated_at
            `
          )
          .order("created_at", {
            ascending: false,
          });

      if (fetchError) {
        throw fetchError;
      }

      setTemplates((data ?? []) as Template[]);
    } catch (err) {
      console.error(
        "Error loading templates:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar las plantillas."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(
    template: Template
  ) {
    const confirmed = window.confirm(
      `¿Borrar la plantilla "${template.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTemplateId(template.id);
      setError("");

      const { error: deleteError } =
        await supabase
          .from("communication_templates")
          .delete()
          .eq("id", template.id);

      if (deleteError) {
        throw deleteError;
      }

      setTemplates((current) =>
        current.filter(
          (item) => item.id !== template.id
        )
      );
    } catch (err) {
      console.error(
        "Error deleting template:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible borrar la plantilla."
      );
    } finally {
      setDeletingTemplateId(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "var(--color-background)",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px 46px 60px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}

          <section
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent:
                "space-between",
              gap: "24px",
              marginBottom: "42px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.72rem",
                  letterSpacing:
                    "0.2em",
                  textTransform:
                    "uppercase",
                  color:
                    "var(--color-accent)",
                }}
              >
                COMUNICA STUDIO
              </p>

              <h1
                style={{
                  margin:
                    "8px 0 0",
                  fontFamily:
                    "var(--font-display)",
                  fontSize:
                    "3.4rem",
                  fontWeight: 500,
                  lineHeight: 1.05,
                  color:
                    "var(--color-text)",
                }}
              >
                Plantillas
              </h1>

              <p
                style={{
                  margin:
                    "12px 0 0",
                  fontSize:
                    "1rem",
                  lineHeight: 1.6,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Guarda y reutiliza
                tus comunicaciones
                favoritas.
              </p>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <section
              style={{
                marginBottom: "22px",
                padding:
                  "16px 18px",
                borderRadius:
                  "16px",
                background:
                  "#FBF4F1",
                border:
                  "1px solid #E8D8D1",
                color:
                  "#765F56",
                fontSize:
                  "0.9rem",
              }}
            >
              {error}
            </section>
          )}

          {/* LOADING */}

          {loading ? (
            <section
              style={{
                minHeight:
                  "300px",
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius:
                  "30px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize:
                    "0.95rem",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Cargando plantillas...
              </p>
            </section>
          ) : templates.length ===
            0 ? (
            /* EMPTY STATE */

            <section
              style={{
                minHeight:
                  "430px",
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius:
                  "30px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                textAlign:
                  "center",
                padding:
                  "60px 30px",
              }}
            >
              <div>
                <div
                  style={{
                    width: "76px",
                    height: "76px",
                    margin:
                      "0 auto 28px",
                    borderRadius:
                      "50%",
                    background:
                      "#F7F3EB",
                    border:
                      "1px solid #EEE7DA",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                    />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                    <path d="M8 16h8" />
                  </svg>
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "2.15rem",
                    fontWeight: 500,
                    lineHeight:
                      1.1,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Aún no tienes
                  plantillas
                </h2>

                <p
                  style={{
                    maxWidth:
                      "480px",
                    margin:
                      "14px auto 0",
                    fontSize:
                      "1rem",
                    lineHeight:
                      1.7,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Cuando guardes
                  una comunicación
                  como plantilla,
                  aparecerá aquí
                  para que puedas
                  reutilizarla.
                </p>
              </div>
            </section>
          ) : (
            /* TEMPLATE GRID */

            <section
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {templates.map(
                (template) => {
                  const color =
                    template.color_theme
                      ? colorNames[
                          template
                            .color_theme
                        ] ??
                        template.color_theme
                      : "Sin color";

                  const typography =
                    template.typography
                      ? typographyNames[
                          template
                            .typography
                        ] ??
                        template.typography
                      : "Sin tipografía";

                  const isDeleting =
                    deletingTemplateId ===
                    template.id;

                  return (
                    <article
                      key={
                        template.id
                      }
                      style={{
                        background:
                          "var(--color-surface)",
                        border:
                          "1px solid var(--color-border)",
                        borderRadius:
                          "28px",
                        padding:
                          "28px",
                        boxSizing:
                          "border-box",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        minHeight:
                          "280px",
                      }}
                    >
                      {/* ICON */}

                      <div
                        style={{
                          width:
                            "52px",
                          height:
                            "52px",
                          borderRadius:
                            "16px",
                          background:
                            "#F7F3EB",
                          border:
                            "1px solid #EEE7DA",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          marginBottom:
                            "22px",
                        }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-accent)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="2"
                          />
                          <path d="M8 8h8" />
                          <path d="M8 12h5" />
                          <path d="M8 16h8" />
                        </svg>
                      </div>

                      {/* NAME */}

                      <h2
                        style={{
                          margin: 0,
                          fontFamily:
                            "var(--font-display)",
                          fontSize:
                            "1.7rem",
                          fontWeight:
                            500,
                          lineHeight:
                            1.15,
                          color:
                            "var(--color-text)",
                        }}
                      >
                        {
                          template.name
                        }
                      </h2>

                      {/* DESCRIPTION */}

                      {template.description && (
                        <p
                          style={{
                            margin:
                              "8px 0 0",
                            fontSize:
                              "0.86rem",
                            lineHeight:
                              1.5,
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          {
                            template.description
                          }
                        </p>
                      )}

                      {/* ESSENCE */}

                      <div
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap:
                            "8px",
                          marginTop:
                            "18px",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            borderRadius:
                              "999px",
                            padding:
                              "7px 11px",
                            background:
                              "#F7F3EB",
                            color:
                              "var(--color-accent)",
                            fontSize:
                              "0.76rem",
                            fontWeight:
                              500,
                          }}
                        >
                          {color}
                        </span>

                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            borderRadius:
                              "999px",
                            padding:
                              "7px 11px",
                            background:
                              "#F7F3EB",
                            color:
                              "var(--color-text-secondary)",
                            fontSize:
                              "0.76rem",
                          }}
                        >
                          {
                            typography
                          }
                        </span>
                      </div>

                      {/* PREVIEW TEXT */}

                      <p
                        style={{
                          margin:
                            "18px 0 0",
                          fontSize:
                            "0.9rem",
                          lineHeight:
                            1.6,
                          color:
                            "var(--color-text-secondary)",
                          display:
                            "-webkit-box",
                          WebkitLineClamp:
                            3,
                          WebkitBoxOrient:
                            "vertical",
                          overflow:
                            "hidden",
                        }}
                      >
                        {template.message ||
                          "Esta plantilla contiene contenido diseñado en COMUNICA."}
                      </p>

                      {/* ACTIONS */}

                      <div
                        style={{
                          marginTop:
                            "auto",
                          paddingTop:
                            "24px",
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                          }}
                        >
                          <Link
                            href={`/dashboard/templates/${template.id}`}
                            style={{
                              flex: 1,
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              border:
                                "1px solid var(--color-border)",
                              borderRadius:
                                "999px",
                              padding:
                                "10px 14px",
                              color:
                                "var(--color-accent)",
                              textDecoration:
                                "none",
                              fontSize:
                                "0.84rem",
                              fontWeight:
                                500,
                            }}
                          >
                            Ver plantilla →
                          </Link>

                          <Link
                            href={`/dashboard/communications/new?template=${template.id}`}
                            style={{
                              flex: 1,
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              borderRadius:
                                "999px",
                              padding:
                                "10px 14px",
                              background:
                                "var(--color-primary)",
                              color:
                                "#FFFFFF",
                              textDecoration:
                                "none",
                              fontSize:
                                "0.84rem",
                              fontWeight:
                                500,
                            }}
                          >
                            Usar plantilla
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteTemplate(
                              template
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          style={{
                            width: "100%",
                            minHeight:
                              "40px",
                            border:
                              "1px solid #E4D5D5",
                            borderRadius:
                              "999px",
                            background:
                              "#FFF9F9",
                            color:
                              "#8A4F57",
                            fontSize:
                              "0.82rem",
                            fontWeight:
                              500,
                            cursor:
                              isDeleting
                                ? "default"
                                : "pointer",
                            opacity:
                              isDeleting
                                ? 0.6
                                : 1,
                          }}
                        >
                          {isDeleting
                            ? "Borrando..."
                            : "Borrar plantilla"}
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}