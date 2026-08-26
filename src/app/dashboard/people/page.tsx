import Link from "next/link";
import Sidebar from "@/components/studio/Sidebar";

export default function PeoplePage() {
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
          {/* =================================================
              HEADER
          ================================================= */}

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
                Personas
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
                Gestiona las personas que recibirán tus
                comunicaciones.
              </p>
            </div>

            <button
              type="button"
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "14px 25px",
                background: "var(--color-primary)",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              + Agregar persona
            </button>
          </section>

          {/* =================================================
              SOURCES
          ================================================= */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {/* =================================================
                AGREGAR PERSONA
            ================================================= */}

            <button
              type="button"
              style={{
                textAlign: "left",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "28px",
                background:
                  "var(--color-surface)",
                padding: "28px",
                minHeight: "190px",
                cursor: "pointer",
                transition:
                  "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "#F7F3EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "var(--color-accent)",
                  fontSize: "1.7rem",
                }}
              >
                +
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.7rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Agregar persona
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Añade una persona
                individualmente.
              </p>
            </button>

            {/* =================================================
                IMPORTAR PERSONAS
            ================================================= */}

            <button
              type="button"
              style={{
                textAlign: "left",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "28px",
                background:
                  "var(--color-surface)",
                padding: "28px",
                minHeight: "190px",
                cursor: "pointer",
                transition:
                  "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "#F7F3EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "var(--color-accent)",
                }}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.7rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Importar personas
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Carga varias personas
                desde un archivo.
              </p>
            </button>

            {/* =================================================
                IMPORTAR DESDE CONFIRMA
            ================================================= */}

            <Link
              href="/dashboard/people/from-confirma"
              style={{
                display: "block",
                textAlign: "left",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "28px",
                background:
                  "linear-gradient(135deg, #FFFFFF 0%, #FBF8F1 100%)",
                padding: "28px",
                minHeight: "190px",
                cursor: "pointer",
                transition:
                  "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "#F1EADB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  color: "var(--color-accent)",
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                }}
              >
                C
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.7rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Importar desde CONFIRMA
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Trae personas de una
                celebración existente en
                CONFIRMA.
              </p>
            </Link>
          </section>

          {/* =================================================
              PEOPLE LIST
          ================================================= */}

          <section
            style={{
              background:
                "var(--color-surface)",
              border:
                "1px solid var(--color-border)",
              borderRadius: "30px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "28px 30px",
                borderBottom:
                  "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-display)",
                    fontSize: "2rem",
                    fontWeight: 500,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Personas registradas
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.9rem",
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Aquí aparecerán las personas
                  que agregues a COMUNICA.
                </p>
              </div>

              <input
                type="text"
                placeholder="Buscar..."
                style={{
                  width: "250px",
                  height: "46px",
                  padding: "0 18px",
                  borderRadius: "999px",
                  border:
                    "1px solid var(--color-border)",
                  background:
                    "var(--color-background)",
                  outline: "none",
                  color:
                    "var(--color-text)",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            <div
              style={{
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                textAlign: "center",
                padding: "50px 30px",
              }}
            >
              <div>
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    margin:
                      "0 auto 22px",
                    borderRadius: "50%",
                    background:
                      "#F7F3EB",
                    border:
                      "1px solid #EEE7DA",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      "var(--color-accent)",
                  }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="9"
                      cy="8"
                      r="3"
                    />
                    <path d="M3.5 19c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5" />
                    <path d="M16 5.5a3 3 0 0 1 0 5.8" />
                    <path d="M17 14c2.1.5 3.3 2.1 3.7 4.5" />
                  </svg>
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-display)",
                    fontSize: "1.9rem",
                    fontWeight: 500,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Aún no tienes personas
                </h3>

                <p
                  style={{
                    maxWidth: "470px",
                    margin:
                      "10px auto 0",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Agrega una persona,
                  importa tu lista o
                  trae tus invitados
                  directamente desde
                  CONFIRMA.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}