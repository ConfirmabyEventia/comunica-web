"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Celebration {
  id: string;
  celebration_code: string;
  name: string;
  event_date: string;
  status: string;
  guest_count: number;
}

interface CelebrationsResponse {
  ok: boolean;
  celebrations?: Celebration[];
  error?: string;
}

interface Person {
  id: string;
  name: string;
  phone: string | null;
  group: string;
  rsvp: "confirmed" | "pending" | "declined";
}

interface PeopleResponse {
  ok: boolean;
  people?: {
    id: string;
    guest_code: string;
    name: string;
    phone: string | null;
    email: string | null;
    is_principal_contact: boolean;
    rsvp_status: string | null;
    rsvp_attending: boolean | null;
    invitation_group_id: string;
  }[];
  error?: string;
}

type RsvpFilter =
  | "all"
  | "confirmed"
  | "pending"
  | "declined";

const filterOptions: {
  value: RsvpFilter;
  label: string;
}[] = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "confirmed",
    label: "Confirmados",
  },
  {
    value: "pending",
    label: "Pendientes",
  },
  {
    value: "declined",
    label: "No asistirán",
  },
];

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function normalizeRsvp(
  status: string | null
): "confirmed" | "pending" | "declined" {
  if (status === "confirmed") {
    return "confirmed";
  }

  if (status === "declined") {
    return "declined";
  }

  return "pending";
}

