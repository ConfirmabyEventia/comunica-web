"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ImportSource = "confirma" | "archivo" | null;

interface Celebration {
  id: string;
  name: string;
}

interface Experience {
  id: string;
  name: string;
  name_en: string | null;
  moment_type: string;
  starts_at: string;
  ends_at: string | null;
  attending: boolean | null;
  responded_at: string | null;
  status: "confirmed" | "declined" | "pending";
}

interface Person {
  id: string;
  guest_code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  is_principal_contact: boolean;
  rsvp_status: string | null;
  rsvp_attending: boolean | null;
  invitation_group_id: string;
  experiences: Experience[];
}

export default function ImportPeoplePage() {
  const [source, setSource] =
    useState<ImportSource>(null);

  /* ---------------------------------------------------------------------- */
  /* CONFIRMA                                                               */
  /* ---------------------------------------------------------------------- */

  const [celebrations, setCelebrations] = useState<
    Celebration[]
  >([]);

  const [
    selectedCelebrationId,
    setSelectedCelebrationId,
  ] = useState("");

  const [people, setPeople] = useState<Person[]>([]);

  const [selectedPeople, setSelectedPeople] =
    useState<string[]>([]);

  const [loadingCelebrations, setLoadingCelebrations] =
    useState(false);

  const [loadingPeople, setLoadingPeople] =
    useState(false);

  const [search, setSearch] = useState("");

  /* FILTERS */

  const [showFilters, setShowFilters] =
    useState(false);

  const [experienceFilter, setExperienceFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  /* ---------------------------------------------------------------------- */
  /* ARCHIVO                                                                */
  /* ---------------------------------------------------------------------- */

  const [event, setEvent] = useState("");
  const [showNewEvent, setShowNewEvent] =
    useState(false);

  const [newEventName, setNewEventName] =
    useState("");

  const [fileName, setFileName] =
    useState("");

  const [events, setEvents] = useState([
    {
      id: "boda-laura-juan",
      name: "Boda Laura & Juan",
    },
    {
      id: "boda-maria-carlos",
      name: "Boda María & Carlos",
    },
  ]);

  const canCreateEvent =
    newEventName.trim() !== "";

  /* ---------------------------------------------------------------------- */
  /* LOAD CONFIRMA CELEBRATIONS                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (source !== "confirma") return;

    async function loadCelebrations() {
      try {
        setLoadingCelebrations(true);

        const response = await fetch(
          "/api/confirma/celebrations"
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error ||
              "No fue posible cargar las celebraciones."
          );
        }

        const normalizedCelebrations: Celebration[] =
          (result.celebrations ?? []).map(
            (celebration: any) => ({
              id: celebration.id,
              name:
                celebration.name ||
                celebration.title ||
                "Celebración sin nombre",
            })
          );

        setCelebrations(
          normalizedCelebrations
        );
      } catch (error) {
        console.error(
          "Error loading CONFIRMA celebrations:",
          error
        );

        setCelebrations([]);
      } finally {
        setLoadingCelebrations(false);
      }
    }

    loadCelebrations();
  }, [source]);

  /* ---------------------------------------------------------------------- */
  /* LOAD CONFIRMA PEOPLE                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedCelebrationId) {
      setPeople([]);
      setSelectedPeople([]);
      return;
    }

    async function loadPeople() {
      try {
        setLoadingPeople(true);
        setSelectedPeople([]);

        const response = await fetch(
          `/api/confirma/celebrations/${selectedCelebrationId}/people`
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error ||
              "No fue posible cargar las personas."
          );
        }

        setPeople(result.people ?? []);
      } catch (error) {
        console.error(
          "Error loading CONFIRMA people:",
          error
        );

        setPeople([]);
      } finally {
        setLoadingPeople(false);
      }
    }

    loadPeople();
  }, [selectedCelebrationId]);

  /* ---------------------------------------------------------------------- */
  /* EXPERIENCE OPTIONS                                                     */
  /* ---------------------------------------------------------------------- */

  const experienceOptions = useMemo(() => {
    const experienceMap = new Map<
      string,
      Experience
    >();

    people.forEach((person) => {
      (person.experiences ?? []).forEach(
        (experience) => {
          if (!experienceMap.has(experience.id)) {
            experienceMap.set(
              experience.id,
              experience
            );
          }
        }
      );
    });

    return Array.from(
      experienceMap.values()
    ).sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "es",
        { sensitivity: "base" }
      )
    );
  }, [people]);

  /* ---------------------------------------------------------------------- */
  /* FILTERED PEOPLE                                                        */
  /* ---------------------------------------------------------------------- */

  const filteredPeople = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return people.filter((person) => {
      /* SEARCH */

      const matchesSearch =
        !normalizedSearch ||
        person.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        (person.phone ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (person.email ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      /* EXPERIENCE */

      const matchesExperience =
        experienceFilter === "all" ||
        (person.experiences ?? []).some(
          (experience) =>
            experience.id ===
            experienceFilter
        );

      if (!matchesExperience) {
        return false;
      }

      /* STATUS — por experiencia */

      if (statusFilter !== "all") {
        const experiencesToCheck =
          experienceFilter === "all"
            ? person.experiences ?? []
            : (person.experiences ?? []).filter(
                (experience) =>
                  experience.id === experienceFilter
              );

        const matchesStatus = experiencesToCheck.some(
          (experience) =>
            experience.status === statusFilter
        );

        if (!matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [
    people,
    search,
    experienceFilter,
    statusFilter,
  ]);

  /* ---------------------------------------------------------------------- */
  /* ACTIVE FILTER COUNT                                                    */
  /* ---------------------------------------------------------------------- */

  const activeFilterCount =
    (experienceFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0);

  /* ---------------------------------------------------------------------- */
  /* SELECTION                                                              */
  /* ---------------------------------------------------------------------- */

  function togglePerson(personId: string) {
    setSelectedPeople((current) => {
      if (current.includes(personId)) {
        return current.filter(
          (id) => id !== personId
        );
      }

      return [...current, personId];
    });
  }

  function toggleAllVisible() {
    const visibleIds = filteredPeople.map(
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
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedPeople((current) => [
        ...current,
        ...visibleIds.filter(
          (id) => !current.includes(id)
        ),
      ]);
    }
  }

  const allVisibleSelected =
    filteredPeople.length > 0 &&
    filteredPeople.every((person) =>
      selectedPeople.includes(person.id)
    );

  /* ---------------------------------------------------------------------- */
  /* RESET FILTERS                                                          */
  /* ---------------------------------------------------------------------- */

  function clearFilters() {
    setExperienceFilter("all");
    setStatusFilter("all");
    setSearch("");
  }

  /* ---------------------------------------------------------------------- */
  /* NEW EVENT                                                               */
  /* ---------------------------------------------------------------------- */

  function handleCreateEvent() {
    if (!canCreateEvent) return;

    const newEvent = {
      id: `event-${Date.now()}`,
      name: newEventName.trim(),
    };

    setEvents((currentEvents) => [
      ...currentEvents,
      newEvent,
    ]);

    setEvent(newEvent.id);
    setNewEventName("");
    setShowNewEvent(false);
  }

  /* ---------------------------------------------------------------------- */
  /* FILE                                                                    */
  /* ---------------------------------------------------------------------- */

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
  }

  /* ---------------------------------------------------------------------- */
  /* SOURCE CHANGE                                                           */
  /* ---------------------------------------------------------------------- */

  function handleSourceChange(
    nextSource: ImportSource
  ) {
    setSource(nextSource);

    setSelectedCelebrationId("");
    setPeople([]);
    setSelectedPeople([]);
    setSearch("");

    setExperienceFilter("all");
    setStatusFilter("all");
    setShowFilters(false);

    setEvent("");
    setFileName("");
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

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
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "18px 46px 70px",
        }}
      >
        {/* BACK */}

        <Link
          href="/dashboard/people"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "52px",
            color: "#D2C2A3",
            fontSize: "0.95rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontSize: "1.25rem",
              lineHeight: 1,
            }}
          >
            ←
          </span>

          <span>Personas</span>
        </Link>

        {/* HEADER */}

        <section
          style={{
            marginBottom: "34px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily:
                "var(--font-display)",
              fontSize: "3.35rem",
              fontWeight: 500,
              lineHeight: 1.05,
              color: "var(--color-text)",
            }}
          >
            Importar personas
          </h1>

          <p
            style={{
              maxWidth: "650px",
              margin: "12px 0 0",
              fontSize: "1rem",
              lineHeight: 1.6,
              color:
                "var(--color-text-secondary)",
            }}
          >
            Agrega personas a COMUNICA desde
            CONFIRMA o desde un archivo.
          </p>
        </section>

        {/* STEP 1 */}

        <section
          style={{
            background:
              "var(--color-surface)",
            border:
              "1px solid var(--color-border)",
            borderRadius: "28px",
            padding: "30px 34px",
            marginBottom: "22px",
          }}
        >
          <div style={stepLabelStyle}>
            Paso 1
          </div>

          <h2 style={sectionTitleStyle}>
            ¿De dónde vienen las personas?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {/* CONFIRMA */}

            <button
              type="button"
              onClick={() =>
                handleSourceChange(
                  "confirma"
                )
              }
              style={{
                textAlign: "left",
                padding: "25px",
                borderRadius: "22px",
                border:
                  source === "confirma"
                    ? "1.5px solid #D2C2A3"
                    : "1px solid var(--color-border)",
                background:
                  source === "confirma"
                    ? "#FBF9F4"
                    : "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              <div
                style={iconCircleStyle}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D2C2A3"
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
                </svg>
              </div>

              <h3 style={cardTitleStyle}>
                Desde CONFIRMA
              </h3>

              <p style={cardTextStyle}>
                Importa las personas de una
                celebración que ya existe en
                CONFIRMA.
              </p>
            </button>

            {/* ARCHIVO */}

            <button
              type="button"
              onClick={() =>
                handleSourceChange(
                  "archivo"
                )
              }
              style={{
                textAlign: "left",
                padding: "25px",
                borderRadius: "22px",
                border:
                  source === "archivo"
                    ? "1.5px solid #D2C2A3"
                    : "1px solid var(--color-border)",
                background:
                  source === "archivo"
                    ? "#FBF9F4"
                    : "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              <div
                style={iconCircleStyle}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D2C2A3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h8L20 10.5V18.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5Z" />
                  <path d="M13 4v7h7" />
                  <path d="M8 15h8" />
                  <path d="M8 18h5" />
                </svg>
              </div>

              <h3 style={cardTitleStyle}>
                Desde archivo
              </h3>

              <p style={cardTextStyle}>
                Carga la plantilla de Excel de
                COMUNICA con tus personas.
              </p>
            </button>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CONFIRMA FLOW                                                    */}
        {/* ---------------------------------------------------------------- */}

        {source === "confirma" && (
          <>
            {/* CELEBRATION */}

            <section
              style={{
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "28px",
                padding: "30px 34px",
                marginBottom: "22px",
              }}
            >
              <div style={stepLabelStyle}>
                Paso 2
              </div>

              <h2 style={sectionTitleStyle}>
                Selecciona la celebración
              </h2>

              <p
                style={{
                  margin:
                    "0 0 18px",
                  fontSize:
                    "0.92rem",
                  lineHeight: 1.6,
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Estas celebraciones vienen
                directamente de CONFIRMA.
              </p>

              {loadingCelebrations ? (
                <div
                  style={loadingStyle}
                >
                  Cargando celebraciones...
                </div>
              ) : celebrations.length ===
                0 ? (
                <div
                  style={emptyStyle}
                >
                  No encontramos celebraciones
                  en CONFIRMA.
                </div>
              ) : (
                <select
                  value={
                    selectedCelebrationId
                  }
                  onChange={(e) =>
                    setSelectedCelebrationId(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option value="">
                    Selecciona una
                    celebración
                  </option>

                  {celebrations.map(
                    (celebration) => (
                      <option
                        key={
                          celebration.id
                        }
                        value={
                          celebration.id
                        }
                      >
                        {celebration.name}
                      </option>
                    )
                  )}
                </select>
              )}
            </section>

            {/* PEOPLE */}

            {selectedCelebrationId && (
              <section
                style={{
                  background:
                    "var(--color-surface)",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "28px",
                  padding:
                    "30px 34px",
                }}
              >
                <div
                  style={stepLabelStyle}
                >
                  Paso 3
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-end",
                    justifyContent:
                      "space-between",
                    gap: "20px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        ...sectionTitleStyle,
                        marginBottom:
                          "6px",
                      }}
                    >
                      Selecciona las
                      personas
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        fontSize:
                          "0.9rem",
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      Busca, filtra y
                      selecciona quiénes
                      quieres importar a
                      COMUNICA.
                    </p>
                  </div>

                  {!loadingPeople &&
                    people.length >
                      0 && (
                      <div
                        style={{
                          fontSize:
                            "0.85rem",
                          color:
                            "var(--color-text-secondary)",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          selectedPeople.length
                        }{" "}
                        seleccionadas
                      </div>
                    )}
                </div>

                {loadingPeople ? (
                  <div
                    style={loadingStyle}
                  >
                    Cargando personas de
                    CONFIRMA...
                  </div>
                ) : people.length ===
                  0 ? (
                  <div
                    style={emptyStyle}
                  >
                    Esta celebración no
                    tiene personas
                    disponibles para
                    importar.
                  </div>
                ) : (
                  <>
                    {/* SEARCH + FILTERS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "12px",
                        marginBottom:
                          "14px",
                      }}
                    >
                      <div
                        style={{
                          position:
                            "relative",
                          flex: 1,
                        }}
                      >
                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(
                              e.target
                                .value
                            )
                          }
                          placeholder="Buscar por nombre, teléfono o email"
                          style={{
                            ...inputStyle,
                            paddingRight:
                              "42px",
                          }}
                        />

                        {search && (
                          <button
                            type="button"
                            onClick={() =>
                              setSearch(
                                ""
                              )
                            }
                            style={{
                              position:
                                "absolute",
                              right:
                                "12px",
                              top:
                                "50%",
                              transform:
                                "translateY(-50%)",
                              width:
                                "24px",
                              height:
                                "24px",
                              border:
                                "none",
                              borderRadius:
                                "50%",
                              background:
                                "#EEE9DF",
                              color:
                                "var(--color-text-secondary)",
                              cursor:
                                "pointer",
                              fontSize:
                                "0.8rem",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowFilters(
                            (current) =>
                              !current
                          )
                        }
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: "9px",
                          minWidth:
                            "118px",
                          height:
                            "48px",
                          padding:
                            "0 17px",
                          border:
                            activeFilterCount >
                            0
                              ? "1px solid #D2C2A3"
                              : "1px solid var(--color-border)",
                          borderRadius:
                            "12px",
                          background:
                            activeFilterCount >
                            0
                              ? "#FBF9F4"
                              : "var(--color-surface)",
                          color:
                            "var(--color-text)",
                          fontSize:
                            "0.88rem",
                          fontWeight:
                            500,
                          cursor:
                            "pointer",
                        }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={
                            activeFilterCount >
                            0
                              ? "#D2C2A3"
                              : "var(--color-text-secondary)"
                          }
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 6h16" />
                          <path d="M7 12h10" />
                          <path d="M10 18h4" />
                        </svg>

                        Filtros

                        {activeFilterCount >
                          0 && (
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              minWidth:
                                "20px",
                              height:
                                "20px",
                              padding:
                                "0 5px",
                              borderRadius:
                                "999px",
                              background:
                                "#D2C2A3",
                              color:
                                "#FFFFFF",
                              fontSize:
                                "0.7rem",
                              fontWeight:
                                600,
                            }}
                          >
                            {
                              activeFilterCount
                            }
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={
                          toggleAllVisible
                        }
                        style={{
                          minWidth:
                            "150px",
                          height:
                            "48px",
                          padding:
                            "0 18px",
                          border:
                            "1px solid var(--color-border)",
                          borderRadius:
                            "12px",
                          background:
                            "var(--color-surface)",
                          color:
                            "var(--color-text)",
                          fontSize:
                            "0.88rem",
                          cursor:
                            "pointer",
                        }}
                      >
                        {allVisibleSelected
                          ? "Deseleccionar"
                          : "Seleccionar todas"}
                      </button>
                    </div>

                    {/* FILTER PANEL */}

                    {showFilters && (
                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr auto",
                          gap: "14px",
                          alignItems:
                            "end",
                          padding:
                            "18px 20px",
                          marginBottom:
                            "16px",
                          border:
                            "1px solid var(--color-border)",
                          borderRadius:
                            "18px",
                          background:
                            "#FBF9F4",
                        }}
                      >
                        {/* EXPERIENCE */}

                        <div>
                          <label
                            htmlFor="experience-filter"
                            style={
                              filterLabelStyle
                            }
                          >
                            Experiencia
                          </label>

                          <select
                            id="experience-filter"
                            value={
                              experienceFilter
                            }
                            onChange={(
                              e
                            ) =>
                              setExperienceFilter(
                                e.target
                                  .value
                              )
                            }
                            style={
                              filterSelectStyle
                            }
                          >
                            <option value="all">
                              Todas las
                              experiencias
                            </option>

                            {experienceOptions.map(
                              (
                                experience
                              ) => (
                                <option
                                  key={
                                    experience.id
                                  }
                                  value={
                                    experience.id
                                  }
                                >
                                  {
                                    experience.name
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* STATUS */}

                        <div>
                          <label
                            htmlFor="status-filter"
                            style={
                              filterLabelStyle
                            }
                          >
                            Estado de
                            confirmación
                          </label>

                          <select
                            id="status-filter"
                            value={
                              statusFilter
                            }
                            onChange={(
                              e
                            ) =>
                              setStatusFilter(
                                e.target
                                  .value
                              )
                            }
                            style={
                              filterSelectStyle
                            }
                          >
                            <option value="all">
                              Todos los
                              estados
                            </option>

                            <option value="confirmed">
                              Confirmados
                            </option>

                            <option value="pending">
                              Pendientes
                            </option>

                            <option value="declined">
                              No asistirán
                            </option>
                          </select>
                        </div>

                        {/* CLEAR */}

                        {activeFilterCount >
                          0 && (
                          <button
                            type="button"
                            onClick={
                              clearFilters
                            }
                            style={{
                              height:
                                "44px",
                              padding:
                                "0 14px",
                              border:
                                "none",
                              background:
                                "transparent",
                              color:
                                "#D2C2A3",
                              fontSize:
                                "0.84rem",
                              fontWeight:
                                500,
                              cursor:
                                "pointer",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    )}

                    {/* RESULTS SUMMARY */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom:
                          "12px",
                        fontSize:
                          "0.82rem",
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      <span>
                        Mostrando{" "}
                        <strong
                          style={{
                            color:
                              "var(--color-text)",
                          }}
                        >
                          {
                            filteredPeople.length
                          }
                        </strong>{" "}
                        de{" "}
                        <strong
                          style={{
                            color:
                              "var(--color-text)",
                          }}
                        >
                          {people.length}
                        </strong>{" "}
                        personas
                      </span>

                      {activeFilterCount >
                        0 && (
                        <span>
                          Filtros
                          aplicados
                        </span>
                      )}
                    </div>

                    {/* TABLE */}

                    <div
                      style={{
                        border:
                          "1px solid var(--color-border)",
                        borderRadius:
                          "18px",
                        overflow:
                          "hidden",
                      }}
                    >
                      {/* HEADER */}

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "44px minmax(180px, 1.4fr) minmax(120px, 0.8fr) minmax(160px, 1fr) minmax(120px, 0.8fr)",
                          gap: "12px",
                          padding:
                            "14px 18px",
                          background:
                            "#FBF9F4",
                          borderBottom:
                            "1px solid var(--color-border)",
                          fontSize:
                            "0.72rem",
                          letterSpacing:
                            "0.06em",
                          textTransform:
                            "uppercase",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        <div />

                        <div>
                          Persona
                        </div>

                        <div>
                          Teléfono
                        </div>

                        <div>
                          Experiencia
                        </div>

                        <div>
                          Estado general
                        </div>
                      </div>

                      {/* ROWS */}

                      {filteredPeople.map(
                        (person) => {
                          const selected =
                            selectedPeople.includes(
                              person.id
                            );

                          const experiences =
                            person.experiences ?? [];

                          return (
                            <button
                              key={
                                person.id
                              }
                              type="button"
                              onClick={() =>
                                togglePerson(
                                  person.id
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "44px minmax(180px, 1.4fr) minmax(120px, 0.8fr) minmax(160px, 1fr) minmax(120px, 0.8fr)",
                                gap: "12px",
                                alignItems:
                                  "center",
                                padding:
                                  "16px 18px",
                                border:
                                  "none",
                                borderBottom:
                                  "1px solid var(--color-border)",
                                background:
                                  selected
                                    ? "#FBF9F4"
                                    : "var(--color-surface)",
                                textAlign:
                                  "left",
                                cursor:
                                  "pointer",
                              }}
                            >
                              {/* CHECK */}

                              <div
                                style={{
                                  width:
                                    "20px",
                                  height:
                                    "20px",
                                  borderRadius:
                                    "6px",
                                  border:
                                    selected
                                      ? "1px solid #D2C2A3"
                                      : "1px solid #CFC9BD",
                                  background:
                                    selected
                                      ? "#D2C2A3"
                                      : "#FFFFFF",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  color:
                                    "#FFFFFF",
                                  fontSize:
                                    "0.75rem",
                                  fontWeight:
                                    700,
                                }}
                              >
                                {selected
                                  ? "✓"
                                  : ""}
                              </div>

                              {/* PERSON */}

                              <div
                                style={{
                                  minWidth:
                                    0,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "0.92rem",
                                    fontWeight:
                                      500,
                                    color:
                                      "var(--color-text)",
                                  }}
                                >
                                  {
                                    person.name
                                  }
                                </div>

                                {person.is_principal_contact && (
                                  <div
                                    style={{
                                      marginTop:
                                        "3px",
                                      fontSize:
                                        "0.72rem",
                                      color:
                                        "#D2C2A3",
                                    }}
                                  >
                                    Titular
                                  </div>
                                )}
                              </div>

                              {/* PHONE */}

                              <div
                                style={{
                                  fontSize:
                                    "0.84rem",
                                  color:
                                    "var(--color-text-secondary)",
                                }}
                              >
                                {person.phone ||
                                  "—"}
                              </div>

                              {/* EXPERIENCE + STATUS */}

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                  minWidth: 0,
                                }}
                              >
                                {experiences.length > 0 ? (
                                  experiences.map(
                                    (experience) => (
                                      <div
                                        key={experience.id}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: "8px",
                                          minWidth: 0,
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "0.84rem",
                                            lineHeight: 1.35,
                                            color:
                                              "var(--color-text-secondary)",
                                          }}
                                        >
                                          {experience.name}
                                        </span>

                                        <span
                                          style={{
                                            flexShrink: 0,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            minHeight: "24px",
                                            padding: "0 8px",
                                            borderRadius: "999px",
                                            background:
                                              getStatusBackgroundByValue(
                                                experience.status
                                              ),
                                            color:
                                              getStatusColorByValue(
                                                experience.status
                                              ),
                                            fontSize: "0.68rem",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {getStatusLabelByValue(
                                            experience.status
                                          )}
                                        </span>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.84rem",
                                      color:
                                        "var(--color-text-secondary)",
                                    }}
                                  >
                                    Sin experiencia
                                  </span>
                                )}
                              </div>

                              {/* STATUS SUMMARY */}

                              <div>
                                {experiences.length > 0 ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      minHeight: "28px",
                                      padding: "0 10px",
                                      borderRadius: "999px",
                                      background:
                                        getPersonOverallStatusBackground(
                                          experiences
                                        ),
                                      color:
                                        getPersonOverallStatusColor(
                                          experiences
                                        ),
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {getPersonOverallStatusLabel(
                                      experiences
                                    )}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      minHeight: "28px",
                                      padding: "0 10px",
                                      borderRadius: "999px",
                                      background: "#F4F0E8",
                                      color: "#8A806E",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        }
                      )}

                      {filteredPeople.length ===
                        0 && (
                        <div
                          style={{
                            padding:
                              "40px 20px",
                            textAlign:
                              "center",
                            fontSize:
                              "0.9rem",
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          No encontramos
                          personas con los
                          filtros seleccionados.
                        </div>
                      )}
                    </div>

                    {/* IMPORT */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: "20px",
                        marginTop:
                          "22px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            "0.82rem",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        Las experiencias y
                        el estado de
                        confirmación se
                        conservarán al
                        importar.
                      </p>

                      <button
                        type="button"
                        disabled={
                          selectedPeople.length ===
                          0
                        }
                        onClick={() => {
                          if (
                            selectedPeople.length ===
                            0
                          )
                            return;

                          alert(
                            `${selectedPeople.length} personas listas para importar a COMUNICA.`
                          );
                        }}
                        style={{
                          minHeight:
                            "48px",
                          padding:
                            "0 25px",
                          border:
                            "none",
                          borderRadius:
                            "999px",
                          background:
                            selectedPeople.length >
                            0
                              ? "var(--color-primary)"
                              : "#D9D5CC",
                          color:
                            "#FFFFFF",
                          fontSize:
                            "0.92rem",
                          fontWeight:
                            500,
                          cursor:
                            selectedPeople.length >
                            0
                              ? "pointer"
                              : "not-allowed",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        Importar{" "}
                        {
                          selectedPeople.length
                        }{" "}
                        personas
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* FILE FLOW                                                        */}
        {/* ---------------------------------------------------------------- */}

        {source === "archivo" && (
          <>
            <section
              style={{
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "28px",
                padding:
                  "30px 34px",
                marginBottom:
                  "22px",
              }}
            >
              <div style={stepLabelStyle}>
                Paso 2
              </div>

              <h2 style={sectionTitleStyle}>
                Selecciona el evento
              </h2>

              <label
                htmlFor="event"
                style={labelStyle}
              >
                Evento{" "}
                <span
                  style={{
                    color: "#D2C2A3",
                  }}
                >
                  *
                </span>
              </label>

              <select
                id="event"
                value={event}
                onChange={(e) =>
                  setEvent(e.target.value)
                }
                style={inputStyle}
              >
                <option value="">
                  Selecciona un evento
                </option>

                {events.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  setShowNewEvent(
                    (current) =>
                      !current
                  )
                }
                style={{
                  marginTop: "10px",
                  padding: 0,
                  border: "none",
                  background:
                    "transparent",
                  color: "#D2C2A3",
                  fontSize:
                    "0.88rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                + Crear nuevo evento
              </button>

              {showNewEvent && (
                <div
                  style={{
                    marginTop:
                      "16px",
                    padding:
                      "20px",
                    borderRadius:
                      "18px",
                    background:
                      "#FBF9F4",
                    border:
                      "1px solid var(--color-border)",
                  }}
                >
                  <label
                    htmlFor="new-event"
                    style={
                      labelStyle
                    }
                  >
                    Nombre del evento
                  </label>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "10px",
                    }}
                  >
                    <input
                      id="new-event"
                      type="text"
                      value={
                        newEventName
                      }
                      onChange={(e) =>
                        setNewEventName(
                          e.target
                            .value
                        )
                      }
                      placeholder="Ej. Boda Laura & Juan"
                      style={{
                        ...inputStyle,
                        flex: 1,
                      }}
                    />

                    <button
                      type="button"
                      disabled={
                        !canCreateEvent
                      }
                      onClick={
                        handleCreateEvent
                      }
                      style={{
                        height:
                          "48px",
                        padding:
                          "0 20px",
                        border:
                          "none",
                        borderRadius:
                          "999px",
                        background:
                          canCreateEvent
                            ? "var(--color-primary)"
                            : "#D9D5CC",
                        color:
                          "#FFFFFF",
                        fontSize:
                          "0.9rem",
                        fontWeight:
                          500,
                        cursor:
                          canCreateEvent
                            ? "pointer"
                            : "not-allowed",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      Crear evento
                    </button>
                  </div>
                </div>
              )}
            </section>

            {event && (
              <section
                style={{
                  background:
                    "var(--color-surface)",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius:
                    "28px",
                  padding:
                    "30px 34px",
                }}
              >
                <div style={stepLabelStyle}>
                  Paso 3
                </div>

                <h2
                  style={
                    sectionTitleStyle
                  }
                >
                  Subir archivo
                </h2>

                <p
                  style={{
                    maxWidth:
                      "620px",
                    margin:
                      "0 0 20px",
                    fontSize:
                      "0.94rem",
                    lineHeight:
                      1.65,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Usa la plantilla de
                  COMUNICA para importar
                  las personas de este
                  evento.
                </p>

                <div
                  style={{
                    padding:
                      "18px 20px",
                    borderRadius:
                      "16px",
                    background:
                      "#FBF9F4",
                    border:
                      "1px solid #EEE7DA",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "0.9rem",
                      fontWeight:
                        500,
                      color:
                        "var(--color-text)",
                    }}
                  >
                    Plantilla de
                    importación
                  </div>

                  <div
                    style={{
                      marginTop:
                        "4px",
                      fontSize:
                        "0.8rem",
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    Nombre · Teléfono ·
                    Titular · Experiencia ·
                    Estado de confirmación
                  </div>
                </div>

                <label
                  htmlFor="people-file"
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    minHeight:
                      "190px",
                    marginTop:
                      "20px",
                    padding:
                      "30px",
                    border:
                      "1px dashed #D2C2A3",
                    borderRadius:
                      "20px",
                    background:
                      "#FCFAF6",
                    cursor:
                      "pointer",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={
                      iconCircleStyle
                    }
                  >
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D2C2A3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M5 20h14" />
                    </svg>
                  </div>

                  <strong
                    style={{
                      fontSize:
                        "0.94rem",
                      fontWeight:
                        500,
                      color:
                        "var(--color-text)",
                    }}
                  >
                    {fileName ||
                      "Selecciona tu archivo Excel"}
                  </strong>

                  <span
                    style={{
                      marginTop:
                        "6px",
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    .xlsx
                  </span>

                  <input
                    id="people-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={
                      handleFileChange
                    }
                    style={{
                      display:
                        "none",
                    }}
                  />
                </label>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    marginTop:
                      "22px",
                  }}
                >
                  <button
                    type="button"
                    disabled={
                      !fileName
                    }
                    onClick={() => {
                      if (!fileName)
                        return;

                      alert(
                        "El archivo está listo para importar. La conexión real se agregará después."
                      );
                    }}
                    style={{
                      minHeight:
                        "48px",
                      padding:
                        "0 25px",
                      border:
                        "none",
                      borderRadius:
                        "999px",
                      background:
                        fileName
                          ? "var(--color-primary)"
                          : "#D9D5CC",
                      color:
                        "#FFFFFF",
                      fontSize:
                        "0.92rem",
                      fontWeight:
                        500,
                      cursor:
                        fileName
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    Importar personas
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function getNormalizedStatus(
  status: string | null,
  attending: boolean | null
) {
  if (attending === true) {
    return "confirmed";
  }

  if (attending === false) {
    return "declined";
  }

  if (status === "confirmed") {
    return "confirmed";
  }

  if (status === "declined") {
    return "declined";
  }

  return "pending";
}

function getStatusLabel(
  status: string | null,
  attending: boolean | null
) {
  const normalized = getNormalizedStatus(
    status,
    attending
  );

  if (normalized === "confirmed") {
    return "Confirmado";
  }

  if (normalized === "declined") {
    return "No asistirá";
  }

  return "Pendiente";
}

function getStatusLabelByValue(
  status: Experience["status"]
) {
  if (status === "confirmed") {
    return "Confirmada";
  }

  if (status === "declined") {
    return "No asistirá";
  }

  return "Pendiente";
}

function getStatusColorByValue(
  status: Experience["status"]
) {
  if (status === "confirmed") {
    return "#6F806B";
  }

  if (status === "declined") {
    return "#9A7770";
  }

  return "#8A806E";
}

function getStatusBackgroundByValue(
  status: Experience["status"]
) {
  if (status === "confirmed") {
    return "#EEF3EB";
  }

  if (status === "declined") {
    return "#F5ECE9";
  }

  return "#F4F0E8";
}

function getPersonOverallStatusLabel(
  experiences: Experience[]
) {
  const confirmed = experiences.filter(
    (experience) =>
      experience.status === "confirmed"
  ).length;

  const pending = experiences.filter(
    (experience) =>
      experience.status === "pending"
  ).length;

  if (
    confirmed === experiences.length &&
    experiences.length > 0
  ) {
    return "Confirmado";
  }

  if (
    confirmed === 0 &&
    pending === 0 &&
    experiences.length > 0
  ) {
    return "No asistirá";
  }

  if (confirmed > 0) {
    return "Parcial";
  }

  return "Pendiente";
}

function getPersonOverallStatusColor(
  experiences: Experience[]
) {
  const label =
    getPersonOverallStatusLabel(experiences);

  if (label === "Confirmado") {
    return "#6F806B";
  }

  if (label === "No asistirá") {
    return "#9A7770";
  }

  return "#8A806E";
}

function getPersonOverallStatusBackground(
  experiences: Experience[]
) {
  const label =
    getPersonOverallStatusLabel(experiences);

  if (label === "Confirmado") {
    return "#EEF3EB";
  }

  if (label === "No asistirá") {
    return "#F5ECE9";
  }

  if (label === "Parcial") {
    return "#F2EFE5";
  }

  return "#F4F0E8";
}

function getStatusColor(
  status: string | null,
  attending: boolean | null
) {
  const normalized = getNormalizedStatus(
    status,
    attending
  );

  if (normalized === "confirmed") {
    return "#6F806B";
  }

  if (normalized === "declined") {
    return "#9A7770";
  }

  return "#8A806E";
}

function getStatusBackground(
  status: string | null,
  attending: boolean | null
) {
  const normalized = getNormalizedStatus(
    status,
    attending
  );

  if (normalized === "confirmed") {
    return "#EEF3EB";
  }

  if (normalized === "declined") {
    return "#F5ECE9";
  }

  return "#F4F0E8";
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const stepLabelStyle = {
  marginBottom: "6px",
  fontSize: "0.76rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--color-text-secondary)",
};

const sectionTitleStyle = {
  margin: "4px 0 22px",
  fontFamily: "var(--font-display)",
  fontSize: "1.8rem",
  fontWeight: 500,
  color: "var(--color-text)",
};

const cardTitleStyle = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: "1.55rem",
  fontWeight: 500,
  color: "var(--color-text)",
};

const cardTextStyle = {
  margin: "9px 0 0",
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "var(--color-text-secondary)",
};

const iconCircleStyle = {
  width: "52px",
  height: "52px",
  marginBottom: "18px",
  borderRadius: "50%",
  background: "#F7F3EB",
  border: "1px solid #EEE7DA",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelStyle = {
  display: "block",
  marginBottom: "9px",
  fontSize: "0.76rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--color-text-secondary)",
};

const filterLabelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "0.72rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--color-text-secondary)",
};

const inputStyle = {
  width: "100%",
  height: "48px",
  boxSizing: "border-box" as const,
  padding: "0 15px",
  borderRadius: "12px",
  border: "1px solid var(--color-border)",
  background: "#FFFFFF",
  color: "var(--color-text)",
  fontSize: "0.94rem",
  outline: "none",
};

const filterSelectStyle = {
  width: "100%",
  height: "44px",
  boxSizing: "border-box" as const,
  padding: "0 12px",
  borderRadius: "10px",
  border: "1px solid var(--color-border)",
  background: "#FFFFFF",
  color: "var(--color-text)",
  fontSize: "0.88rem",
  outline: "none",
};

const loadingStyle = {
  padding: "28px 20px",
  textAlign: "center" as const,
  fontSize: "0.9rem",
  color: "var(--color-text-secondary)",
};

const emptyStyle = {
  padding: "24px 20px",
  borderRadius: "16px",
  background: "#FBF9F4",
  border: "1px solid #EEE7DA",
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "var(--color-text-secondary)",
};