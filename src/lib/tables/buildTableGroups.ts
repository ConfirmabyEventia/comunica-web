import { generateCode } from "./generateCode";
import { normalizePhone } from "./normalizePhone";

export type TableImportRow = {
  Group: string;
  "Principal Contact": number | string;
  "Full Name": string;
  Phone: string | number;
  Table: string | number;
};

export type TableGroupPerson = {
  name: string;
  isPrincipal: boolean;
  table: string;
};

export type TableGroup = {
  group: string;
  principal: {
    name: string;
    phone: string;
    code: string;
  };
  people: TableGroupPerson[];
};

export function buildTableGroups(
  rows: TableImportRow[]
): TableGroup[] {
  const grouped = new Map<
    string,
    TableImportRow[]
  >();

  for (const row of rows) {
    const group = String(
      row.Group ?? ""
    ).trim();

    if (!group) continue;

    if (!grouped.has(group)) {
      grouped.set(group, []);
    }

    grouped.get(group)!.push(row);
  }

  const groups: TableGroup[] = [];

  for (const [group, groupRows] of grouped) {
    const principalRows =
      groupRows.filter(
        (row) =>
          Number(
            row["Principal Contact"]
          ) === 1
      );

    if (principalRows.length !== 1) {
      continue;
    }

    const principal =
      principalRows[0];

    const people: TableGroupPerson[] =
      groupRows.map((row) => ({
        name: String(
          row["Full Name"] ?? ""
        ).trim(),

        isPrincipal:
          Number(
            row["Principal Contact"]
          ) === 1,

        table: String(
          row.Table ?? ""
        ).trim(),
      }));

    groups.push({
      group,

      principal: {
        name: String(
          principal["Full Name"] ?? ""
        ).trim(),

        phone: normalizePhone(
          principal.Phone
        ),

        code: generateCode(),
      },

      people,
    });
  }

  return groups;
}