export default function ImportFromConfirmaPage() {
  const [celebrations, setCelebrations] =
    useState<Celebration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedCelebration, setSelectedCelebration] =
    useState<string | null>(null);

  const [selectedPeople, setSelectedPeople] =
    useState<string[]>([]);

  const [search, setSearch] =
    useState("");

  const [rsvpFilter, setRsvpFilter] =
    useState<RsvpFilter>("all");

  const [people, setPeople] =
    useState<Person[]>([]);

  const [peopleLoading, setPeopleLoading] =
    useState(false);

  const [peopleError, setPeopleError] =
    useState<string | null>(null);

  /*
   * ============================================
   * CARGAR CELEBRACIONES DESDE CONFIRMA
   * ============================================
   */

  useEffect(() => {
    async function loadCelebrations() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/confirma/celebrations",
          {
            cache: "no-store",
          }
        );

        const result: CelebrationsResponse =
          await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error ||
              "No fue posible cargar las celebraciones."
          );
        }

        setCelebrations(
          result.celebrations ?? []
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar las celebraciones."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCelebrations();
  }, []);

  const celebration =
    celebrations.find(
      (item) =>
        item.id === selectedCelebration
    );

  /*
   * ============================================
   * FILTROS DE PERSONAS
   * ============================================
   */

  const filteredPeople =
    people.filter((person) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        person.name
          .toLowerCase()
          .includes(searchValue) ||
        (person.phone ?? "")
          .toLowerCase()
          .includes(searchValue) ||
        person.group
          .toLowerCase()
          .includes(searchValue);

      const matchesRsvp =
        rsvpFilter === "all" ||
        person.rsvp === rsvpFilter;

      return (
        matchesSearch &&
        matchesRsvp
      );
    });

  /*
   * ============================================
   * SELECCIONAR CELEBRACIÓN
   *
   * AQUÍ CONECTAMOS CON CONFIRMA
   * ============================================
   */

  async function selectCelebration(
    id: string
  ) {
    setSelectedCelebration(id);
    setSelectedPeople([]);
    setSearch("");
    setRsvpFilter("all");

    setPeople([]);
    setPeopleError(null);
    setPeopleLoading(true);

    try {
      const response = await fetch(
        `/api/confirma/celebrations/${id}/people`,
        {
          cache: "no-store",
        }
      );

      const result: PeopleResponse =
        await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error ||
            "No fue posible cargar las personas de CONFIRMA."
        );
      }

      const mappedPeople: Person[] =
        (result.people ?? []).map(
          (person) => ({
            id: person.id,

            name: person.name,

            phone: person.phone,

            group:
              person.invitation_group_id,

            rsvp:
              normalizeRsvp(
                person.rsvp_status
              ),
          })
        );

      setPeople(mappedPeople);
    } catch (err) {
      console.error(err);

      setPeopleError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar las personas de CONFIRMA."
      );
    } finally {
      setPeopleLoading(false);
    }
  }

  /*
   * ============================================
   * VOLVER A CELEBRACIONES
   * ============================================
   */

  function backToCelebrations() {
    setSelectedCelebration(null);
    setSelectedPeople([]);
    setSearch("");
    setRsvpFilter("all");
    setPeople([]);
    setPeopleError(null);
  }

  /*
   * ============================================
   * SELECCIONAR PERSONA
   * ============================================
   */

  function togglePerson(id: string) {
    setSelectedPeople((current) =>
      current.includes(id)
        ? current.filter(
            (personId) =>
              personId !== id
          )
        : [...current, id]
    );
  }

  /*
   * ============================================
   * SELECCIONAR TODAS LAS VISIBLES
   * ============================================
   */

  function toggleAll() {
    const visibleIds =
      filteredPeople.map(
        (person) => person.id
      );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedPeople.includes(id)
      );

    if (allSelected) {
      setSelectedPeople((current) =>
        current.filter(
          (id) =>
            !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedPeople((current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ]);
    }
  }

  const allVisibleSelected =
    filteredPeople.length > 0 &&
    filteredPeople.every((person) =>
      selectedPeople.includes(person.id)
    );

  /*
   * ============================================
   * RENDER
   * ============================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "var(--color-background)",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "34px 48px 70px",
        }}
      >
        {/* HEADER */}

        <section
          style={{
            marginBottom: "42px",
          }}
        >
          {celebration ? (
            <button
              type="button"
              onClick={
                backToCelebrations
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "28px",
                padding: 0,
                border: "none",
                background:
                  "transparent",
                color:
                  "var(--color-text-secondary)",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <span>←</span>
              Volver a celebraciones
            </button>
          ) : (
            <Link
              href="/dashboard/people"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "28px",
                color:
                  "var(--color-text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              <span>←</span>
              Volver a Personas
            </Link>
          )}

          <p
            style={{
              margin: 0,
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:
                "var(--color-accent)",
            }}
          >
            Importar desde CONFIRMA
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              fontFamily:
                "var(--font-display)",
              fontSize: "3.4rem",
              fontWeight: 500,
              lineHeight: 1.05,
              color:
                "var(--color-text)",
            }}
          >
            {celebration
              ? "Selecciona las personas"
              : "Selecciona una celebración"}
          </h1>

          <p
            style={{
              maxWidth: "720px",
              margin: "14px 0 0",
              fontSize: "1rem",
              lineHeight: 1.7,
              color:
                "var(--color-text-secondary)",
            }}
          >
            {celebration
              ? `Selecciona las personas de ${celebration.name} que quieres importar a COMUNICA.`
              : "Selecciona la celebración de CONFIRMA desde la que quieres traer personas a COMUNICA."}
          </p>
        </section>

        {/* CELEBRATIONS */}

        {!celebration && (
          <>
            <section
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px 24px",
                marginBottom: "28px",
                borderRadius: "22px",
                background:
                  "#FBF8F1",
                border:
                  "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  flexShrink: 0,
                  borderRadius: "50%",
                  background:
                    "#F1EADB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color:
                    "var(--color-accent)",
                }}
              >
                C
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.92rem",
                    fontWeight: 500,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Conexión con CONFIRMA
                </p>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Estas son las celebraciones
                  disponibles en CONFIRMA.
                </p>
              </div>
            </section>

            {/* LOADING */}

            {loading && (
              <div
                style={{
                  padding:
                    "70px 30px",
                  textAlign: "center",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Cargando celebraciones...
              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <section
                style={{
                  padding: "28px",
                  borderRadius: "24px",
                  background:
                    "#FBF4F1",
                  border:
                    "1px solid #E8D8D1",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 500,
                    color: "#765F56",
                  }}
                >
                  No pudimos cargar las
                  celebraciones de CONFIRMA.
                </p>

                <p
                  style={{
                    margin:
                      "8px 0 0",
                    fontSize: "0.9rem",
                    color: "#8A7067",
                  }}
                >
                  {error}
                </p>
              </section>
            )}

            {/* CELEBRATIONS */}

            {!loading &&
              !error &&
              celebrations.length > 0 && (
                <section
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "16px",
                  }}
                >
                  {celebrations.map(
                    (item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          selectCelebration(
                            item.id
                          )
                        }
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: "24px",
                          padding:
                            "26px 30px",
                          borderRadius:
                            "26px",
                          border:
                            "1px solid var(--color-border)",
                          background:
                            "var(--color-surface)",
                          textAlign:
                            "left",
                          cursor:
                            "pointer",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "20px",
                          }}
                        >
                          <div
                            style={{
                              width: "58px",
                              height: "58px",
                              flexShrink: 0,
                              borderRadius:
                                "50%",
                              background:
                                "#F7F3EB",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                "var(--color-accent)",
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
                              <path d="M7 4v4" />
                              <path d="M17 4v4" />
                              <rect
                                x="4"
                                y="6"
                                width="16"
                                height="14"
                                rx="2"
                              />
                              <path d="M4 10h16" />
                            </svg>
                          </div>

                          <div>
                            <h2
                              style={{
                                margin: 0,
                                fontFamily:
                                  "var(--font-display)",
                                fontSize:
                                  "1.85rem",
                                fontWeight: 500,
                                color:
                                  "var(--color-text)",
                              }}
                            >
                              {item.name}
                            </h2>

                            <p
                              style={{
                                margin:
                                  "6px 0 0",
                                fontSize:
                                  "0.9rem",
                                color:
                                  "var(--color-text-secondary)",
                              }}
                            >
                              {formatDate(
                                item.event_date
                              )}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "24px",
                          }}
                        >
                          <div
                            style={{
                              textAlign:
                                "right",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize:
                                  "1rem",
                                fontWeight:
                                  500,
                                color:
                                  "var(--color-text)",
                              }}
                            >
                              {item.guest_count}
                            </p>

                            <p
                              style={{
                                margin:
                                  "3px 0 0",
                                fontSize:
                                  "0.78rem",
                                color:
                                  "var(--color-text-secondary)",
                              }}
                            >
                              personas
                            </p>
                          </div>

                          <span
                            style={{
                              fontSize:
                                "1.4rem",
                              color:
                                "var(--color-accent)",
                            }}
                          >
                            →
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </section>
              )}

            {!loading &&
              !error &&
              celebrations.length ===
                0 && (
                <div
                  style={{
                    padding:
                      "70px 30px",
                    textAlign:
                      "center",
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  No hay celebraciones
                  disponibles en CONFIRMA.
                </div>
              )}
          </>
        )}

        {/* PEOPLE */}

        {celebration && (
          <>
            <section
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "20px",
                padding: "20px 24px",
                marginBottom: "28px",
                borderRadius: "22px",
                background:
                  "#FBF8F1",
                border:
                  "1px solid var(--color-border)",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    letterSpacing:
                      "0.16em",
                    textTransform:
                      "uppercase",
                    color:
                      "var(--color-accent)",
                  }}
                >
                  Celebración seleccionada
                </p>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontFamily:
                      "var(--font-display)",
                    fontSize: "1.65rem",
                    color:
                      "var(--color-text)",
                  }}
                >
                  {celebration.name}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  backToCelebrations
                }
                style={{
                  border:
                    "1px solid var(--color-border)",
                  borderRadius:
                    "999px",
                  padding:
                    "10px 18px",
                  background:
                    "var(--color-surface)",
                  color:
                    "var(--color-text-secondary)",
                  cursor:
                    "pointer",
                }}
              >
                Cambiar celebración
              </button>
            </section>

            {/* PEOPLE LOADING */}

            {peopleLoading && (
              <section
                style={{
                  padding:
                    "60px 30px",
                  textAlign: "center",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius:
                    "28px",
                  background:
                    "var(--color-surface)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Cargando personas de
                  CONFIRMA...
                </p>
              </section>
            )}

            {/* PEOPLE ERROR */}

            {!peopleLoading &&
              peopleError && (
                <section
                  style={{
                    padding: "28px",
                    borderRadius:
                      "24px",
                    background:
                      "#FBF4F1",
                    border:
                      "1px solid #E8D8D1",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      color: "#765F56",
                    }}
                  >
                    No pudimos cargar las
                    personas de CONFIRMA.
                  </p>

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize: "0.9rem",
                      color: "#8A7067",
                    }}
                  >
                    {peopleError}
                  </p>
                </section>
              )}

            {/* PEOPLE */}

            {!peopleLoading &&
              !peopleError && (
                <>
                  {/* TOOLBAR */}

                  <section
                    style={{
                      marginBottom:
                        "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: "16px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontFamily:
                              "var(--font-display)",
                            fontSize:
                              "2rem",
                            fontWeight:
                              500,
                            color:
                              "var(--color-text)",
                          }}
                        >
                          Personas de la celebración
                        </h2>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                            fontSize:
                              "0.9rem",
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          {selectedPeople.length} de{" "}
                          {people.length}{" "}
                          seleccionadas
                        </p>
                      </div>

                      <input
                        type="text"
                        placeholder="Buscar persona..."
                        value={search}
                        onChange={(e) =>
                          setSearch(
                            e.target.value
                          )
                        }
                        style={{
                          width:
                            "310px",
                          maxWidth:
                            "100%",
                          padding:
                            "13px 18px",
                          borderRadius:
                            "999px",
                          border:
                            "1px solid var(--color-border)",
                          outline:
                            "none",
                          background:
                            "var(--color-surface)",
                          color:
                            "var(--color-text)",
                        }}
                      />
                    </div>

                    {/* RSVP FILTERS */}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop:
                          "18px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      {filterOptions.map(
                        (filter) => (
                          <button
                            key={
                              filter.value
                            }
                            type="button"
                            onClick={() =>
                              setRsvpFilter(
                                filter.value
                              )
                            }
                            style={{
                              borderRadius:
                                "999px",
                              padding:
                                "9px 18px",
                              border:
                                "1px solid var(--color-border)",
                              background:
                                rsvpFilter ===
                                filter.value
                                  ? "var(--color-accent)"
                                  : "var(--color-surface)",
                              color:
                                rsvpFilter ===
                                filter.value
                                  ? "#fff"
                                  : "var(--color-text-secondary)",
                              cursor:
                                "pointer",
                              fontSize:
                                "0.85rem",
                            }}
                          >
                            {filter.label}
                          </button>
                        )
                      )}
                    </div>
                  </section>

                  {/* TABLE */}

                  <section
                    style={{
                      border:
                        "1px solid var(--color-border)",
                      borderRadius:
                        "28px",
                      overflow:
                        "hidden",
                      background:
                        "var(--color-surface)",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "48px 1.5fr 1.2fr 1.2fr 1fr",
                        alignItems:
                          "center",
                        gap: "12px",
                        padding:
                          "18px 24px",
                        borderBottom:
                          "1px solid var(--color-border)",
                        background:
                          "#FBF8F1",
                        fontSize:
                          "0.72rem",
                        letterSpacing:
                          "0.12em",
                        textTransform:
                          "uppercase",
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          allVisibleSelected
                        }
                        onChange={
                          toggleAll
                        }
                      />

                      <span>
                        Nombre
                      </span>

                      <span>
                        Teléfono
                      </span>

                      <span>
                        Grupo
                      </span>

                      <span>
                        RSVP
                      </span>
                    </div>

                    {filteredPeople.length ===
                    0 ? (
                      <div
                        style={{
                          padding:
                            "60px 30px",
                          textAlign:
                            "center",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        No hay personas que
                        coincidan con los
                        filtros seleccionados.
                      </div>
                    ) : (
                      filteredPeople.map(
                        (person) => (
                          <div
                            key={
                              person.id
                            }
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "48px 1.5fr 1.2fr 1.2fr 1fr",
                              alignItems:
                                "center",
                              gap: "12px",
                              padding:
                                "20px 24px",
                              borderBottom:
                                "1px solid var(--color-border)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPeople.includes(
                                person.id
                              )}
                              onChange={() =>
                                togglePerson(
                                  person.id
                                )
                              }
                            />

                            <strong
                              style={{
                                color:
                                  "var(--color-text)",
                                fontWeight:
                                  500,
                              }}
                            >
                              {person.name}
                            </strong>

                            <span
                              style={{
                                color:
                                  "var(--color-text-secondary)",
                              }}
                            >
                              {person.phone ||
                                "—"}
                            </span>

                            <span
                              style={{
                                color:
                                  "var(--color-text-secondary)",
                                fontSize:
                                  "0.9rem",
                              }}
                            >
                              {person.group}
                            </span>

                            <span
                              style={{
                                display:
                                  "inline-flex",
                                width:
                                  "fit-content",
                                padding:
                                  "6px 12px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "0.75rem",
                                background:
                                  person.rsvp ===
                                  "confirmed"
                                    ? "#EDF4EC"
                                    : person.rsvp ===
                                      "declined"
                                    ? "#F6ECE9"
                                    : "#F4F0E7",
                                color:
                                  person.rsvp ===
                                  "confirmed"
                                    ? "#66806C"
                                    : person.rsvp ===
                                      "declined"
                                    ? "#9A6F65"
                                    : "#8D7A55",
                              }}
                            >
                              {person.rsvp ===
                              "confirmed"
                                ? "Confirmado"
                                : person.rsvp ===
                                  "declined"
                                ? "No asistirá"
                                : "Pendiente"}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </section>

                  {/* IMPORT BUTTON */}

                  {selectedPeople.length >
                    0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "flex-end",
                        marginTop:
                          "24px",
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          border: "none",
                          borderRadius:
                            "999px",
                          padding:
                            "13px 24px",
                          background:
                            "var(--color-accent)",
                          color: "#fff",
                          cursor:
                            "pointer",
                          fontSize:
                            "0.9rem",
                          fontWeight:
                            500,
                        }}
                      >
                        Importar{" "}
                        {
                          selectedPeople.length
                        }{" "}
                        personas
                      </button>
                    </div>
                  )}
                </>
              )}
          </>
        )}
      </main>
    </div>
  );
}