"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewPersonPage() {
  const [event, setEvent] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [titular, setTitular] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("");

  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");

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

  const canSave =
    event.trim() !== "" &&
    name.trim() !== "" &&
    phone.trim() !== "";

  const canCreateEvent = newEventName.trim() !== "";

  function handleCreateEvent() {
    if (!canCreateEvent) return;

    const newEvent = {
      id: `event-${Date.now()}`,
      name: newEventName.trim(),
    };

    setEvents((currentEvents) => [...currentEvents, newEvent]);
    setEvent(newEvent.id);
    setNewEventName("");
    setShowNewEvent(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background)",
      }}
    >
      <main
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "18px 46px 70px",
        }}
      >
        {/* BACK TO PEOPLE */}

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
              fontFamily: "var(--font-display)",
              fontSize: "3.35rem",
              fontWeight: 500,
              lineHeight: 1.05,
              color: "var(--color-text)",
            }}
          >
            Agregar persona
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
            Añade una persona a un evento y completa la información que
            utilizarás para tus comunicaciones.
          </p>
        </section>

        {/* FORM */}

        <section
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "28px",
            padding: "34px",
          }}
        >
          {/* EVENT */}

          <div style={{ marginBottom: "28px" }}>
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
              Evento{" "}
              <span style={{ color: "#D2C2A3" }}>*</span>
            </label>

            <select
              id="event"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              style={inputStyle}
            >
              <option value="">Selecciona un evento</option>

              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowNewEvent((current) => !current)}
              style={{
                marginTop: "10px",
                padding: 0,
                border: "none",
                background: "transparent",
                color: "#D2C2A3",
                fontSize: "0.88rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              + Crear nuevo evento
            </button>

            {/* NEW EVENT */}

            {showNewEvent && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "20px",
                  borderRadius: "18px",
                  background: "#FBF9F4",
                  border: "1px solid var(--color-border)",
                }}
              >
                <label
                  htmlFor="new-event"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.76rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Nombre del evento
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <input
                    id="new-event"
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    placeholder="Ej. Boda Laura & Juan"
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                  />

                  <button
                    type="button"
                    disabled={!canCreateEvent}
                    onClick={handleCreateEvent}
                    style={{
                      height: "48px",
                      padding: "0 20px",
                      border: "none",
                      borderRadius: "999px",
                      background: canCreateEvent
                        ? "var(--color-primary)"
                        : "#D9D5CC",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      cursor: canCreateEvent
                        ? "pointer"
                        : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Crear evento
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NAME + PHONE */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: "18px",
              marginBottom: "26px",
            }}
          >
            <div>
              <label htmlFor="name" style={labelStyle}>
                Nombre{" "}
                <span style={{ color: "#D2C2A3" }}>*</span>
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="phone" style={labelStyle}>
                Teléfono{" "}
                <span style={{ color: "#D2C2A3" }}>*</span>
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Número de teléfono"
                style={inputStyle}
              />
            </div>
          </div>

          {/* TITULAR */}

          <div style={{ marginBottom: "26px" }}>
            <label htmlFor="titular" style={labelStyle}>
              Titular{" "}
              <span style={optionalStyle}>(opcional)</span>
            </label>

            <input
              id="titular"
              type="text"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              placeholder="Nombre del titular"
              style={inputStyle}
            />

            <p style={helperStyle}>
              Si esta persona pertenece a una invitación de un titular,
              puedes indicarlo aquí.
            </p>
          </div>

          {/* EXPERIENCE */}

          <div style={{ marginBottom: "26px" }}>
            <label htmlFor="experience" style={labelStyle}>
              Experiencia{" "}
              <span style={optionalStyle}>(opcional)</span>
            </label>

            <select
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={inputStyle}
            >
              <option value="">Sin experiencia asignada</option>
              <option value="preboda">Preboda</option>
              <option value="boda">Boda</option>
              <option value="brunch">Brunch</option>
            </select>

            <p style={helperStyle}>
              Puedes dejar este campo vacío si la persona no pertenece a una
              experiencia específica.
            </p>
          </div>

          {/* STATUS */}

          <div>
            <label style={labelStyle}>
              Estado de confirmación{" "}
              <span style={optionalStyle}>(opcional)</span>
            </label>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "11px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  minHeight: "48px",
                  padding: "0 17px",
                  borderRadius: "14px",
                  border: `1px solid ${
                    status === "confirmado"
                      ? "var(--color-primary)"
                      : "var(--color-border)"
                  }`,
                  background:
                    status === "confirmado"
                      ? "#FBF9F4"
                      : "var(--color-surface)",
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  color: "var(--color-text)",
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value="confirmado"
                  checked={status === "confirmado"}
                  onChange={(e) => setStatus(e.target.value)}
                />

                Confirmado
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  minHeight: "48px",
                  padding: "0 17px",
                  borderRadius: "14px",
                  border: `1px solid ${
                    status === "pendiente"
                      ? "var(--color-primary)"
                      : "var(--color-border)"
                  }`,
                  background:
                    status === "pendiente"
                      ? "#FBF9F4"
                      : "var(--color-surface)",
                  cursor: "pointer",
                  fontSize: "0.92rem",
                  color: "var(--color-text)",
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value="pendiente"
                  checked={status === "pendiente"}
                  onChange={(e) => setStatus(e.target.value)}
                />

                Pendiente
              </label>

              {status !== "" && (
                <button
                  type="button"
                  onClick={() => setStatus("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    padding: "0 4px",
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>

            <p style={helperStyle}>
              También puedes dejar el estado sin definir.
            </p>
          </div>

          {/* REQUIRED NOTE */}

          <div
            style={{
              marginTop: "28px",
              paddingTop: "22px",
              borderTop: "1px solid var(--color-border)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <span style={{ color: "#D2C2A3" }}>*</span>{" "}
            Campos obligatorios
          </div>
        </section>

        {/* ACTIONS */}

        <section
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <Link
            href="/dashboard/people"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              padding: "0 22px",
              borderRadius: "999px",
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: "0.92rem",
              textDecoration: "none",
            }}
          >
            Cancelar
          </Link>

          <button
            type="button"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;

              alert("La persona está lista para guardar.");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              padding: "0 25px",
              borderRadius: "999px",
              border: "none",
              background: canSave
                ? "var(--color-primary)"
                : "#D9D5CC",
              color: "#FFFFFF",
              fontSize: "0.92rem",
              fontWeight: 500,
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            Guardar persona
          </button>
        </section>
      </main>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "9px",
  fontSize: "0.76rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--color-text-secondary)",
};

const optionalStyle = {
  textTransform: "none" as const,
  letterSpacing: "normal",
  fontSize: "0.78rem",
  color: "var(--color-text-secondary)",
};

const helperStyle = {
  margin: "8px 0 0",
  fontSize: "0.82rem",
  lineHeight: 1.5,
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