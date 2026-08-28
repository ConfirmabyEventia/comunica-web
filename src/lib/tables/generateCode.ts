const CODE_LENGTH = 6;

const CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(): string {
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = Math.floor(
      Math.random() * CHARACTERS.length
    );

    code += CHARACTERS[index];
  }

  return code;
}

export function generateUniqueCodes(
  amount: number,
  existingCodes: string[] = []
): string[] {
  const codes = new Set(
    existingCodes.map((code) =>
      code.toUpperCase()
    )
  );

  while (codes.size < amount) {
    codes.add(generateCode());
  }

  return Array.from(codes).slice(
    existingCodes.length
  );
}