import * as XLSX from "xlsx";

import {
  buildTableGroups,
  TableImportRow,
} from "./buildTableGroups";

import { normalizePhone } from "./normalizePhone";

export type FinalTableRow = {
  Group: string;
  "Principal Contact": number;
  "Full Name": string;
  Phone: string;
  Table: string;
  Code: string;
};

export function buildFinalTableRows(
  rows: TableImportRow[]
): FinalTableRow[] {
  const groups = buildTableGroups(rows);

  const codeByGroup = new Map<string, string>();

  const phoneByGroup = new Map<string, string>();

  groups.forEach((group) => {
    codeByGroup.set(
      group.group,
      group.principal.code
    );

    phoneByGroup.set(
      group.group,
      group.principal.phone
    );
  });

  return rows.map((row) => {
    const group = String(
      row.Group ?? ""
    ).trim();

    const isPrincipal =
      Number(
        row["Principal Contact"]
      ) === 1;

    return {
      Group: group,

      "Principal Contact":
        isPrincipal ? 1 : 0,

      "Full Name": String(
        row["Full Name"] ?? ""
      ).trim(),

      Phone: isPrincipal
        ? normalizePhone(row.Phone)
        : "",

      Table: String(
        row.Table ?? ""
      ).trim(),

      Code: isPrincipal
        ? codeByGroup.get(group) ?? ""
        : "",
    };
  });
}

export function generateTablesExcel(
  rows: TableImportRow[],
  fileName = "mesas_con_codigos.xlsx"
): Blob {
  const finalRows =
    buildFinalTableRows(rows);

  const worksheet =
    XLSX.utils.json_to_sheet(
      finalRows
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "MESAS"
  );

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  return new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );
}

export function downloadTablesExcel(
  rows: TableImportRow[],
  fileName = "mesas_con_codigos.xlsx"
): void {
  const blob =
    generateTablesExcel(
      rows,
      fileName
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}