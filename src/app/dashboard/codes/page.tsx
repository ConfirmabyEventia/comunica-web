"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/studio/Sidebar";
import { supabase } from "@/lib/supabase/client";

type Person = {
  id: string;
  name: string;
  phone: string | number | null;
  event_id: string;
};

type GroupCode = {
  principal_person_id: string;
  code: string;
};

type CodeRow = {
  principalPersonId: string;
  name: string;
  phone: string;
  code: string;
};

export default function CodesPage() {
  const [rows, setRows] = useState<CodeRow[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [copiedCode, setCopiedCode] =
    useState<string | null>(null);

  const [copiedLink, setCopiedLink] =
    useState<string | null>(null);

  /*
   * =========================================================
   * CARGAR CÓDIGOS
   * =========================================================
   */

  useEffect(() => {
    loadCodes();
  }, []);

  async function loadCodes() {
    try {
      setLoading(true);
      setError("");

      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      const eventId =
        localStorage.getItem(
          "comunica_current_event_id"
        );

      if (!eventId) {
        setRows([]);
        return;
      }

      /*
       * Primero obtenemos los códigos
       * ya generados desde MESAS.
       */

      const {
        data: codes,
        error: codesError,
      } = await supabase
        .from("table_group_codes")
        .select(
          "principal_person_id, code"
        )
        .eq(
          "event_id",
          eventId
        )
        .order("code");

      if (codesError) {
        throw codesError;
      }

      if (!codes || codes.length === 0) {
        setRows([]);
        return;
      }

      /*
       * Obtenemos las personas titulares.
       */

      const principalIds =
        codes.map(
          (item) =>
            item.principal_person_id
        );

      const {
        data: people,
        error: peopleError,
      } = await supabase
        .from("people")
        .select(
          "id, name, phone, event_id"
        )
        .eq(
          "event_id",
          eventId
        )
        .in(
          "id",
          principalIds
        );

      if (peopleError) {
        throw peopleError;
      }

      const peopleMap =
        new Map<string, Person>();

      (
        (people ?? []) as Person[]
      ).forEach((person) => {
        peopleMap.set(
          person.id,
          person
        );
      });

      /*
       * Construimos las filas finales.
       */

      const finalRows: CodeRow[] =
        (
          codes as GroupCode[]
        )
          .map((item) => {
            const person =
              peopleMap.get(
                item.principal_person_id
              );

            if (!person) {
              return null;
            }

            return {
              principalPersonId:
                person.id,

              name:
                String(
                  person.name ?? ""
                ).trim(),

              phone:
                String(
                  person.phone ?? ""
                ).trim(),

              code:
                String(
                  item.code ?? ""
                )
                  .trim()
                  .toUpperCase(),
            };
          })
          .filter(
            (
              item
            ): item is CodeRow =>
              item !== null &&
              item.code.length > 0
          );

      setRows(finalRows);
    } catch (err) {
      console.error(
        "Error loading codes:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar los códigos."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * FILTRO DE BÚSQUEDA
   * =========================================================
   */

  const filteredRows =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return rows;
      }

      return rows.filter(
        (row) =>
          row.name
            .toLowerCase()
            .includes(term) ||
          row.code
            .toLowerCase()
            .includes(term) ||
          row.phone
            .toLowerCase()
            .includes(term)
      );
    }, [rows, search]);

  /*
   * =========================================================
   * COPIAR CÓDIGO
   * =========================================================
   */

  async function handleCopyCode(
    code: string
  ) {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopiedCode(code);

      window.setTimeout(() => {
        setCopiedCode(null);
      }, 1800);
    } catch (err) {
      console.error(
        "Error copying code:",
        err
      );
    }
  }

  /*
   * =========================================================
   * COPIAR ENLACE
   * =========================================================
   */

  async function handleCopyLink(
    code: string
  ) {
    try {
      const link =
        `${window.location.origin}/message/${code}`;

      await navigator.clipboard.writeText(
        link
      );

      setCopiedLink(code);

      window.setTimeout(() => {
        setCopiedLink(null);
      }, 1800);
    } catch (err) {
      console.error(
        "Error copying link:",
        err
      );
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
              marginBottom: "42px",
            }}
          >
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
              Códigos
            </h1>

            <p
              style={{
                maxWidth:
                  "650px",
                margin:
                  "12px 0 0",
                fontSize: "1rem",
                lineHeight: 1.6,
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Consulta y gestiona los
              códigos personalizados
              utilizados para acceder a
              las comunicaciones.
            </p>
          </section>

          {/* =================================================
              ERROR
              ================================================= */}

          {error && (
            <div
              style={{
                marginBottom:
                  "24px",
                padding:
                  "14px 18px",
                borderRadius:
                  "14px",
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
            </div>
          )}

          {/* =================================================
              SEARCH
              ================================================= */}

          <section
            style={{
              marginBottom:
                "24px",
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por nombre, teléfono o código..."
              style={{
                width: "100%",
                maxWidth:
                  "620px",
                height: "54px",
                padding:
                  "0 20px",
                borderRadius:
                  "999px",
                border:
                  "1px solid var(--color-border)",
                background:
                  "var(--color-surface)",
                color:
                  "var(--color-text)",
                outline: "none",
                fontSize:
                  "0.95rem",
                boxSizing:
                  "border-box",
              }}
            />
          </section>

          {/* =================================================
              LOADING
              ================================================= */}

          {loading ? (
            <section
              style={{
                minHeight:
                  "400px",
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
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Cargando códigos...
              </p>
            </section>
          ) : rows.length ===
            0 ? (
            /* =================================================
               EMPTY STATE
               ================================================= */

            <section
              style={{
                minHeight:
                  "400px",
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
                    color:
                      "var(--color-accent)",
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "1.8rem",
                  }}
                >
                  #
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "2.15rem",
                    fontWeight: 500,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Aún no tienes códigos
                </h2>

                <p
                  style={{
                    maxWidth:
                      "500px",
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
                  Los códigos aparecerán
                  aquí cuando sean
                  generados desde
                  Mesas.
                </p>
              </div>
            </section>
          ) : filteredRows.length ===
            0 ? (
            /* =================================================
               NO SEARCH RESULTS
               ================================================= */

            <section
              style={{
                minHeight:
                  "260px",
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
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-display)",
                    fontSize:
                      "1.8rem",
                    fontWeight: 500,
                    color:
                      "var(--color-text)",
                  }}
                >
                  No encontramos resultados
                </h2>

                <p
                  style={{
                    margin:
                      "10px 0 0",
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Intenta buscar por otro
                  nombre o código.
                </p>
              </div>
            </section>
          ) : (
            /* =================================================
               CODE LIST
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
              {/* TABLE HEADER */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1.4fr 1fr 180px 300px",
                  gap: "20px",
                  alignItems:
                    "center",
                  padding:
                    "16px 26px",
                  background:
                    "#FAF8F3",
                  borderBottom:
                    "1px solid var(--color-border)",
                  fontSize:
                    "0.72rem",
                  letterSpacing:
                    "0.08em",
                  textTransform:
                    "uppercase",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                <span>
                  Titular
                </span>

                <span>
                  Teléfono
                </span>

                <span>
                  Código
                </span>

                <span>
                  Acciones
                </span>
              </div>

              {filteredRows.map(
                (row, index) => (
                  <div
                    key={
                      row.principalPersonId
                    }
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1.4fr 1fr 180px 300px",
                      gap: "20px",
                      alignItems:
                        "center",
                      padding:
                        "22px 26px",
                      borderBottom:
                        index ===
                        filteredRows.length -
                          1
                          ? "none"
                          : "1px solid var(--color-border)",
                    }}
                  >
                    {/* NAME */}

                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontFamily:
                            "var(--font-display)",
                          fontSize:
                            "1.18rem",
                          color:
                            "var(--color-text)",
                        }}
                      >
                        {row.name}
                      </p>
                    </div>

                    {/* PHONE */}

                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            "0.9rem",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        {row.phone
  ? row.phone.replace(/^\+/, "")
  : "Sin teléfono"}
                      </p>
                    </div>

                    {/* CODE */}

                    <div>
                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          minWidth:
                            "100px",
                          padding:
                            "10px 14px",
                          borderRadius:
                            "12px",
                          background:
                            "#F7F3EB",
                          border:
                            "1px solid #EEE7DA",
                          fontFamily:
                            "monospace",
                          fontSize:
                            "1rem",
                          fontWeight:
                            600,
                          letterSpacing:
                            "0.12em",
                          color:
                            "var(--color-accent)",
                        }}
                      >
                        {row.code}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCode(
                            row.code
                          )
                        }
                        style={{
                          minHeight:
                            "40px",
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
                          fontSize:
                            "0.82rem",
                          fontWeight:
                            500,
                          cursor:
                            "pointer",
                        }}
                      >
                        {copiedCode ===
                        row.code
                          ? "✓ Copiado"
                          : "Copiar código"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyLink(
                            row.code
                          )
                        }
                        style={{
                          minHeight:
                            "40px",
                          padding:
                            "0 16px",
                          border:
                            "1px solid var(--color-primary)",
                          borderRadius:
                            "999px",
                          background:
                            "transparent",
                          color:
                            "var(--color-accent)",
                          fontSize:
                            "0.82rem",
                          fontWeight:
                            500,
                          cursor:
                            "pointer",
                        }}
                      >
                        {copiedLink ===
                        row.code
                          ? "✓ Copiado"
                          : "Copiar enlace"}
                      </button>
                    </div>
                  </div>
                )
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}