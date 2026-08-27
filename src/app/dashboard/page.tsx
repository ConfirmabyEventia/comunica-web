"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/studio/Sidebar";
import { supabase } from "@/lib/supabase/client";

type CommunicationStatus =
  | "Borrador"
  | "Enviada";

type Communication = {
  id: string;
  internal_name: string;
  title: string;
  message: string;
  status: CommunicationStatus;
  created_at: string;
  updated_at: string;
};

export default function DashboardPage() {
  const [communications, setCommunications] =
    useState<Communication[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadCommunications();
  }, []);

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
              status,
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
        "Error loading dashboard communications:",
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

  const totalCommunications =
    communications.length;

  const draftCount =
    communications.filter(
      (communication) =>
        communication.status === "Borrador"
    ).length;

  const sentCount =
    communications.filter(
      (communication) =>
        communication.status === "Enviada"
    ).length;

  const recentCommunications =
    communications.slice(0, 5);

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
          {/* WELCOME */}

          <section
            style={{
              background:
                "linear-gradient(135deg, #FBF9F4 0%, #F7F2E9 100%)",
              border:
                "1px solid var(--color-border)",
              borderRadius: "26px",
              padding: "42px 48px",
              marginBottom: "42px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily:
                  "var(--font-body)",
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform:
                  "uppercase",
                color:
                  "var(--color-accent)",
              }}
            >
              EVENSSE
            </p>

            <h1
              style={{
                margin: "10px 0 0",
                fontFamily:
                  "var(--font-display)",
                fontSize: "3.5rem",
                fontWeight: 500,
                lineHeight: 1.05,
                color:
                  "var(--color-text)",
                letterSpacing:
                  "-0.02em",
              }}
            >
              Bienvenida a Comunica Studio
            </h1>

            <p
              style={{
                margin: "14px 0 0",
                fontFamily:
                  "var(--font-body)",
                fontSize: "1.05rem",
                lineHeight: 1.6,
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Gestiona las comunicaciones de tus eventos desde un solo lugar.
            </p>
          </section>

          {/* ERROR */}

          {error && (
            <section
              style={{
                marginBottom: "28px",
                padding: "16px 18px",
                borderRadius: "16px",
                background: "#FBF4F1",
                border:
                  "1px solid #E8D8D1",
                color: "#765F56",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </section>
          )}

          {/* SUMMARY */}

          <section
            style={{
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "2.35rem",
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color:
                    "var(--color-text)",
                }}
              >
                Resumen
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "1rem",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Una vista general de tus comunicaciones.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <SummaryCard
                label="Total de comunicaciones"
                value={
                  loading
                    ? "—"
                    : totalCommunications
                }
                description="Todas tus comunicaciones"
              />

              <SummaryCard
                label="Borradores"
                value={
                  loading
                    ? "—"
                    : draftCount
                }
                description="Comunicaciones en proceso"
              />

              <SummaryCard
                label="Enviadas"
                value={
                  loading
                    ? "—"
                    : sentCount
                }
                description="Comunicaciones enviadas"
              />
            </div>
          </section>

          {/* RECENT ACTIVITY */}

          <section
            style={{
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "2.35rem",
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color:
                    "var(--color-text)",
                }}
              >
                Actividad reciente
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "1rem",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Lo último que ha ocurrido en Comunica.
              </p>
            </div>

            <section
              style={{
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "24px",
                overflow: "hidden",
              }}
            >
              {loading ? (
                <LoadingRow />
              ) : communications.length ===
                0 ? (
                <EmptyActivity />
              ) : (
                communications
                  .slice(0, 5)
                  .map(
                    (communication) => (
                      <ActivityRow
                        key={
                          communication.id
                        }
                        communication={
                          communication
                        }
                      />
                    )
                  )
              )}
            </section>
          </section>

          {/* RECENT COMMUNICATIONS */}

          <section>
            <div
              style={{
                display: "flex",
                alignItems:
                  "flex-end",
                justifyContent:
                  "space-between",
                gap: "24px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-display)",
                    fontSize: "2.35rem",
                    fontWeight: 500,
                    lineHeight: 1.1,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Últimas comunicaciones
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "1rem",
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Accede rápidamente a tus comunicaciones más recientes.
                </p>
              </div>

              <Link
                href="/dashboard/communications"
                style={{
                  fontSize: "0.92rem",
                  color:
                    "var(--color-accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                  whiteSpace:
                    "nowrap",
                }}
              >
                Ver todas →
              </Link>
            </div>

            {loading ? (
              <section
                style={{
                  background:
                    "var(--color-surface)",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "24px",
                  overflow: "hidden",
                }}
              >
                <LoadingRow />
              </section>
            ) : recentCommunications.length ===
              0 ? (
              <EmptyCommunications />
            ) : (
              <section
                style={{
                  background:
                    "var(--color-surface)",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "24px",
                  overflow: "hidden",
                }}
              >
                {recentCommunications.map(
                  (communication) => (
                    <CommunicationRow
                      key={
                        communication.id
                      }
                      communication={
                        communication
                      }
                    />
                  )
                )}
              </section>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div
      style={{
        background:
          "var(--color-surface)",
        border:
          "1px solid var(--color-border)",
        borderRadius: "22px",
        padding: "26px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.76rem",
          letterSpacing: "0.08em",
          textTransform:
            "uppercase",
          color:
            "var(--color-text-secondary)",
        }}
      >
        {label}
      </p>

      <div
        style={{
          marginTop: "13px",
          fontFamily:
            "var(--font-display)",
          fontSize: "2.8rem",
          fontWeight: 500,
          lineHeight: 1,
          color:
            "var(--color-text)",
        }}
      >
        {value}
      </div>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: "0.88rem",
          color:
            "var(--color-text-secondary)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingRow() {
  return (
    <div
      style={{
        padding: "32px 26px",
        textAlign: "center",
        fontSize: "0.9rem",
        color:
          "var(--color-text-secondary)",
      }}
    >
      Cargando comunicaciones...
    </div>
  );
}

/* =========================================================
   EMPTY ACTIVITY
========================================================= */

function EmptyActivity() {
  return (
    <div
      style={{
        padding: "34px 30px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily:
            "var(--font-display)",
          fontSize: "1.45rem",
          color:
            "var(--color-text)",
        }}
      >
        Aún no hay actividad
      </p>

      <p
        style={{
          maxWidth: "460px",
          margin: "8px auto 0",
          fontSize: "0.94rem",
          lineHeight: 1.6,
          color:
            "var(--color-text-secondary)",
        }}
      >
        La actividad de tus comunicaciones aparecerá aquí.
      </p>
    </div>
  );
}

/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({
  communication,
}: {
  communication: Communication;
}) {
  const isSent =
    communication.status ===
    "Enviada";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "20px 26px",
        borderBottom:
          "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          flexShrink: 0,
          borderRadius: "50%",
          background: "#F7F3EB",
          border:
            "1px solid #EEE7DA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="18"
          height="18"
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

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.95rem",
            color:
              "var(--color-text)",
          }}
        >
          Comunicación{" "}
          <strong
            style={{
              fontWeight: 600,
            }}
          >
            {communication.title}
          </strong>
        </p>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.82rem",
            color:
              "var(--color-text-secondary)",
          }}
        >
          {isSent
            ? "Comunicación enviada"
            : "Comunicación creada"}
          {" · "}
          {formatDate(
            communication.created_at
          )}
        </p>
      </div>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "999px",
          padding: "7px 12px",
          background: isSent
            ? "#EEF4EE"
            : "#F7F3EB",
          color: isSent
            ? "#536B55"
            : "var(--color-accent)",
          fontSize: "0.76rem",
          fontWeight: 500,
        }}
      >
        {communication.status}
      </span>
    </div>
  );
}

