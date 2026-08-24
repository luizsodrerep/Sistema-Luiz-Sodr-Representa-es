export function formatarCodigoOrcamento(
  numeroSequencial: number
) {
  return `ORC-${String(
    numeroSequencial
  ).padStart(6, "0")}`
}