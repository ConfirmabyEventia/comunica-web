"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  buildFinalTableRows,
  downloadTablesExcel,
} from "@/lib/tables/generateTablesExcel";
import { supabase } from "@/lib/supabase/client";

import type {
  TableImportRow,
} from "@/lib/tables/buildTableGroups";

type CodeGeneratorProps = {
  rows: TableImportRow[];
  eventName: string;
  eventId: string | null;
  existingCodes: {
    principal_person_id: string;
    principal_name: string;
    code: string;
  }[];
};

type GeneratedGroup = {
  group: string;
  principalName: string;
  phone: string;
  peopleCount: number;
  tables: string[];
  code: string;
};

export default function CodeGenerator({
  rows,
  eventName,
  eventId,
  existingCodes,
}: CodeGeneratorProps) {
  
  const [generated, setGenerated] =
    useState(false);

    useEffect(() => {
  if (existingCodes.length > 0) {
    setGenerated(true);
  }
}, [existingCodes]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      TableImportRow[]
    >();

    rows.forEach((row) => {
      const group = String(
        row.Group ?? ""
      ).trim();

      if (!group) return;

      if (!map.has(group)) {
        map.set(group, []);
      }

      map.get(group)!.push(row);
    });

    return Array.from(
      map.entries()
    );
  }, [rows]);

  const generatedGroups =
    useMemo<GeneratedGroup[]>(() => {
      if (!generated) return [];

      const finalRows =
        buildFinalTableRows(rows);

      return groups.map(
        ([group, groupRows]) => {
          const principal =
            groupRows.find(
              (row) =>
                Number(
                  row[
                    "Principal Contact"
                  ]
                ) === 1
            );

          const finalPrincipal =
            finalRows.find(
              (row) =>
                row.Group === group &&
                row[
                  "Principal Contact"
                ] === 1
            );

          const tables = Array.from(
            new Set(
              groupRows
                .map((row) =>
                  String(
                    row.Table ?? ""
                  ).trim()
                )
                .filter(Boolean)
            )
          );

          return {
            group,

            principalName:
              String(
                principal?.[
                  "Full Name"
                ] ?? ""
              ).trim(),

            phone:
              String(
                finalPrincipal?.Phone ??
                  ""
              ),

            peopleCount:
              groupRows.length,

            tables,

        
  code:
  existingCodes.find(
    (item) =>
      item.principal_name ===
      String(
        principal?.["Full Name"] ?? ""
      ).trim()
  )?.code ??
  finalPrincipal?.Code ??
  "",
          };
        }
      );
    }, [
  generated,
  rows,
  groups,
  existingCodes,
]);

