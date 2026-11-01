export const formatNumber = (value: number | undefined) => {
  if (value === undefined) return '0'
  return Number.isInteger(value) ? value.toString() : value.toFixed(2)
}
