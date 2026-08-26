"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/studio/Sidebar";
import { supabase } from "@/lib/supabase/client";

type PersonExperience = {
  id: string;
  experience_name: string;
  experience_code: string | null;
  status: "confirmed" | "pending" | "declined";
  attending: boolean | null;
  responded_at: string | null;
};

type Person = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  titular: string;
  experiences: PersonExperience[];
};

type Event = {
  id: string;
  name: string;
  event_date: string | null;
  source: "confirma" | "file";
};

export default function PeoplePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [people, setPeople] = useState<Person[]>([]);

  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("Todas");
  const [status, setStatus] = useState("Todos");

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------------------------------------- */
  /* Cargar eventos de COMUNICA                                    */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoadingEvents(true);
        setError("");

        const { data, error: eventsError } = await supabase
          .from("events")
          .select("id, name, event_date, source")
          .order("event_date", {
            ascending: true,
            nullsFirst: false,
          })
          .order("name", {
            ascending: true,
          });

        if (eventsError) {
          throw eventsError;
        }

        setEvents((data ?? []) as Event[]);
      } catch (err) {
        console.error("Error loading COMUNICA events:", err);
        setError(
          "No fue posible cargar los eventos. Revisa la conexión con Supabase."
        );
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, []);

  /* -------------------------------------------------------------- */
  /* Cargar personas del evento                                    */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedEvent) {
      setPeople([]);
      return;
    }

    async function loadPeople() {
      try {
        setLoadingPeople(true);
        setError("");

        const { data, error: peopleError } = await supabase
          .from("people")
          .select(
            `
              id,
              name,
              phone,
              email,
              titular_name,
              person_experiences (
                id,
                experience_name,
                experience_code,
                status,
                attending,
                responded_at
              )
            `
          )
          .eq("event_id", selectedEvent)
          .order("name", {
            ascending: true,
          });

        if (peopleError) {
          throw peopleError;
        }

        const normalizedPeople: Person[] = (data ?? []).map(
          (person: any) => ({
            id: person.id,
            name: person.name,
            phone: person.phone,
            email: person.email,
            titular: person.titular_name || "—",
            experiences: (person.person_experiences ?? []).map(
              (item: any) => ({
                id: item.id,
                experience_name: item.experience_name,
                experience_code: item.experience_code,
                status: item.status,
                attending: item.attending,
                responded_at: item.responded_at,
              })
            ),
          })
        );

        setPeople(normalizedPeople);
      } catch (err) {
        console.error("Error loading COMUNICA people:", err);
        setPeople([]);
        setError(
          "No fue posible cargar las personas de este evento."
        );
      } finally {
        setLoadingPeople(false);
      }
    }

    loadPeople();
  }, [selectedEvent]);

  /* -------------------------------------------------------------- */
  /* Opciones dinámicas de filtros                                 */
  /* -------------------------------------------------------------- */

  const experiences = useMemo(() => {
    const names = Array.from(
      new Set(
        people.flatMap((person) =>
          person.experiences.map(
            (item) => item.experience_name
          )
        )
      )
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        sensitivity: "base",
      })
    );

    return ["Todas", ...names];
  }, [people]);

  const statuses = [
    "Todos",
    "Confirmado",
    "Pendiente",
    "No asistirá",
  ];

  /* -------------------------------------------------------------- */
  /* Filtros                                                        */
  /* -------------------------------------------------------------- */

  const filteredPeople = people.filter((person) => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      person.name.toLowerCase().includes(normalizedSearch) ||
      (person.phone ?? "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      (person.email ?? "")
        .toLowerCase()
        .includes(normalizedSearch);

    if (!matchesSearch) {
      return false;
    }

    const matchesExperience =
      experience === "Todas" ||
      person.experiences.some(
        (item) =>
          item.experience_name === experience
      );

    if (!matchesExperience) {
      return false;
    }

    if (status === "Todos") {
      return true;
    }

    const targetStatus =
      status === "Confirmado"
        ? "confirmed"
        : status === "No asistirá"
          ? "declined"
          : "pending";

    /*
     * Si hay una experiencia seleccionada,
     * el estado se evalúa sobre ESA experiencia.
     *
     * Si no hay experiencia seleccionada,
     * la persona aparece si al menos una
     * de sus experiencias tiene ese estado.
     */
    return person.experiences.some((item) => {
      const matchesSelectedExperience =
        experience === "Todas" ||
        item.experience_name === experience;

      return (
        matchesSelectedExperience &&
        item.status === targetStatus
      );
    });
  });

  const hasSelectedEvent = selectedEvent !== "";

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
              gap: "30px",
              marginBottom: "38px",
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
                  margin: "12px 0 0",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                }}
              >
                Administra las personas de tus eventos y organiza tu base de
                destinatarios.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Link
                href="/dashboard/people/new"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  padding: "14px 22px",
                  background: "var(--color-primary)",
                  color: "#FFFFFF",
                  fontSize: "0.94rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                + Agregar persona
              </Link>

              <Link
                href="/dashboard/people/import"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--color-primary)",
                  borderRadius: "999px",
                  padding: "13px 21px",
                  background: "transparent",
                  color: "var(--color-accent)",
                  fontSize: "0.94rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                Importar personas
              </Link>
            </div>
          </section>

          {/* EVENT */}

          <section
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "24px",
              padding: "24px 26px",
              marginBottom: hasSelectedEvent ? "22px" : "30px",
            }}
          >
            <label
              htmlFor="event"
              style={{
                display: "block",
                marginBottom: "9px",
                fontSize: "0.76rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}
            >
              Evento
            </label>

            <select
              id="event"
              value={selectedEvent}
              onChange={(event) => {
                setSelectedEvent(event.target.value);
                setSearch("");
                setExperience("Todas");
                setStatus("Todos");
              }}
              style={{
                width: "100%",
                maxWidth: "520px",
                height: "48px",
                padding: "0 15px",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                background: "#FFFFFF",
                color: selectedEvent
                  ? "var(--color-text)"
                  : "var(--color-text-secondary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            >
              <option value="">
                {loadingEvents
                  ? "Cargando eventos..."
                  : "Selecciona un evento"}
              </option>

              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </section>

          {/* NO EVENT SELECTED */}

          {!hasSelectedEvent && (
            <section
              style={{
                minHeight: "390px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "28px",
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
                    width: "72px",
                    height: "72px",
                    margin: "0 auto 24px",
                    borderRadius: "50%",
                    background: "#F7F3EB",
                    border: "1px solid #EEE7DA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4l2.5 2" />
                  </svg>
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontSize: "2.1rem",
                    fontWeight: 500,
                    lineHeight: 1.1,
                    color: "var(--color-text)",
                  }}
                >
                  Selecciona un evento
                </h2>

                <p
                  style={{
                    maxWidth: "500px",
                    margin: "14px auto 0",
                    fontSize: "0.98rem",
                    lineHeight: 1.7,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Selecciona un evento para consultar y administrar las
                  personas asociadas.
                </p>
              </div>
            </section>
          )}

          {/* SELECTED EVENT */}

          {hasSelectedEvent && (
            <>
              {error && (
                <section
                  style={{
                    marginBottom: "18px",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "#F8EEEA",
                    border: "1px solid #E7D3CB",
                    color: "#8A5D52",
                    fontSize: "0.88rem",
                  }}
                >
                  {error}
                </section>
              )}

              {loadingPeople ? (
                <section
                  style={{
                    minHeight: "260px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "50px 30px",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.95rem",
                  }}
                >
                  Cargando personas...
                </section>
              ) : (
                <>
                  {/* EVENT SUMMARY */}

              <section
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.76rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Personas del evento
                  </p>

                  <h2
                    style={{
                      margin: "6px 0 0",
                      fontFamily: "var(--font-display)",
                      fontSize: "2.15rem",
                      fontWeight: 500,
                      lineHeight: 1.1,
                      color: "var(--color-text)",
                    }}
                  >
                    {events.find(
                      (event) => event.id === selectedEvent
                    )?.name ?? "Evento"}
                  </h2>
                </div>

                <div
                  style={{
                    padding: "12px 18px",
                    borderRadius: "16px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.8rem",
                      lineHeight: 1,
                      color: "var(--color-text)",
                    }}
                  >
                    {filteredPeople.length}
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "0.78rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {filteredPeople.length === 1
                      ? "persona"
                      : "personas"}
                  </div>
                </div>
              </section>

              {/* SEARCH + FILTERS */}

              <section
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    flex: "1 1 320px",
                    maxWidth: "520px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-secondary)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nombre o teléfono"
                    style={{
                      width: "100%",
                      height: "46px",
                      boxSizing: "border-box",
                      padding: "0 15px 0 44px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      fontSize: "0.92rem",
                      outline: "none",
                    }}
                  />
                </div>

                <select
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  style={{
                    height: "46px",
                    minWidth: "150px",
                    padding: "0 13px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  {experiences.map((item) => (
                    <option key={item} value={item}>
                      {item === "Todas" ? "Experiencia" : item}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  style={{
                    height: "46px",
                    minWidth: "150px",
                    padding: "0 13px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item === "Todos" ? "Estado" : item}
                    </option>
                  ))}
                </select>
              </section>

              {/* PEOPLE COUNT */}

              <div
                style={{
                  marginBottom: "14px",
                  fontSize: "0.88rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {filteredPeople.length}{" "}
                {filteredPeople.length === 1 ? "persona" : "personas"}
              </div>

              {/* EMPTY STATE */}

              {filteredPeople.length === 0 ? (
                <section
                  style={{
                    minHeight: "340px",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "28px",
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
                        border: "1px solid #EEE7DA",
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
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3.5 19c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5" />
                        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
                        <path d="M17 14c2.1.5 3.3 2.1 3.7 4.5" />
                      </svg>
                    </div>

                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        fontWeight: 500,
                        lineHeight: 1.1,
                        color: "var(--color-text)",
                      }}
                    >
                      Este evento todavía no tiene personas
                    </h2>

                    <p
                      style={{
                        maxWidth: "500px",
                        margin: "12px auto 26px",
                        fontSize: "0.96rem",
                        lineHeight: 1.65,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Agrega personas manualmente o importa una lista para
                      comenzar a gestionar los destinatarios de este evento.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Link
                        href="/dashboard/people/new"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "999px",
                          padding: "12px 22px",
                          background: "var(--color-primary)",
                          color: "#FFFFFF",
                          fontSize: "0.92rem",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        + Agregar persona
                      </Link>

                      <Link
                        href="/dashboard/people/import"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid var(--color-primary)",
                          borderRadius: "999px",
                          padding: "11px 21px",
                          background: "transparent",
                          color: "var(--color-accent)",
                          fontSize: "0.92rem",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        Importar personas
                      </Link>
                    </div>
                  </div>
                </section>
              ) : (
                /* TABLE */

                <section
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "24px",
                    overflow: "hidden",
                  }}
                >
                  {/* TABLE HEADER */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.35fr 1.15fr 1.15fr 1fr 1fr 90px",
                      gap: "16px",
                      alignItems: "center",
                      padding: "15px 22px",
                      background: "#FBF9F4",
                      borderBottom: "1px solid var(--color-border)",
                      fontSize: "0.73rem",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span>Nombre</span>
                    <span>Teléfono</span>
                    <span>Titular</span>
                    <span>Experiencia</span>
                    <span>Estado general</span>
                    <span></span>
                  </div>

                  {filteredPeople.map((person) => (
                    <PersonRow key={person.id} person={person} />
                  ))}
                </section>
              )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PERSON ROW
========================================================= */

function PersonRow({ person }: { person: Person }) {
  const confirmedCount = person.experiences.filter(
    (item) => item.status === "confirmed"
  ).length;

  const pendingCount = person.experiences.filter(
    (item) => item.status === "pending"
  ).length;

  const declinedCount = person.experiences.filter(
    (item) => item.status === "declined"
  ).length;

  const overallStatus =
    person.experiences.length === 0
      ? "Pendiente"
      : confirmedCount === person.experiences.length
        ? "Confirmado"
        : declinedCount === person.experiences.length
          ? "No asistirá"
          : confirmedCount > 0
            ? "Parcial"
            : "Pendiente";

  const overallIsConfirmed =
    overallStatus === "Confirmado";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1.35fr 1.15fr 1.15fr 1fr 1fr 90px",
        gap: "16px",
        alignItems: "center",
        padding: "20px 22px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.08rem",
          color: "var(--color-text)",
        }}
      >
        {person.name}
      </div>

      <div
        style={{
          fontSize: "0.88rem",
          color: "var(--color-text-secondary)",
        }}
      >
        {person.phone}
      </div>

      <div
        style={{
          fontSize: "0.88rem",
          color: "var(--color-text-secondary)",
        }}
      >
        {person.titular}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          minWidth: 0,
        }}
      >
        {person.experiences.length > 0 ? (
          person.experiences.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.84rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {item.experience_name}
              </span>

              <span
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  padding: "5px 8px",
                  background:
                    item.status === "confirmed"
                      ? "#EEF4EE"
                      : item.status === "declined"
                        ? "#F7EDEA"
                        : "#F7F3EB",
                  color:
                    item.status === "confirmed"
                      ? "#536B55"
                      : item.status === "declined"
                        ? "#8A5D52"
                        : "var(--color-accent)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                }}
              >
                {item.status === "confirmed"
                  ? "Confirmada"
                  : item.status === "declined"
                    ? "No asistirá"
                    : "Pendiente"}
              </span>
            </div>
          ))
        ) : (
          <span
            style={{
              fontSize: "0.88rem",
              color: "var(--color-text-secondary)",
            }}
          >
            Sin experiencia
          </span>
        )}
      </div>

      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "999px",
            padding: "7px 11px",
            background: overallIsConfirmed
              ? "#EEF4EE"
              : overallStatus === "No asistirá"
                ? "#F7EDEA"
                : overallStatus === "Parcial"
                  ? "#F2EFE5"
                  : "#F7F3EB",
            color: overallIsConfirmed
              ? "#536B55"
              : overallStatus === "No asistirá"
                ? "#8A5D52"
                : "var(--color-accent)",
            fontSize: "0.78rem",
            fontWeight: 500,
          }}
        >
          {overallStatus}
        </span>
      </div>

      <Link
        href={`/dashboard/people/${person.id}`}
        style={{
          color: "var(--color-accent)",
          textDecoration: "none",
          fontSize: "0.86rem",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        Ver →
      </Link>
    </div>
  );
}