const handleGenerate = async () => {
  if (!eventId) {
    console.error(
      "CodeGenerator: falta eventId"
    );
    alert(
      "No se encontró el ID del evento."
    );
    return;
  }

  try {
    const finalRows =
      buildFinalTableRows(rows);

    const principalRows =
      finalRows.filter(
        (row) =>
          row["Principal Contact"] === 1 &&
          row.Code
      );

    const peopleResult =
      await supabase
        .from("people")
        .select("id, name, event_id")
        .eq("event_id", eventId);

    if (peopleResult.error) {
      throw peopleResult.error;
    }

const codesToInsert: {
  event_id: string;
  principal_person_id: string;
  code: string;
}[] = [];

for (const row of principalRows) {
  const person =
    peopleResult.data.find(
      (item) =>
        item.name.trim() ===
          row["Full Name"].trim() &&
        item.event_id === eventId
    );

  if (!person) {
    continue;
  }

  codesToInsert.push({
    event_id: eventId,
    principal_person_id:
      person.id,
    code: row.Code,
  });
}
alert(
  `Personas encontradas: ${peopleResult.data.length}\n` +
  `Titulares con código: ${principalRows.length}\n` +
  `Códigos para guardar: ${codesToInsert.length}`
);
    if (codesToInsert.length > 0) {
      const { error } =
        await supabase
          .from("table_group_codes")
          .upsert(
            codesToInsert,
            {
              onConflict:
                "event_id,principal_person_id",
            }
          );

      if (error) {
        throw error;
      }
    }

    setGenerated(true);
  } catch (err) {
    console.error(
      "Error generando códigos:",
      err
    );
  }
};

  const handleDownload =
    () => {
      downloadTablesExcel(
        rows,
        `${eventName || "evento"}_mesas_con_codigos.xlsx`
      );
    };

  return (
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
          justifyContent:
            "space-between",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
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
            Paso 4
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
            Generar códigos personalizados
          </h2>

          <p
            style={{
              margin:
                "9px 0 0",
              maxWidth: "680px",
              fontFamily:
                "var(--font-body)",
              fontSize: "0.92rem",
              lineHeight: 1.6,
              color:
                "var(--color-text-secondary)",
            }}
          >
            Se generará un código único
            para cada titular. El código
            representa a todo su grupo
            familiar.
          </p>
        </div>

        <span
          style={{
            padding: "8px 13px",
            borderRadius:
              "999px",
            background:
              "#EEF0E7",
            color: "#6F7555",
            fontSize: "0.78rem",
            fontWeight: 500,
          }}
        >
          {groups.length} grupos
        </span>
      </div>

      {/* SUMMARY */}

      <div
        style={{
          marginTop: "28px",
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        <SummaryCard
          label="Grupos familiares"
          value={groups.length}
        />

        <SummaryCard
          label="Titulares"
          value={groups.length}
        />

        <SummaryCard
          label="Personas"
          value={rows.length}
        />
      </div>

      {/* GROUPS */}

      <div
        style={{
          marginTop: "28px",
          border:
            "1px solid var(--color-border)",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding:
              "17px 20px",
            background:
              "#FAF8F3",
            borderBottom:
              "1px solid var(--color-border)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily:
                "var(--font-body)",
              fontSize: "0.68rem",
              letterSpacing:
                "0.14em",
              textTransform:
                "uppercase",
              color:
                "var(--color-accent)",
            }}
          >
            Grupos detectados
          </p>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "720px",
              borderCollapse:
                "collapse",
              fontFamily:
                "var(--font-body)",
              fontSize: "0.84rem",
            }}
          >
            <thead>
              <tr>
                <TableHeader>
                  Titular
                </TableHeader>

                <TableHeader>
                  Grupo
                </TableHeader>

                <TableHeader>
                  Integrantes
                </TableHeader>

                <TableHeader>
                  Mesas
                </TableHeader>

                {generated && (
                  <TableHeader>
                    Código
                  </TableHeader>
                )}
              </tr>
            </thead>

            <tbody>
              {groups.map(
                (
                  [
                    group,
                    groupRows,
                  ],
                  index
                ) => {
                  const principal =
                    groupRows.find(
                      (row) =>
                        Number(
                          row[
                            "Principal Contact"
                          ]
                        ) === 1
                    );

                  const generatedGroup =
                    generatedGroups.find(
                      (item) =>
                        item.group ===
                        group
                    );

                  const tables =
                    Array.from(
                      new Set(
                        groupRows
                          .map(
                            (row) =>
                              String(
                                row.Table ??
                                  ""
                              ).trim()
                          )
                          .filter(
                            Boolean
                          )
                      )
                    );

                  return (
                    <tr
                      key={group}
                    >
                      <td
                        style={{
                          padding:
                            "15px 10px 15px 20px",
                          borderBottom:
                            "1px solid #F0ECE4",
                          color:
                            "var(--color-text)",
                          fontWeight: 500,
                        }}
                      >
                        {
                          principal?.[
                            "Full Name"
                          ]
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 10px",
                          borderBottom:
                            "1px solid #F0ECE4",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        {group}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 10px",
                          borderBottom:
                            "1px solid #F0ECE4",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        {
                          groupRows.length
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 10px",
                          borderBottom:
                            "1px solid #F0ECE4",
                          color:
                            "var(--color-text-secondary)",
                        }}
                      >
                        {tables.join(
                          " · "
                        ) || "—"}
                      </td>

                      {generated && (
                        <td
                          style={{
                            padding:
                              "15px 20px 15px 10px",
                            borderBottom:
                              "1px solid #F0ECE4",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "7px 10px",
                              borderRadius:
                                "8px",
                              background:
                                "#EEF0E7",
                              color:
                                "#596047",
                              fontFamily:
                                "monospace",
                              fontSize:
                                "0.82rem",
                              fontWeight:
                                600,
                              letterSpacing:
                                "0.08em",
                            }}
                          >
                            {
                              generatedGroup
                                ?.code
                            }
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION */}

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
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.86rem",
              lineHeight: 1.5,
              color:
                "var(--color-text-secondary)",
            }}
          >
            {generated
              ? `Se generaron ${generatedGroups.length} códigos únicos, uno por titular.`
              : `Se generarán ${groups.length} códigos únicos, uno por titular.`}
          </p>

          {generated && (
            <p
              style={{
                margin:
                  "5px 0 0",
                fontSize: "0.76rem",
                color:
                  "var(--color-text-muted)",
              }}
            >
              El teléfono de cada
              titular se conserva
              normalizado, solo con
              números.
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {!generated ? (
            <button
              type="button"
              onClick={
                handleGenerate
              }
              style={{
                minHeight: "48px",
                padding:
                  "0 24px",
                border: "none",
                borderRadius:
                  "999px",
                background:
                  "var(--color-primary)",
                color: "#FFFFFF",
                fontFamily:
                  "var(--font-body)",
                fontSize: "0.92rem",
                fontWeight: 500,
                cursor:
                  "pointer",
              }}
            >
              Generar códigos →
            </button>
          ) : (
            <button
              type="button"
              onClick={
                handleDownload
              }
              style={{
                minHeight: "48px",
                padding:
                  "0 24px",
                border: "none",
                borderRadius:
                  "999px",
                background:
                  "var(--color-primary)",
                color: "#FFFFFF",
                fontFamily:
                  "var(--font-body)",
                fontSize: "0.92rem",
                fontWeight: 500,
                cursor:
                  "pointer",
              }}
            >
              Descargar Excel →
            </button>
          )}
        </div>
      </div>
    </section>
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
        background: "#FAF8F3",
        border:
          "1px solid var(--color-border)",
        borderRadius: "16px",
        padding:
          "18px 20px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.7rem",
          letterSpacing:
            "0.1em",
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
            "6px 0 0",
          fontFamily:
            "var(--font-display)",
          fontSize: "1.9rem",
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

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      style={{
        textAlign: "left",
        padding:
          "13px 10px",
        borderBottom:
          "1px solid var(--color-border)",
        color:
          "var(--color-text-secondary)",
        fontWeight: 500,
        whiteSpace:
          "nowrap",
      }}
    >
      {children}
    </th>
  );
}