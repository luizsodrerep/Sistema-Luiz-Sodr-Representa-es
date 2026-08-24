export function formatarCodigoInteracao(
  numeroSequencial: number
) {
  if (
    !Number.isInteger(numeroSequencial) ||
    numeroSequencial <= 0
  ) {
    return "INT-??????"
  }

  return `INT-${String(
    numeroSequencial
  ).padStart(6, "0")}`
}