import Sidebar from "@/components/studio/Sidebar";

export default function CodesPage() {
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
              marginBottom: "42px",
            }}
          >
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
              Códigos
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
              Consulta y gestiona los códigos personalizados
              utilizados para acceder a las comunicaciones.
            </p>
          </section>

          {/* SEARCH / ACTIONS */}

          <section
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              style={{
                width: "100%",
                maxWidth: "560px",
                height: "54px",
                padding: "0 20px",
                borderRadius: "999px",
                border:
                  "1px solid var(--color-border)",
                background:
                  "var(--color-surface)",
                color: "var(--color-text)",
                outline: "none",
                fontSize: "0.95rem",
              }}
            />

            <button
              type="button"
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "14px 24px",
                background: "var(--color-primary)",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Generar códigos
            </button>
          </section>

          {/* EMPTY STATE */}

          <section
            style={{
              minHeight: "400px",
              background:
                "var(--color-surface)",
              border:
                "1px solid var(--color-border)",
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
                  border:
                    "1px solid #EEE7DA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color:
                    "var(--color-accent)",
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.8rem",
                }}
              >
                #
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "2.15rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Aún no tienes códigos
              </h2>

              <p
                style={{
                  maxWidth: "500px",
                  margin:
                    "14px auto 0",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Los códigos aparecerán aquí
                cuando crees comunicaciones
                y asignes destinatarios.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}