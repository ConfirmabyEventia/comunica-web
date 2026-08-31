"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Sidebar from "@/components/studio/Sidebar";
import { supabase } from "@/lib/supabase/client";

type Communication = {
  id: string;
  internal_name: string;
  title: string;
  message: string;
  content_html: string | null;
  button_text: string | null;
  button_url: string | null;
  status: "Borrador" | "Enviada";
  color_theme: string | null;
  typography: string | null;
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
  romantica: "Romántica",
};

export default function CommunicationsPage() {
  const [communications, setCommunications] =
    useState<Communication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [savingTemplateId, setSavingTemplateId] =
    useState<string | null>(null);

  async function loadCommunications() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
          .from("communications")
          .select(
            `
              id,
              internal_name,
              title,
              message,
              content_html,
              button_text,
              button_url,
              status,
              color_theme,
              typography,
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

      setCommunications(
        (data ?? []) as Communication[]
      );
    } catch (err) {
      console.error(
        "Error loading communications:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar las comunicaciones."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommunications();
  }, []);

  /*
   * =========================================================
   * MARCAR COMO ENVIADA
   * =========================================================
   */

  async function handleMarkAsSent(
    communication: Communication
  ) {
    const confirmed = window.confirm(
      `¿Quieres marcar "${communication.title}" como enviada?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(communication.id);
      setError("");

      const { error: updateError } =
        await supabase
          .from("communications")
          .update({
            status: "Enviada",
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            communication.id
          );

      if (updateError) {
        throw updateError;
      }

      setCommunications((current) =>
        current.map((item) =>
          item.id === communication.id
            ? {
                ...item,
                status: "Enviada",
                updated_at:
                  new Date().toISOString(),
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Error updating communication status:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cambiar el estado de la comunicación."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * =========================================================
   * GUARDAR COMO PLANTILLA
   * =========================================================
   */

  async function handleSaveAsTemplate(
    communication: Communication
  ) {
    const confirmed = window.confirm(
      `¿Quieres guardar "${communication.title}" como plantilla?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingTemplateId(
        communication.id
      );

      setError("");

      const { error: templateError } =
        await supabase
          .from("communication_templates")
          .insert({
            name:
              communication.title.trim(),

            description:
              communication.internal_name.trim(),

            message:
              communication.message || "",

            content_html:
              communication.content_html,

            color_theme:
              communication.color_theme,

            typography:
              communication.typography,

            button_text:
              communication.button_text,

            button_url:
              communication.button_url,
          });

      if (templateError) {
        throw templateError;
      }

      window.alert(
        "La comunicación se guardó como plantilla correctamente."
      );
    } catch (err) {
      console.error(
        "Error saving communication as template:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible guardar la comunicación como plantilla."
      );
    } finally {
      setSavingTemplateId(null);
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
          padding:
            "30px 46px 60px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          {/* =================================================
              HEADER
              ================================================= */}

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
                Comunicaciones
              </h1>

              <p
                style={{
                  margin:
                    "12px 0 0",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Crea y gestiona los
                mensajes que
                compartirás con tus
                invitados.
              </p>
            </div>

            <Link
              href="/dashboard/communications/new"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius:
                  "999px",
                padding:
                  "14px 25px",
                background:
                  "var(--color-primary)",
                color: "#FFFFFF",
                fontSize:
                  "0.95rem",
                fontWeight: 500,
                whiteSpace:
                  "nowrap",
                textDecoration:
                  "none",
              }}
            >
              + Nueva comunicación
            </Link>
          </section>

          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <section
              style={{
                marginBottom:
                  "22px",
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

          {/* =================================================
              LOADING
              ================================================= */}

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
                textAlign:
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
                Cargando
                comunicaciones...
              </p>
            </section>
          ) : communications.length ===
            0 ? (
            /* =================================================
               EMPTY STATE
               ================================================= */

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
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
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
                    lineHeight: 1.1,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Aún no tienes
                  comunicaciones
                </h2>

                <p
                  style={{
                    maxWidth:
                      "480px",
                    margin:
                      "14px auto 30px",
                    fontSize:
                      "1rem",
                    lineHeight: 1.7,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Cuando crees una
                  comunicación,
                  aparecerá aquí
                  para que puedas
                  consultarla y
                  gestionarla.
                </p>

                <Link
                  href="/dashboard/communications/new"
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    border:
                      "1px solid var(--color-primary)",
                    borderRadius:
                      "999px",
                    padding:
                      "12px 26px",
                    background:
                      "transparent",
                    color:
                      "var(--color-accent)",
                    fontSize:
                      "0.95rem",
                    fontWeight: 500,
                    textDecoration:
                      "none",
                  }}
                >
                  Crear comunicación
                </Link>
              </div>
            </section>
          ) : (
            /* =================================================
               COMMUNICATION LIST
               ================================================= */

            <section
              style={{
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius:
                  "30px",
                overflow:
                  "hidden",
              }}
            >
              {communications.map(
                (
                  communication,
                  index
                ) => {
                  const isSent =
                    communication.status ===
                    "Enviada";

                  const isUpdating =
                    updatingId ===
                    communication.id;

                  const isSavingTemplate =
                    savingTemplateId ===
                    communication.id;

                  return (
                    <div
                      key={
                        communication.id
                      }
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "1.5fr 1fr 180px 120px 300px",
                        alignItems:
                          "center",
                        gap: "20px",
                        padding:
                          "22px 26px",
                        borderBottom:
                          index ===
                          communications.length -
                            1
                            ? "none"
                            : "1px solid var(--color-border)",
                      }}
                    >
                      {/* =================================================
                          TITLE
                          ================================================= */}

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily:
                              "var(--font-display)",
                            fontSize:
                              "1.25rem",
                            color:
                              "var(--color-text)",
                          }}
                        >
                          {
                            communication.title
                          }
                        </p>

                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            fontSize:
                              "0.78rem",
                            color:
                              "var(--color-text-secondary)",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            communication.internal_name
                          }
                        </p>
                      </div>

                      {/* =================================================
                          ESSENCE
                          ================================================= */}

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize:
                              "0.84rem",
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          {communication.color_theme
                            ? colorNames[
                                communication
                                  .color_theme
                              ] ??
                              communication.color_theme
                            : "Sin color"}
                        </p>

                        <p
                          style={{
                            margin:
                              "4px 0 0",
                            fontSize:
                              "0.78rem",
                            color:
                              "var(--color-text-muted)",
                          }}
                        >
                          {communication.typography
                            ? typographyNames[
                                communication
                                  .typography
                              ] ??
                              communication.typography
                            : "Sin tipografía"}
                        </p>
                      </div>

                      {/* =================================================
                          DATE
                          ================================================= */}

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize:
                              "0.82rem",
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          {formatDate(
                            communication.created_at
                          )}
                        </p>
                      </div>

                      {/* =================================================
                          STATUS
                          ================================================= */}

                      <div>
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            borderRadius:
                              "999px",
                            padding:
                              "7px 12px",
                            background:
                              isSent
                                ? "#EEF4EE"
                                : "#F7F3EB",
                            color:
                              isSent
                                ? "#536B55"
                                : "var(--color-accent)",
                            fontSize:
                              "0.8rem",
                            fontWeight:
                              500,
                          }}
                        >
                          {
                            communication.status
                          }
                        </span>
                      </div>

                      {/* =================================================
                          ACTIONS
                          ================================================= */}

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          alignItems:
                            "stretch",
                          justifyContent:
                            "center",
                          gap: "8px",
                        }}
                      >
                        {/* VER */}

                        <Link
                          href={`/dashboard/communications/${communication.id}`}
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            minHeight:
                              "38px",
                            padding:
                              "0 16px",
                            border:
                              "1px solid var(--color-border)",
                            borderRadius:
                              "999px",
                            background:
                              "#FFFFFF",
                            color:
                              "var(--color-accent)",
                            textDecoration:
                              "none",
                            fontSize:
                              "0.84rem",
                            fontWeight:
                              500,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          Ver comunicación →
                        </Link>

                        {/* GUARDAR COMO PLANTILLA */}

                        <button
                          type="button"
                          onClick={() =>
                            handleSaveAsTemplate(
                              communication
                            )
                          }
                          disabled={
                            isSavingTemplate
                          }
                          style={{
                            width:
                              "100%",
                            minHeight:
                              "38px",
                            border:
                              "1px solid var(--color-border)",
                            borderRadius:
                              "999px",
                            background:
                              isSavingTemplate
                                ? "#F3F0EA"
                                : "#FFFFFF",
                            color:
                              "var(--color-accent)",
                            fontSize:
                              "0.84rem",
                            fontWeight:
                              500,
                            cursor:
                              isSavingTemplate
                                ? "default"
                                : "pointer",
                            opacity:
                              isSavingTemplate
                                ? 0.7
                                : 1,
                          }}
                        >
                          {isSavingTemplate
                            ? "Guardando plantilla..."
                            : "Guardar como plantilla"}
                        </button>

                        {/* MARCAR COMO ENVIADA */}

                        {!isSent && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsSent(
                                communication
                              )
                            }
                            disabled={
                              isUpdating
                            }
                            style={{
                              width:
                                "100%",
                              minHeight:
                                "38px",
                              border:
                                "1px solid var(--color-primary)",
                              borderRadius:
                                "999px",
                              background:
                                isUpdating
                                  ? "#F3F0EA"
                                  : "transparent",
                              color:
                                "var(--color-accent)",
                              fontSize:
                                "0.84rem",
                              fontWeight:
                                500,
                              cursor:
                                isUpdating
                                  ? "default"
                                  : "pointer",
                              opacity:
                                isUpdating
                                  ? 0.65
                                  : 1,
                            }}
                          >
                            {isUpdating
                              ? "Guardando..."
                              : "Marcar como enviada"}
                          </button>
                        )}
                      </div>
                    </div>
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

function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "es-CO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}