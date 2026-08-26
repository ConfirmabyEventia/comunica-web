"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "@/components/studio/Sidebar";

type CommunicationType =
  | "general"
  | "table"
  | "details"
  | "confirma"
  | null;

const communicationTypes = [
  {
    id: "general" as const,
    title: "Información general",
    description:
      "Comparte información importante con tus invitados.",
    detail:
      "Ideal para horarios, ubicaciones, recomendaciones y novedades.",
    icon: "message",
  },
  {
    id: "table" as const,
    title: "Asignación de mesa",
    description:
      "Comunica a cada invitado la información de su mesa.",
    detail:
      "Cada persona recibirá un enlace personalizado con su asignación.",
    icon: "table",
  },
  {
    id: "details" as const,
    title: "Detalles importantes",
    description:
      "Comparte información específica que tus invitados necesitan conocer.",
    detail:
      "Puedes incluir texto, imágenes y otros detalles del evento.",
    icon: "info",
  },
  {
    id: "confirma" as const,
    title: "Desde CONFIRMA",
    description:
      "Utiliza información existente de una celebración en CONFIRMA.",
    detail:
      "Esta opción estará disponible cuando conectemos ambos servicios.",
    icon: "copy",
  },
];

function CommunicationIcon({
  type,
  active,
}: {
  type: string;
  active: boolean;
}) {
  const stroke = active
    ? "var(--color-accent)"
    : "var(--color-text-secondary)";

  if (type === "table") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="7.5" />
        <path d="M8.5 9.5h7" />
        <path d="M8.5 12h7" />
        <path d="M8.5 14.5h7" />
      </svg>
    );
  }

  if (type === "info") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 10.5v5" />
        <path d="M12 7.5h.01" />
      </svg>
    );
  }

  if (type === "copy") {
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="8" y="8" width="10" height="10" rx="2" />
        <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
      </svg>
    );
  }

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export default function NewCommunicationPage() {
  const [selectedType, setSelectedType] =
    useState<CommunicationType>(null);

  const selectedCommunication =
    communicationTypes.find(
      (item) => item.id === selectedType
    );

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
            maxWidth: "1120px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              marginBottom: "42px",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--color-text-secondary)",
                fontSize: "0.9rem",
                marginBottom: "28px",
              }}
            >
              <span>←</span>
              Volver al dashboard
            </Link>

            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              Nueva comunicación
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
              ¿Qué quieres comunicar?
            </h1>

            <p
              style={{
                maxWidth: "620px",
                margin: "14px 0 0",
                fontSize: "1.02rem",
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
              }}
            >
              Selecciona el tipo de comunicación que quieres
              crear para tus invitados.
            </p>
          </div>

          {/* TYPES */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "20px",
            }}
          >
            {communicationTypes.map((item) => {
              const isSelected =
                selectedType === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedType(item.id)
                  }
                  style={{
                    textAlign: "left",
                    border: isSelected
                      ? "1.5px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                    borderRadius: "28px",
                    background: isSelected
                      ? "#FBF8F1"
                      : "var(--color-surface)",
                    padding: "30px",
                    minHeight: "210px",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 8px 24px rgba(189, 170, 130, 0.10)"
                      : "none",
                    transition:
                      "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: "58px",
                      height: "58px",
                      borderRadius: "50%",
                      background: isSelected
                        ? "#F2EBDD"
                        : "#F8F5EF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "22px",
                    }}
                  >
                    <CommunicationIcon
                      type={item.icon}
                      active={isSelected}
                    />
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontFamily:
                        "var(--font-display)",
                      fontSize: "1.8rem",
                      fontWeight: 500,
                      color: "var(--color-text)",
                    }}
                  >
                    {item.title}
                  </h2>

                  <p
                    style={{
                      margin:
                        "9px 0 0",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    {item.description}
                  </p>

                  <p
                    style={{
                      margin:
                        "10px 0 0",
                      fontSize: "0.84rem",
                      lineHeight: 1.5,
                      color:
                        "var(--color-text-muted)",
                    }}
                  >
                    {item.detail}
                  </p>
                </button>
              );
            })}
          </section>

          {/* CONTINUE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "34px",
              paddingTop: "28px",
              borderTop:
                "1px solid var(--color-border)",
            }}
          >
            <div>
              {selectedCommunication && (
                <p
                  style={{
                    margin: 0,
                    color:
                      "var(--color-text-secondary)",
                    fontSize: "0.92rem",
                  }}
                >
                  Seleccionaste:{" "}
                  <strong
                    style={{
                      color:
                        "var(--color-text)",
                      fontWeight: 500,
                    }}
                  >
                    {
                      selectedCommunication.title
                    }
                  </strong>
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!selectedType}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "14px 28px",
                background: selectedType
                  ? "var(--color-primary)"
                  : "#E8E3D9",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: selectedType
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              Continuar →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}