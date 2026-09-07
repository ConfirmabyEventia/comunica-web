"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Por favor ingresa tu email.");
      return;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.session) {
        throw new Error(
          "No se pudo iniciar la sesión."
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "Error al iniciar sesión:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No pudimos iniciar sesión. Verifica tu email y contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FBFAF7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        color: "#393431",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "38px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily:
                "var(--font-display)",
              fontSize: "30px",
              lineHeight: 1,
              fontWeight: 400,
              color: "var(--color-text)",
            }}
          >
            Comunica
          </h1>

          <div
            style={{
              marginTop: "7px",
              fontFamily:
                "var(--font-body)",
              fontSize: "0.72rem",
              lineHeight: 1,
              letterSpacing: "0.18em",
              fontWeight: 500,
              color: "var(--color-accent)",
            }}
          >
            BY EVENSSE
          </div>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <section
          style={{
            background: "#FFFFFF",
            border:
              "1px solid var(--color-border)",
            borderRadius: "24px",
            padding: "38px 36px",
            boxShadow:
              "0 18px 45px rgba(60, 50, 35, 0.06)",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.68rem",
                lineHeight: 1,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              EVENSSE · COMUNICA
            </p>

            <h2
              style={{
                margin: "12px 0 0",
                fontFamily:
                  "var(--font-display)",
                fontSize: "2rem",
                lineHeight: 1.15,
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              Bienvenida a Comunica
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: "0.92rem",
                lineHeight: 1.6,
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Ingresa a tu espacio para
              gestionar tus comunicaciones.
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="tu@email.com"
                autoComplete="email"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "50px",
                  boxSizing: "border-box",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "14px",
                  background: "#FEFDFC",
                  padding: "0 15px",
                  fontSize: "0.9rem",
                  color:
                    "var(--color-text)",
                  outline: "none",
                }}
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Tu contraseña"
                autoComplete="current-password"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "50px",
                  boxSizing: "border-box",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "14px",
                  background: "#FEFDFC",
                  padding: "0 15px",
                  fontSize: "0.9rem",
                  color:
                    "var(--color-text)",
                  outline: "none",
                }}
              />
            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  border:
                    "1px solid #E8CBCD",
                  background: "#FBF1F2",
                  borderRadius: "14px",
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                    color: "#7A3440",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                marginTop: "4px",
                border: "none",
                borderRadius: "999px",
                background:
                  "var(--color-accent)",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
                transition:
                  "opacity .2s ease",
              }}
            >
              {loading
                ? "Ingresando..."
                : "Iniciar sesión"}
            </button>
          </form>
        </section>

        {/* FOOTER */}

        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:
              "var(--color-text-muted)",
          }}
        >
          COMUNICA · EVENSSE
        </p>
      </div>
    </main>
  );
}