import Sidebar from "@/components/studio/Sidebar";

export default function TablesPage() {
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
          padding: "52px 56px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              marginBottom: "42px",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "10px",
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              COMUNICA STUDIO
            </p>

            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "3rem",
                lineHeight: 1,
                fontWeight: 500,
                color: "var(--color-text)",
                letterSpacing: "-0.025em",
              }}
            >
              Mesas
            </h1>

            <p
              style={{
                marginTop: "16px",
                marginBottom: 0,
                maxWidth: "620px",
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
              }}
            >
              Gestiona la asignación de mesas y prepara
              comunicaciones personalizadas para cada titular.
            </p>
          </div>

          <section
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--color-border)",
              borderRadius: "24px",
              padding: "42px",
              minHeight: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  margin: "0 auto 20px",
                  borderRadius: "18px",
                  background: "rgba(210, 194, 163, 0.20)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                🪑
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "1.7rem",
                  fontWeight: 500,
                  color: "var(--color-text)",
                }}
              >
                Gestión de mesas
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  marginBottom: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                }}
              >
                Aquí construiremos la asignación de mesas
                y las comunicaciones personalizadas.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}