export function formatNumber(value: number | undefined, maximumFractionDigits = 0) {
  if (value === undefined || Number.isNaN(value)) return 'Not available'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value)
}

export function formatCurrency(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return 'Not available'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export function formatSource(value: string) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function formatStatus(value: string) {
  return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}
