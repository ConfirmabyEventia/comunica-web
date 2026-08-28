export function normalizePhone(
  phone: string | number | null | undefined
): string {
  if (
    phone === null ||
    phone === undefined
  ) {
    return "";
  }

  return String(phone).replace(/\D/g, "");
}