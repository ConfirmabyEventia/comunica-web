"use client";

import Sidebar from "@/components/studio/Sidebar";
import * as XLSX from "xlsx";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
type TableRow = {
  Group: string;
  "Principal Contact": number | string;
  "Full Name": string;
  Phone: string;
  Table: string;
};

type ValidationIssue = {
  type: "error" | "warning";
  message: string;
};

const REQUIRED_COLUMNS = [
  "Group",
  "Principal Contact",
  "Full Name",
  "Phone",
  "Table",
];

const MESSAGE_VARIABLES = {
  titular: "{{nombre_titular}}",
  mesas: "{{asignacion_mesas}}",
  evento: "{{nombre_evento}}",
} as const;

const COLOR_PALETTES = [
  {
    name: "Salvia",
    accent: "#A7A98A",
    soft: "#EEF0E7",
    text: "#4F5142",
  },
  {
    name: "Lavanda",
    accent: "#9A86A8",
    soft: "#F0EBF4",
    text: "#574D5E",
  },
  {
    name: "Terracota",
    accent: "#B77A65",
    soft: "#F5E9E4",
    text: "#654B42",
  },
  {
    name: "Arena",
    accent: "#B39A72",
    soft: "#F5F0E6",
    text: "#5F5444",
  },
  {
    name: "Azul Niebla",
    accent: "#8197A5",
    soft: "#EAF0F3",
    text: "#485760",
  },
  {
    name: "Vino",
    accent: "#8D5964",
    soft: "#F2E8EA",
    text: "#5A4148",
  },
] as const;

const MESSAGE_FONTS = [
  {
    name: "Editorial",
    value: "'Cormorant Garamond', Georgia, serif",
  },
  {
    name: "Clásica",
    value: "Georgia, 'Times New Roman', serif",
  },
  {
  name: "Contemporánea",
  value: "Montserrat, Arial, Helvetica, sans-serif",
},
 {
  name: "Suave",
  value: "'Trebuchet MS', Arial, sans-serif",
},
] as const;

const DEFAULT_MESSAGE_HTML = `
<p>Hola, <span data-variable="titular" contenteditable="false">{{nombre_titular}}</span> 🤍</p>
<p>¡Ya falta muy poco para celebrar juntos!</p>
<p>Queremos compartir contigo la ubicación de cada integrante de tu <strong>grupo familiar</strong>.</p>
<p><strong>Grupo familiar</strong></p>
<div><span data-variable="mesas" contenteditable="false">{{asignacion_mesas}}</span></div>
<p>Cada persona tiene una mesa asignada, así que te recomendamos revisar la información con atención.</p>
<p>Estamos felices de recibirlos y esperamos que disfruten muchísimo este momento con nosotros. ✨</p>
<p><strong>Nos vemos muy pronto.</strong></p>
<p>Con cariño,<br /><strong><span data-variable="evento" contenteditable="false">{{nombre_evento}}</span></strong></p>
`;


