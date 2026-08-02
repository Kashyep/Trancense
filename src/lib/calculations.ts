import type { CalculationResult, EnergyRecord, Facility } from './types'

const now = () => new Date().toISOString()

function result(
  metric: string,
  value: number | undefined,
  unit: string,
  formulaName: string,
  inputRecordIds: string[],
  period: string,
  boundary: string,
  warnings: string[] = [],
  factors: string[] = [],
): CalculationResult {
  return {
    id: `calc-${metric}`,
    auditId: 'audit-pilot',
    metric,
    value,
    unit,
    formulaName,
    formulaVersion: 'v1',
    inputRecordIds,
    period,
    boundary,
    factors,
    warnings,
    calculatedAt: now(),
    available: value !== undefined,
  }
}

export function approvedRecords(records: EnergyRecord[]) {
  return records.filter((record) => record.reviewState === 'approved')
}

export function calculateTotalEnergy(records: EnergyRecord[], period: string, boundary: string) {
  const approved = approvedRecords(records)
  if (!approved.length) {
    return result('total-energy', undefined, 'kWh', 'total_energy_v1', [], period, boundary, [
      'Approve at least one energy record before calculating total energy.',
    ])
  }
  return result(
    'total-energy',
    approved.reduce((sum, record) => sum + (record.normalizedQuantity ?? 0), 0),
    'kWh',
    'total_energy_v1',
    approved.map((record) => record.id),
    period,
    boundary,
    approved.filter((record) => record.dataQuality === 'estimated').length
      ? ['Some approved inputs are estimated.']
      : [],
  )
}

export function calculateHistoricalBaseline(records: EnergyRecord[], period: string, boundary: string) {
  const approved = approvedRecords(records)
  const months = new Set(approved.map((record) => record.period))
  if (months.size < 3) {
    return result(
      'baseline',
      undefined,
      'kWh/month',
      'historical_average_v1',
      approved.map((record) => record.id),
      period,
      boundary,
      [`Baseline unavailable. ${months.size} approved period(s) available; 3 are required.`],
    )
  }
  return result(
    'baseline',
    approved.reduce((sum, record) => sum + (record.normalizedQuantity ?? 0), 0) / months.size,
    'kWh/month',
    'historical_average_v1',
    approved.map((record) => record.id),
    period,
    boundary,
  )
}

export function calculateEnergyIntensity(
  total: CalculationResult,
  facility: Facility,
  period: string,
  boundary: string,
) {
  if (!total.available || !facility.floorArea || facility.floorArea <= 0) {
    return result('intensity', undefined, 'kWh/m²', 'energy_intensity_v1', total.inputRecordIds, period, boundary, [
      'Floor area is required to calculate energy intensity.',
    ])
  }
  return result('intensity', total.value! / facility.floorArea, 'kWh/m²', 'energy_intensity_v1', total.inputRecordIds, period, boundary)
}

export function calculateTotalCost(records: EnergyRecord[], period: string, boundary: string) {
  const approved = approvedRecords(records)
  const priced = approved.filter((record) => record.totalCost !== undefined)
  if (!priced.length) {
    return result('cost', undefined, 'INR', 'energy_cost_v1', [], period, boundary, [
      'Add approved cost data or a tariff assumption before calculating cost.',
    ])
  }
  return result('cost', priced.reduce((sum, record) => sum + (record.totalCost ?? 0), 0), 'INR', 'energy_cost_v1', priced.map((record) => record.id), period, boundary)
}

export function calculateEmissions(records: EnergyRecord[], factor: number | undefined, factorId: string | undefined, period: string, boundary: string) {
  const approved = approvedRecords(records)
  if (factor === undefined || !factorId) {
    return result('emissions', undefined, 'kgCO₂e', 'emissions_v1', [], period, boundary, [
      'No approved emissions factor is configured for the selected energy source.',
    ])
  }
  const total = approved.reduce((sum, record) => sum + (record.normalizedQuantity ?? 0), 0)
  return result('emissions', total * factor, 'kgCO₂e', 'emissions_v1', approved.map((record) => record.id), period, boundary, [], [factorId])
}

export function calculateSimplePayback(implementationCost: number | undefined, annualCostSavings: number | undefined) {
  if (!implementationCost || !annualCostSavings || annualCostSavings <= 0) return undefined
  return implementationCost / annualCostSavings
}
