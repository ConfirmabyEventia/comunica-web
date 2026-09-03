"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        "El correo electrónico o la contraseña no son correctos."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className={styles.loginPage}>
      {/* LEFT — BRAND */}
      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logoMark} aria-hidden="true">
            <svg
              viewBox="0 0 260 260"
              className={styles.logoSvg}
              role="presentation"
            >
              <circle
                cx="130"
                cy="130"
                r="88"
                className={styles.logoCircle}
              />

              <path
                d="M76 112 L130 151 L184 112"
                className={styles.envelopeLine}
              />

              <path
                d="M76 112 L76 158 Q76 168 86 168 H174 Q184 168 184 158 V112"
                className={styles.envelopeLine}
              />

              <path
                d="M130 151 L101 126"
                className={styles.envelopeLine}
              />

              <path
                d="M130 151 L159 126"
                className={styles.envelopeLine}
              />

              <path
                d="M173 77
                   C188 62 203 62 211 69
                   C203 77 188 84 173 84"
                className={styles.botanicalLine}
              />

              <path
                d="M174 78 C185 73 194 67 202 59"
                className={styles.botanicalStem}
              />

              <ellipse
                cx="195"
                cy="65"
                rx="7"
                ry="4"
                transform="rotate(-35 195 65)"
                className={styles.leaf}
              />

              <ellipse
                cx="187"
                cy="73"
                rx="7"
                ry="4"
                transform="rotate(-25 187 73)"
                className={styles.leaf}
              />

              <path
                d="M194 47 L194 57"
                className={styles.sparkle}
              />

              <path
                d="M189 52 L199 52"
                className={styles.sparkle}
              />

              <path
                d="M210 92 L210 100"
                className={styles.sparkle}
              />

              <path
                d="M206 96 L214 96"
                className={styles.sparkle}
              />
            </svg>
          </div>

          <div className={styles.brandName}>
            COMUNICA
          </div>

          <div className={styles.brandSubtitle}>
            BY EVENSSE
          </div>

          <div className={styles.brandDivider}>
            <span />
            <span className={styles.brandDiamond}>◇</span>
            <span />
          </div>

          <p className={styles.brandTagline}>
            CADA EVENTO,
            <br />
            CON SU PROPIA ESENCIA.
          </p>
        </div>
      </section>

      {/* RIGHT — LOGIN */}
      <section className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.mobileBrand}>
            <div className={styles.mobileBrandName}>
              COMUNICA
            </div>

            <div className={styles.mobileBrandSubtitle}>
              BY EVENSSE
            </div>
          </div>

          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              COMUNICA STUDIO
            </p>

            <h1>Bienvenida</h1>

            <p className={styles.introText}>
              Gestiona las comunicaciones de cada evento
              con la esencia de EVENSSE.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className={styles.loginForm}
          >
            <div className={styles.field}>
              <label htmlFor="email">
                Correo electrónico
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
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">
                Contraseña
              </label>

              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {error && (
              <p className={styles.errorMessage}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? "INGRESANDO..." : "INGRESAR"}
            </button>
          </form>

          <p className={styles.footerText}>
            COMUNICA STUDIO · EVENSSE
          </p>
        </div>
      </section>
    </main>
  );
}