export default function TablesPage() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventCreated, setEventCreated] =
    useState(false);

  const [fileName, setFileName] = useState("");

  const [rows, setRows] =
    useState<TableRow[]>([]);

  const [issues, setIssues] =
    useState<ValidationIssue[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [fileInputKey, setFileInputKey] =
    useState(0);

  const [continued, setContinued] =
    useState(false);

  const [communicationApproved, setCommunicationApproved] =
    useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [messageHtml, setMessageHtml] =
    useState(DEFAULT_MESSAGE_HTML);

  const [selectedPalette, setSelectedPalette] =
    useState("Salvia");

  const [selectedFont, setSelectedFont] =
    useState("Editorial");
useEffect(() => {
  if (!continued) return;

  if (
    editorRef.current &&
    editorRef.current.innerHTML.trim() === ""
  ) {
    editorRef.current.innerHTML =
      DEFAULT_MESSAGE_HTML;
  }
}, [continued]);

  const groups = useMemo(() => {
    return new Set(
      rows
        .map((row) =>
          String(row.Group || "").trim()
        )
        .filter(Boolean)
    );
  }, [rows]);

  const principals = useMemo(() => {
    return rows.filter(
      (row) =>
        Number(
          row["Principal Contact"]
        ) === 1
    );
  }, [rows]);

  const companions = useMemo(() => {
    return rows.filter(
      (row) =>
        Number(
          row["Principal Contact"]
        ) === 0
    );
  }, [rows]);

  const firstPrincipal =
    principals[0];

  const firstGroupRows = useMemo(() => {
    if (!firstPrincipal) return [];

    const firstGroup =
      firstPrincipal.Group.trim();

    return rows.filter(
      (row) =>
        row.Group.trim() === firstGroup
    );
  }, [rows, firstPrincipal]);

  const firstGroupAssignment =
    firstGroupRows
      .map((row) => {
        const name =
          row["Full Name"].trim();

        const table =
          row.Table.trim();

        if (!name) return "";

        if (!table) {
          return `${name} — Mesa pendiente`;
        }

        return `${name} — ${table}`;
      })
      .filter(Boolean)
      .join("\n");

  const handleCreateEvent = () => {
    setError("");
    setContinued(false);
    setCommunicationApproved(false);
    setMessageHtml(DEFAULT_MESSAGE_HTML);
    setSelectedPalette("Salvia");
    setSelectedFont("Editorial");

    if (!eventName.trim()) {
      setError(
        "Escribe el nombre de la celebración."
      );
      return;
    }

    setEventCreated(true);
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setIssues([]);
    setRows([]);
    setFileName(file.name);
    setContinued(false);
    setCommunicationApproved(false);
    setMessageHtml(DEFAULT_MESSAGE_HTML);
    setSelectedPalette("Salvia");
    setSelectedFont("Editorial");
    setLoading(true);

    try {
      const buffer =
        await file.arrayBuffer();

      const workbook =
        XLSX.read(buffer, {
          type: "array",
        });

      if (
        !workbook.SheetNames.length
      ) {
        throw new Error(
          "El archivo no contiene ninguna hoja."
        );
      }

      const firstSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rawRows =
        XLSX.utils.sheet_to_json<
          Record<string, unknown>
        >(firstSheet, {
          defval: "",
          raw: false,
        });

      if (!rawRows.length) {
        throw new Error(
          "El archivo está vacío."
        );
      }

      const columns =
        Object.keys(rawRows[0]);

      const missingColumns =
        REQUIRED_COLUMNS.filter(
          (column) =>
            !columns.includes(column)
        );

      if (missingColumns.length) {
        throw new Error(
          `Faltan columnas obligatorias: ${missingColumns.join(
            ", "
          )}`
        );
      }

      const normalizedRows: TableRow[] =
        rawRows.map((row) => ({
          Group: String(
            row["Group"] ?? ""
          ).trim(),

          "Principal Contact":
            String(
              row["Principal Contact"] ??
                ""
            ).trim(),

          "Full Name": String(
            row["Full Name"] ?? ""
          ).trim(),

          Phone: String(
            row["Phone"] ?? ""
          ).trim(),

          Table: String(
            row["Table"] ?? ""
          ).trim(),
        }));

      const validationIssues =
        validateRows(
          normalizedRows
        );

      setRows(normalizedRows);
      setIssues(validationIssues);
    } catch (err) {
      console.error(
        "Error leyendo Excel:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible leer el archivo."
      );

      setFileName("");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFile = () => {
    setFileName("");
    setRows([]);
    setIssues([]);
    setError("");
    setContinued(false);
    setCommunicationApproved(false);

    setFileInputKey(
      (value) => value + 1
    );
  };

  const resetEvent = () => {
    setEventName("");
    setEventDate("");
    setEventCreated(false);
    setContinued(false);
    setCommunicationApproved(false);
    resetFile();
  };

  const handleContinue = () => {
    if (errorCount > 0) {
      return;
    }

    setContinued(true);
    setCommunicationApproved(false);
  };

  const handleMessageInput = (
    event: React.FormEvent<HTMLDivElement>
  ) => {
    setMessageHtml(event.currentTarget.innerHTML);
  };

  const handleMessageKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    const target = event.target as HTMLElement;

    if (
      target.closest("[data-variable]") &&
      (event.key === "Backspace" ||
        event.key === "Delete")
    ) {
      event.preventDefault();
    }
  };

  const formatMessage = (command: "bold" | "italic") => {
    document.execCommand(command, false);
    const editor = document.getElementById(
      "communication-editor"
    );

    if (editor) {
      setMessageHtml(editor.innerHTML);
    }
  };

  const handleApproveCommunication = () => {
    setCommunicationApproved(true);
  };

  const errorCount =
    issues.filter(
      (issue) =>
        issue.type === "error"
    ).length;

  const warningCount =
    issues.filter(
      (issue) =>
        issue.type === "warning"
    ).length;

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
          padding: "52px 56px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              marginBottom: "38px",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "10px",
                fontFamily:
                  "var(--font-body)",
                fontSize: "0.75rem",
                letterSpacing:
                  "0.18em",
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
                margin: 0,
                fontFamily:
                  "var(--font-display)",
                fontSize: "3rem",
                lineHeight: 1,
                fontWeight: 500,
                color:
                  "var(--color-text)",
                letterSpacing:
                  "-0.025em",
              }}
            >
              Mesas
            </h1>

            <p
              style={{
                marginTop: "16px",
                marginBottom: 0,
                maxWidth: "680px",
                fontFamily:
                  "var(--font-body)",
                fontSize: "1rem",
                lineHeight: 1.7,
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Carga la asignación de mesas
              para generar posteriormente
              los códigos personalizados
              de cada grupo.
            </p>
          </div>

          {/* EVENT CARD */}

          {!eventCreated ? (
            <section
              style={{
                background: "#FFFFFF",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "24px",
                padding: "34px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  marginBottom: "28px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-body)",
                    fontSize: "0.7rem",
                    letterSpacing:
                      "0.14em",
                    textTransform:
                      "uppercase",
                    color:
                      "var(--color-accent)",
                  }}
                >
                  Paso 1
                </p>

                <h2
                  style={{
                    margin:
                      "7px 0 0",
                    fontFamily:
                      "var(--font-display)",
                    fontSize: "1.8rem",
                    fontWeight: 500,
                    color:
                      "var(--color-text)",
                  }}
                >
                  Crear evento
                </h2>

                <p
                  style={{
                    margin:
                      "9px 0 0",
                    maxWidth: "620px",
                    fontFamily:
                      "var(--font-body)",
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Indica para qué celebración
                  estás preparando la
                  asignación de mesas.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1.5fr) minmax(180px, 0.7fr)",
                  gap: "18px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontFamily:
                        "var(--font-body)",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color:
                        "var(--color-text)",
                    }}
                  >
                    Nombre de la celebración
                  </label>

                  <input
                    type="text"
                    value={eventName}
                    onChange={(event) =>
                      setEventName(
                        event.target.value
                      )
                    }
                    placeholder="Ej. Boda Camila & Andrés"
                    style={{
                      width: "100%",
                      height: "48px",
                      padding:
                        "0 15px",
                      boxSizing:
                        "border-box",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius:
                        "14px",
                      background:
                        "#FFFFFF",
                      fontFamily:
                        "var(--font-body)",
                      fontSize: "0.9rem",
                      color:
                        "var(--color-text)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontFamily:
                        "var(--font-body)",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      color:
                        "var(--color-text)",
                    }}
                  >
                    Fecha del evento
                  </label>

                  <input
                    type="date"
                    value={eventDate}
                    onChange={(event) =>
                      setEventDate(
                        event.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      height: "48px",
                      padding:
                        "0 15px",
                      boxSizing:
                        "border-box",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius:
                        "14px",
                      background:
                        "#FFFFFF",
                      fontFamily:
                        "var(--font-body)",
                      fontSize: "0.9rem",
                      color:
                        "var(--color-text)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  justifyContent:
                    "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleCreateEvent
                  }
                  style={{
                    minHeight: "46px",
                    padding:
                      "0 22px",
                    border: "none",
                    borderRadius:
                      "999px",
                    background:
                      "var(--color-primary)",
                    color: "#FFFFFF",
                    fontFamily:
                      "var(--font-body)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Crear evento
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* EVENT SUMMARY */}

              <section
                style={{
                  background: "#FFFFFF",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "20px",
                  padding:
                    "18px 22px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.68rem",
                      letterSpacing:
                        "0.14em",
                      textTransform:
                        "uppercase",
                      color:
                        "var(--color-accent)",
                    }}
                  >
                    Evento
                  </p>

                  <h2
                    style={{
                      margin:
                        "5px 0 0",
                      fontFamily:
                        "var(--font-display)",
                      fontSize:
                        "1.55rem",
                      fontWeight: 500,
                      color:
                        "var(--color-text)",
                    }}
                  >
                    {eventName}
                  </h2>

                  {eventDate && (
                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        fontSize:
                          "0.84rem",
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      {new Date(
                        `${eventDate}T12:00:00`
                      ).toLocaleDateString(
                        "es-CO",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    resetEvent
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color:
                      "var(--color-text-secondary)",
                    fontFamily:
                      "var(--font-body)",
                    fontSize:
                      "0.82rem",
                    cursor:
                      "pointer",
                  }}
                >
                  Cambiar evento
                </button>
              </section>

              {/* UPLOAD CARD */}

              <section
                style={{
                  background: "#FFFFFF",
                  border:
                    "1px solid var(--color-border)",
                  borderRadius: "24px",
                  padding: "34px",
                  marginBottom:
                    "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "24px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily:
                          "var(--font-body)",
                        fontSize:
                          "0.7rem",
                        letterSpacing:
                          "0.14em",
                        textTransform:
                          "uppercase",
                        color:
                          "var(--color-accent)",
                      }}
                    >
                      Paso 2
                    </p>

                    <h2
                      style={{
                        margin:
                          "7px 0 0",
                        fontFamily:
                          "var(--font-display)",
                        fontSize:
                          "1.8rem",
                        fontWeight: 500,
                        color:
                          "var(--color-text)",
                      }}
                    >
                      Cargar archivo
                    </h2>

                    <p
                      style={{
                        margin:
                          "9px 0 0",
                        maxWidth:
                          "620px",
                        fontFamily:
                          "var(--font-body)",
                        fontSize:
                          "0.92rem",
                        lineHeight:
                          1.6,
                        color:
                          "var(--color-text-secondary)",
                      }}
                    >
                      El Excel debe contener
                      las columnas Group,
                      Principal Contact,
                      Full Name, Phone y
                      Table.
                    </p>
                  </div>

                  <label
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      minHeight:
                        "46px",
                      padding:
                        "0 20px",
                      borderRadius:
                        "999px",
                      background:
                        "var(--color-primary)",
                      color:
                        "#FFFFFF",
                      fontFamily:
                        "var(--font-body)",
                      fontSize:
                        "0.9rem",
                      fontWeight:
                        500,
                      cursor:
                        "pointer",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {loading
                      ? "Leyendo..."
                      : "Seleccionar Excel"}

                    <input
                      key={
                        fileInputKey
                      }
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={
                        handleFileChange
                      }
                      disabled={
                        loading
                      }
                      style={{
                        display:
                          "none",
                      }}
                    />
                  </label>
                </div>

                {fileName && (
                  <div
                    style={{
                      marginTop:
                        "24px",
                      padding:
                        "13px 16px",
                      borderRadius:
                        "14px",
                      background:
                        "#F7F4EE",
                      display:
                        "flex",
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
                      <span
                        style={{
                          fontSize:
                            "0.72rem",
                          letterSpacing:
                            "0.08em",
                          textTransform:
                            "uppercase",
                          color:
                            "var(--color-text-muted)",
                        }}
                      >
                        Archivo
                      </span>

                      <div
                        style={{
                          marginTop:
                            "3px",
                          fontSize:
                            "0.9rem",
                          color:
                            "var(--color-text)",
                        }}
                      >
                        ✓ {fileName}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        resetFile
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "var(--color-text-secondary)",
                        fontSize:
                          "0.82rem",
                        cursor:
                          "pointer",
                      }}
                    >
                      Cambiar archivo
                    </button>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      marginTop:
                        "18px",
                      padding:
                        "14px 16px",
                      borderRadius:
                        "14px",
                      background:
                        "#FBF4F1",
                      border:
                        "1px solid #E8D8D1",
                      color:
                        "#765F56",
                      fontSize:
                        "0.88rem",
                      lineHeight:
                        1.5,
                    }}
                  >
                    {error}
                  </div>
                )}
              </section>

              {/* SUMMARY */}

              {rows.length > 0 && (
                <>
                  <section
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(170px, 1fr))",
                      gap: "14px",
                      marginBottom:
                        "24px",
                    }}
                  >
                    <SummaryCard
                      label="Personas"
                      value={
                        rows.length
                      }
                    />

                    <SummaryCard
                      label="Grupos"
                      value={
                        groups.size
                      }
                    />

                    <SummaryCard
                      label="Titulares"
                      value={
                        principals.length
                      }
                    />

                    <SummaryCard
                      label="Acompañantes"
                      value={
                        companions.length
                      }
                    />
                  </section>

                  {/* VALIDATION */}

                  <section
                    style={{
                      background:
                        "#FFFFFF",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius:
                        "24px",
                      padding:
                        "28px",
                      marginBottom:
                        "24px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
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
                        <p
                          style={{
                            margin: 0,
                            fontFamily:
                              "var(--font-body)",
                            fontSize:
                              "0.7rem",
                            letterSpacing:
                              "0.14em",
                            textTransform:
                              "uppercase",
                            color:
                              "var(--color-accent)",
                          }}
                        >
                          Revisión
                        </p>

                        <h2
                          style={{
                            margin:
                              "6px 0 0",
                            fontFamily:
                              "var(--font-display)",
                            fontSize:
                              "1.65rem",
                            fontWeight:
                              500,
                            color:
                              "var(--color-text)",
                          }}
                        >
                          Validación del archivo
                        </h2>
                      </div>

                      {issues.length ===
                      0 ? (
                        <span
                          style={{
                            padding:
                              "8px 13px",
                            borderRadius:
                              "999px",
                            background:
                              "#EEF0E7",
                            color:
                              "#6F7555",
                            fontSize:
                              "0.78rem",
                            fontWeight:
                              500,
                          }}
                        >
                          ✓ Archivo válido
                        </span>
                      ) : (
                        <div
                          style={{
                            display:
                              "flex",
                            gap: "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          {errorCount >
                            0 && (
                            <span
                              style={{
                                padding:
                                  "8px 13px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#FBF0ED",
                                color:
                                  "#9A5544",
                                fontSize:
                                  "0.78rem",
                                fontWeight:
                                  500,
                              }}
                            >
                              {errorCount}{" "}
                              error
                              {errorCount !==
                              1
                                ? "es"
                                : ""}
                            </span>
                          )}

                          {warningCount >
                            0 && (
                            <span
                              style={{
                                padding:
                                  "8px 13px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#F7F2E7",
                                color:
                                  "#8A7651",
                                fontSize:
                                  "0.78rem",
                                fontWeight:
                                  500,
                              }}
                            >
                              {warningCount}{" "}
                              aviso
                              {warningCount !==
                              1
                                ? "s"
                                : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {issues.length >
                      0 && (
                      <div
                        style={{
                          marginTop:
                            "20px",
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "9px",
                        }}
                      >
                        {issues.map(
                          (
                            issue,
                            index
                          ) => (
                            <div
                              key={`${issue.message}-${index}`}
                              style={{
                                padding:
                                  "12px 14px",
                                borderRadius:
                                  "12px",
                                background:
                                  issue.type ===
                                  "error"
                                    ? "#FBF4F1"
                                    : "#FAF7EF",
                                border:
                                  issue.type ===
                                  "error"
                                    ? "1px solid #E8D8D1"
                                    : "1px solid #E9DFC8",
                                color:
                                  issue.type ===
                                  "error"
                                    ? "#765F56"
                                    : "#796A4D",
                                fontSize:
                                  "0.84rem",
                              }}
                            >
                              {issue.type ===
                              "error"
                                ? "⚠️ "
                                : "• "}
                              {
                                issue.message
                              }
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </section>

                  {/* PREVIEW TABLE */}

                  <section
                    style={{
                      background:
                        "#FFFFFF",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius:
                        "24px",
                      padding:
                        "28px",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        marginBottom:
                          "20px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontFamily:
                            "var(--font-body)",
                          fontSize:
                            "0.7rem",
                          letterSpacing:
                            "0.14em",
                          textTransform:
                            "uppercase",
                          color:
                            "var(--color-accent)",
                        }}
                      >
                        Vista previa
                      </p>

                      <h2
                        style={{
                          margin:
                            "6px 0 0",
                          fontFamily:
                            "var(--font-display)",
                          fontSize:
                            "1.65rem",
                          fontWeight:
                            500,
                          color:
                            "var(--color-text)",
                        }}
                      >
                        Primeras filas
                      </h2>
                    </div>

                    <div
                      style={{
                        width:
                          "100%",
                        overflowX:
                          "auto",
                      }}
                    >
                      <table
                        style={{
                          width:
                            "100%",
                          minWidth:
                            "760px",
                          borderCollapse:
                            "collapse",
                          fontFamily:
                            "var(--font-body)",
                          fontSize:
                            "0.84rem",
                        }}
                      >
                        <thead>
                          <tr>
                            {REQUIRED_COLUMNS.map(
                              (
                                column
                              ) => (
                                <th
                                  key={
                                    column
                                  }
                                  style={{
                                    textAlign:
                                      "left",
                                    padding:
                                      "12px 10px",
                                    borderBottom:
                                      "1px solid var(--color-border)",
                                    color:
                                      "var(--color-text-secondary)",
                                    fontWeight:
                                      500,
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {
                                    column
                                  }
                                </th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {rows
                            .slice(
                              0,
                              10
                            )
                            .map(
                              (
                                row,
                                index
                              ) => (
                                <tr
                                  key={
                                    index
                                  }
                                >
                                  <td
                                    style={{
                                      padding:
                                        "13px 10px",
                                      borderBottom:
                                        "1px solid #F0ECE4",
                                    }}
                                  >
                                    {
                                      row.Group
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        "13px 10px",
                                      borderBottom:
                                        "1px solid #F0ECE4",
                                      fontWeight:
                                        Number(
                                          row[
                                            "Principal Contact"
                                          ]
                                        ) ===
                                        1
                                          ? 500
                                          : 400,
                                    }}
                                  >
                                    {
                                      row[
                                        "Principal Contact"
                                      ]
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        "13px 10px",
                                      borderBottom:
                                        "1px solid #F0ECE4",
                                    }}
                                  >
                                    {
                                      row[
                                        "Full Name"
                                      ]
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        "13px 10px",
                                      borderBottom:
                                        "1px solid #F0ECE4",
                                    }}
                                  >
                                    {
                                      row.Phone ||
                                      "—"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        "13px 10px",
                                      borderBottom:
                                        "1px solid #F0ECE4",
                                      fontWeight:
                                        500,
                                    }}
                                  >
                                    {
                                      row.Table ||
                                      "—"
                                    }
                                  </td>
                                </tr>
                              )
                            )}
                        </tbody>
                      </table>
                    </div>

                    {rows.length >
                      10 && (
                      <p
                        style={{
                          margin:
                            "16px 0 0",
                          fontSize:
                            "0.78rem",
                          color:
                            "var(--color-text-muted)",
                        }}
                      >
                        Mostrando las
                        primeras 10
                        filas de{" "}
                        {rows.length}.
                      </p>
                    )}

                    {/* CONTINUE */}

                    {errorCount ===
                      0 && (
                      <div
                        style={{
                          marginTop:
                            "28px",
                          paddingTop:
                            "24px",
                          borderTop:
                            "1px solid var(--color-border)",
                          display:
                            "flex",
                          justifyContent:
                            "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={
                            handleContinue
                          }
                          style={{
                            minHeight:
                              "48px",
                            padding:
                              "0 24px",
                            border:
                              "none",
                            borderRadius:
                              "999px",
                            background:
                              "var(--color-primary)",
                            color:
                              "#FFFFFF",
                            fontFamily:
                              "var(--font-body)",
                            fontSize:
                              "0.92rem",
                            fontWeight:
                              500,
                            cursor:
                              "pointer",
                          }}
                        >
                          Continuar →
                        </button>
                      </div>
                    )}

                    {continued && (
                      <div
                        style={{
                          marginTop:
                            "18px",
                          padding:
                            "14px 16px",
                          borderRadius:
                            "14px",
                          background:
                            "#EEF0E7",
                          color:
                            "#6F7555",
                          fontSize:
                            "0.88rem",
                          lineHeight:
                            1.5,
                        }}
                      >
                        ✓ Archivo listo para
                        preparar la
                        comunicación.
                      </div>
                    )}
                  </section>

                  {/* STEP 3 - COMMUNICATION */}

                  {continued && (
                    <section
                      style={{
                        marginTop: "24px",
                        background: "#FFFFFF",
                        border:
                          "1px solid var(--color-border)",
                        borderRadius: "24px",
                        padding: "34px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "24px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontFamily: "var(--font-body)",
                              fontSize: "0.7rem",
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "var(--color-accent)",
                            }}
                          >
                            Paso 3
                          </p>

                          <h2
                            style={{
                              margin: "7px 0 0",
                              fontFamily: "var(--font-display)",
                              fontSize: "1.8rem",
                              fontWeight: 500,
                              color: "var(--color-text)",
                            }}
                          >
                            Preparar comunicación
                          </h2>

                          <p
                            style={{
                              margin: "9px 0 0",
                              maxWidth: "680px",
                              fontFamily: "var(--font-body)",
                              fontSize: "0.92rem",
                              lineHeight: 1.6,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Personaliza el mensaje y su diseño.
                            Las variables protegidas se completarán
                            automáticamente para cada titular.
                          </p>
                        </div>

                        <span
                          style={{
                            padding: "8px 13px",
                            borderRadius: "999px",
                            background: "#EEF0E7",
                            color: "#6F7555",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                          }}
                        >
                          Comunicación
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: "28px",
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0, 0.82fr) minmax(0, 1.18fr)",
                          gap: "24px",
                          alignItems: "start",
                        }}
                      >
                        {/* EDITOR */}

                        <div
                          style={{
                            border:
                              "1px solid var(--color-border)",
                            borderRadius: "20px",
                            padding: "24px",
                            background: "#FAF8F3",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.68rem",
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "var(--color-accent)",
                            }}
                          >
                            Editor
                          </p>

                          <h3
                            style={{
                              margin: "7px 0 0",
                              fontFamily: "var(--font-display)",
                              fontSize: "1.5rem",
                              fontWeight: 500,
                              color: "var(--color-text)",
                            }}
                          >
                            Edita tu comunicación
                          </h3>

                          <p
                            style={{
                              margin: "9px 0 0",
                              fontSize: "0.82rem",
                              lineHeight: 1.55,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Puedes cambiar todo el texto y aplicar
                            negrita o cursiva. Las variables no se
                            pueden editar ni borrar.
                          </p>

                          <div
                            style={{
                              marginTop: "20px",
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => formatMessage("bold")}
                              style={{
                                width: "38px",
                                height: "34px",
                                border:
                                  "1px solid var(--color-border)",
                                borderRadius: "10px",
                                background: "#FFFFFF",
                                fontFamily: "Georgia, serif",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor: "pointer",
                              }}
                              title="Negrita"
                            >
                              B
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                formatMessage("italic")
                              }
                              style={{
                                width: "38px",
                                height: "34px",
                                border:
                                  "1px solid var(--color-border)",
                                borderRadius: "10px",
                                background: "#FFFFFF",
                                fontFamily: "Georgia, serif",
                                fontStyle: "italic",
                                fontSize: "1rem",
                                cursor: "pointer",
                              }}
                              title="Cursiva"
                            >
                              I
                            </button>
                          </div>

                                                 <div
                            id="communication-editor"
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleMessageInput}
                            onKeyDown={handleMessageKeyDown}
                            style={{
                              marginTop: "12px",
                              minHeight: "360px",
                              padding: "18px",
                              border:
                                "1px solid var(--color-border)",
                              borderRadius: "15px",
                              background: "#FFFFFF",
                              fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                              fontSize: "1rem",
                              lineHeight: 1.7,
                              color: "var(--color-text)",
                              outline: "none",
                            }}
                          />

                          <div
                            style={{
                              marginTop: "16px",
                              padding: "13px 15px",
                              borderRadius: "13px",
                              background: "#F3F0E8",
                              fontSize: "0.77rem",
                              lineHeight: 1.5,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            <strong>Variables protegidas:</strong>{" "}
                            <span
                              style={{
                                display: "inline-block",
                                margin: "3px 3px 0 0",
                                padding: "4px 7px",
                                borderRadius: "7px",
                                background: "#E8E5DA",
                                color: "#6B6B58",
                              }}
                            >
                              {MESSAGE_VARIABLES.titular}
                            </span>
                            <span
                              style={{
                                display: "inline-block",
                                margin: "3px 0 0 3px",
                                padding: "4px 7px",
                                borderRadius: "7px",
                                background: "#E8E5DA",
                                color: "#6B6B58",
                              }}
                            >
                              {MESSAGE_VARIABLES.mesas}

                              <span
  style={{
    display: "inline-block",
    margin: "3px 0 0 3px",
    padding: "4px 7px",
    borderRadius: "7px",
    background: "#E8E5DA",
    color: "#6B6B58",
  }}
>
  {MESSAGE_VARIABLES.evento}
</span>
                            </span>
                          </div>

                          {/* PALETTE */}

                          <div style={{ marginTop: "24px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.68rem",
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "var(--color-accent)",
                              }}
                            >
                              🎨 Paleta de color
                            </p>

                            <div
                              style={{
                                marginTop: "12px",
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(0, 1fr))",
                                gap: "9px",
                              }}
                            >
                              {COLOR_PALETTES.map(
                                (palette) => {
                                  const selected =
                                    selectedPalette ===
                                    palette.name;

                                  return (
                                    <button
                                      key={palette.name}
                                      type="button"
                                      onClick={() =>
                                        setSelectedPalette(
                                          palette.name
                                        )
                                      }
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "9px",
                                        padding:
                                          "9px 10px",
                                        border: selected
                                          ? `2px solid ${palette.accent}`
                                          : "1px solid var(--color-border)",
                                        borderRadius:
                                          "12px",
                                        background:
                                          "#FFFFFF",
                                        cursor:
                                          "pointer",
                                        textAlign:
                                          "left",
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: "22px",
                                          height: "22px",
                                          flexShrink: 0,
                                          borderRadius:
                                            "50%",
                                          background:
                                            palette.accent,
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize:
                                            "0.76rem",
                                          color:
                                            "var(--color-text)",
                                        }}
                                      >
                                        {palette.name}
                                      </span>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {/* FONT */}

                          <div style={{ marginTop: "24px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.68rem",
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "var(--color-accent)",
                              }}
                            >
                              Aa Tipografía
                            </p>

                            <div
                              style={{
                                marginTop: "12px",
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(2, minmax(0, 1fr))",
                                gap: "9px",
                              }}
                            >
                              {MESSAGE_FONTS.map((font) => {
                                const selected =
                                  selectedFont === font.name;

                                return (
                                  <button
                                    key={font.name}
                                    type="button"
                                    onClick={() =>
                                      setSelectedFont(
                                        font.name
                                      )
                                    }
                                    style={{
                                      padding:
                                        "11px 12px",
                                      border: selected
                                        ? "2px solid var(--color-accent)"
                                        : "1px solid var(--color-border)",
                                      borderRadius:
                                        "12px",
                                      background:
                                        "#FFFFFF",
                                      cursor:
                                        "pointer",
                                      textAlign:
                                        "left",
                                      fontFamily:
                                        font.value,
                                      fontSize:
                                        "0.9rem",
                                      color:
                                        "var(--color-text)",
                                    }}
                                  >
                                    {font.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* PREVIEW */}

                        <div>
                          <div
                            style={{
                              marginBottom: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "space-between",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.68rem",
                                  letterSpacing: "0.14em",
                                  textTransform: "uppercase",
                                  color:
                                    "var(--color-accent)",
                                }}
                              >
                                Vista previa
                              </p>

                              <h3
                                style={{
                                  margin: "6px 0 0",
                                  fontFamily:
                                    "var(--font-display)",
                                  fontSize: "1.5rem",
                                  fontWeight: 500,
                                  color:
                                    "var(--color-text)",
                                }}
                              >
                                Así lo recibirá el titular
                              </h3>
                            </div>

                            <span
                              style={{
                                padding: "7px 11px",
                                borderRadius: "999px",
                                background:
                                  COLOR_PALETTES.find(
                                    (palette) =>
                                      palette.name ===
                                      selectedPalette
                                  )?.soft || "#EEF0E7",
                                color:
                                  COLOR_PALETTES.find(
                                    (palette) =>
                                      palette.name ===
                                      selectedPalette
                                  )?.text || "#4F5142",
                                fontSize: "0.72rem",
                              }}
                            >
                              {selectedPalette}
                            </span>
                          </div>

                          {(() => {
                            const palette =
                              COLOR_PALETTES.find(
                                (item) =>
                                  item.name ===
                                  selectedPalette
                              ) ||
                              COLOR_PALETTES[0];

                            const font =
                              MESSAGE_FONTS.find(
                                (item) =>
                                  item.name ===
                                  selectedFont
                              ) ||
                              MESSAGE_FONTS[0];

                            const previewHtml =
                              messageHtml
                                .replaceAll(
                                  "{{nombre_titular}}",
                                  `<span style="display:inline-block;padding:2px 7px;border-radius:6px;background:${palette.soft};color:${palette.text};font-weight:600;">${
                                    firstPrincipal?.[
                                      "Full Name"
                                    ] ||
                                    "Nombre del titular"
                                  }</span>`
                                )
                                .replaceAll(
                                  "{{asignacion_mesas}}",
                                  `<span style="display:block;white-space:pre-line;padding:15px 17px;border-radius:14px;background:${palette.soft};color:${palette.text};">${
                                    firstGroupAssignment ||
                                    "Asignación de mesas"
                                  }</span>`
                                )
                                .replaceAll(
  "{{nombre_evento}}",
  eventName || "Nombre del evento"
);

                            return (
                              <div
                                style={{
                                  border: `1px solid ${palette.accent}`,
                                  borderRadius: "22px",
                                  padding: "30px",
                                  background: "#FFFFFF",
                                  boxShadow:
                                    "0 12px 35px rgba(60, 50, 35, 0.05)",
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontFamily:
                                      font.value,
                                    fontSize: "0.9rem",
                                    letterSpacing:
                                      "0.12em",
                                    textTransform:
                                      "uppercase",
                                    color:
                                      palette.accent,
                                  }}
                                >
                                  EVENSSE · COMUNICA
                                </p>

                                <div
                                  style={{
                                    width: "48px",
                                    height: "1px",
                                    margin:
                                      "20px 0 24px",
                                    background:
                                      palette.accent,
                                  }}
                                />

                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      previewHtml,
                                  }}
                                  style={{
                                    fontFamily:
                                      font.value,
                                    fontSize:
                                      "1.04rem",
                                    lineHeight: 1.75,
                                    color:
                                      "var(--color-text)",
                                  }}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* APPROVE */}

                      <div
                        style={{
                          marginTop: "28px",
                          paddingTop: "24px",
                          borderTop:
                            "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            maxWidth: "680px",
                            fontSize: "0.84rem",
                            lineHeight: 1.5,
                            color:
                              "var(--color-text-secondary)",
                          }}
                        >
                          Cuando apruebes esta comunicación,
                          conservaremos el contenido y diseño
                          elegidos para utilizarlos al generar
                          los códigos personalizados.
                        </p>

                        <button
                          type="button"
                          onClick={
                            handleApproveCommunication
                          }
                          style={{
                            minHeight: "48px",
                            padding: "0 24px",
                            border: "none",
                            borderRadius: "999px",
                            background:
                              "var(--color-primary)",
                            color: "#FFFFFF",
                            fontFamily:
                              "var(--font-body)",
                            fontSize: "0.92rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Aprobar comunicación →
                        </button>
                      </div>

                      {communicationApproved && (
                        <div
                          style={{
                            marginTop: "18px",
                            padding: "14px 16px",
                            borderRadius: "14px",
                            background: "#EEF0E7",
                            color: "#6F7555",
                            fontSize: "0.88rem",
                            lineHeight: 1.5,
                          }}
                        >
                          ✓ Comunicación aprobada.
                          El siguiente paso será generar
                          los códigos personalizados.
                        </div>
                      )}
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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border:
          "1px solid var(--color-border)",
        borderRadius: "20px",
        padding:
          "22px 24px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily:
            "var(--font-body)",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          textTransform:
            "uppercase",
          color:
            "var(--color-text-muted)",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin:
            "7px 0 0",
          fontFamily:
            "var(--font-display)",
          fontSize: "2rem",
          lineHeight: 1,
          fontWeight: 500,
          color:
            "var(--color-text)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function validateRows(
  rows: TableRow[]
): ValidationIssue[] {
  const issues: ValidationIssue[] =
    [];

  const grouped = new Map<
    string,
    TableRow[]
  >();

  rows.forEach((row) => {
    const group =
      row.Group.trim();

    if (!group) {
      issues.push({
        type: "error",
        message: `Hay una fila sin Group: "${
          row["Full Name"] ||
          "sin nombre"
        }".`,
      });

      return;
    }

    if (
      !row["Full Name"].trim()
    ) {
      issues.push({
        type: "error",
        message: `El grupo "${group}" tiene una persona sin Full Name.`,
      });
    }

    const principalValue =
      String(
        row["Principal Contact"]
      ).trim();

    if (
      principalValue !== "0" &&
      principalValue !== "1"
    ) {
      issues.push({
        type: "error",
        message: `El grupo "${group}" tiene un Principal Contact inválido en "${row["Full Name"]}". Usa 1 o 0.`,
      });
    }

    if (!row.Table.trim()) {
      issues.push({
        type: "warning",
        message: `"${row["Full Name"] || "Persona sin nombre"}" no tiene mesa asignada.`,
      });
    }

    if (!grouped.has(group)) {
      grouped.set(group, []);
    }

    grouped
      .get(group)!
      .push(row);
  });

  grouped.forEach(
    (groupRows, groupName) => {
      const groupPrincipals =
        groupRows.filter(
          (row) =>
            String(
              row[
                "Principal Contact"
              ]
            ).trim() === "1"
        );

      if (
        groupPrincipals.length ===
        0
      ) {
        issues.push({
          type: "error",
          message: `El grupo "${groupName}" no tiene ningún titular (Principal Contact = 1).`,
        });
      }

      if (
        groupPrincipals.length > 1
      ) {
        issues.push({
          type: "error",
          message: `El grupo "${groupName}" tiene ${groupPrincipals.length} titulares. Debe tener exactamente uno.`,
        });
      }

      groupPrincipals.forEach(
        (principal) => {
          if (
            !principal.Phone.trim()
          ) {
            issues.push({
              type: "error",
              message: `El titular "${principal["Full Name"]}" no tiene teléfono.`,
            });
          }
        }
      );

      const nonPrincipals =
        groupRows.filter(
          (row) =>
            String(
              row[
                "Principal Contact"
              ]
            ).trim() === "0"
        );

      nonPrincipals.forEach(
        (companion) => {
          if (
            companion.Phone.trim()
          ) {
            issues.push({
              type: "warning",
              message: `El acompañante "${companion["Full Name"]}" tiene teléfono. Recuerda que solo el titular debe tenerlo.`,
            });
          }
        }
      );
    }
  );

  return issues;
}