/* =========================================================
   EMPTY COMMUNICATIONS
========================================================= */

function EmptyCommunications() {
  return (
    <section
      style={{
        minHeight: "300px",
        background:
          "var(--color-surface)",
        border:
          "1px solid var(--color-border)",
        borderRadius: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "50px 30px",
      }}
    >
      <div>
        <div
          style={{
            width: "68px",
            height: "68px",
            margin: "0 auto 22px",
            borderRadius: "50%",
            background: "#F7F3EB",
            border:
              "1px solid #EEE7DA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="28"
            height="28"
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

        <h3
          style={{
            margin: 0,
            fontFamily:
              "var(--font-display)",
            fontSize: "1.85rem",
            fontWeight: 500,
            color:
              "var(--color-text)",
          }}
        >
          Aún no tienes comunicaciones
        </h3>

        <p
          style={{
            maxWidth: "450px",
            margin: "12px auto 0",
            fontSize: "0.95rem",
            lineHeight: 1.65,
            color:
              "var(--color-text-secondary)",
          }}
        >
          Tus comunicaciones aparecerán aquí una vez que hayas creado la
          primera.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   COMMUNICATION ROW
========================================================= */

function CommunicationRow({
  communication,
}: {
  communication: Communication;
}) {
  const isSent =
    communication.status ===
    "Enviada";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1.7fr 160px 150px",
        alignItems: "center",
        gap: "20px",
        padding: "22px 26px",
        borderBottom:
          "1px solid var(--color-border)",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontFamily:
              "var(--font-display)",
            fontSize: "1.2rem",
            color:
              "var(--color-text)",
          }}
        >
          {communication.title}
        </p>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "0.78rem",
            color:
              "var(--color-text-secondary)",
          }}
        >
          {communication.internal_name}
        </p>
      </div>

      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "999px",
            padding: "7px 12px",
            background: isSent
              ? "#EEF4EE"
              : "#F7F3EB",
            color: isSent
              ? "#536B55"
              : "var(--color-accent)",
            fontSize: "0.8rem",
            fontWeight: 500,
          }}
        >
          {communication.status}
        </span>
      </div>

      <Link
        href={`/dashboard/communications/${communication.id}`}
        style={{
          color:
            "var(--color-accent)",
          textDecoration: "none",
          fontSize: "0.9rem",
          fontWeight: 500,
          whiteSpace:
            "nowrap",
        }}
      >
        Ver comunicación →
      </Link>
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