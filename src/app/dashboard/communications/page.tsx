import Link from "next/link";
import Sidebar from "@/components/studio/Sidebar";

export default function CommunicationsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--color-background)",
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
              justifyContent: "space-between",
              gap: "24px",
              marginBottom: "42px",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                }}
              >
                COMUNICA STUDIO
              </p>

              <h1
                style={{
                  margin: "8px 0 0",
                  fontFamily: "var(--font-display)",
                  fontSize: "3.4rem",
                  fontWeight: 500,
                  lineHeight: 1.05,
                  color: "var(--color-text)",
                }}
              >
                Comunicaciones
              </h1>

              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                }}
              >
                Crea y gestiona los mensajes que compartirás con
                tus invitados.
              </p>
            </div>

            <Link
              href="/dashboard/communications/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "999px",
                padding: "14px 25px",
                background: "var(--color-primary)",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              + Nueva comunicación
            </Link>
          </section>

          {/* EMPTY STATE */}

          <section
            style={{
              minHeight: "430px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "60px 30px",
            }}
          >
            <div>
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  margin: "0 auto 28px",
                  borderRadius: "50%",
                  background: "#F7F3EB",
                  border: "1px solid #EEE7DA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  fontFamily: "var(--font-display)",
                  fontSize: "2.15rem",
                  fontWeight: 500,
                  lineHeight: 1.1,
                  color: "var(--color-text)",
                }}
              >
                Aún no tienes comunicaciones
              </h2>

              <p
                style={{
                  maxWidth: "480px",
                  margin: "14px auto 30px",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "var(--color-text-secondary)",
                }}
              >
                Cuando crees una comunicación, aparecerá aquí para
                que puedas consultarla y gestionarla.
              </p>

              <Link
                href="/dashboard/communications/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--color-primary)",
                  borderRadius: "999px",
                  padding: "12px 26px",
                  background: "transparent",
                  color: "var(--color-accent)",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                }}
              >
                Crear comunicación
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}