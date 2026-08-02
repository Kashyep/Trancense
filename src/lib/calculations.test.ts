import { describe, expect, it } from 'vitest'
import { calculateHistoricalBaseline, calculateSimplePayback, calculateTotalEnergy, calculateEnergyIntensity } from './calculations'
import type { EnergyRecord, Facility } from './types'

const record = (id: string, period: string, quantity: number, reviewState: EnergyRecord['reviewState'] = 'approved'): EnergyRecord => ({
  id, auditId: 'audit', facilityId: 'facility', period, source: 'electricity', rawQuantity: quantity, rawUnit: 'kWh', normalizedQuantity: quantity, normalizedUnit: 'kWh', normalizationStatus: 'not-required', dataQuality: 'bill-derived', reviewState,
})

const facility: Facility = { id: 'facility', siteId: 'site', name: 'Test facility', type: 'Office', floorArea: 100, floorAreaUnit: 'm2', occupancy: 10, operatingHours: 8 }

describe('deterministic calculation domain', () => {
  it('sums only approved normalized records', () => {
    const result = calculateTotalEnergy([record('a', '2025-01', 100), record('b', '2025-02', 200, 'draft')], '2025', 'meter')
    expect(result.value).toBe(100)
    expect(result.inputRecordIds).toEqual(['a'])
  })

  it('requires three periods for the historical baseline', () => {
    const unavailable = calculateHistoricalBaseline([record('a', '2025-01', 100)], '2025', 'meter')
    expect(unavailable.available).toBe(false)
    expect(unavailable.warnings[0]).toContain('3 are required')
    const available = calculateHistoricalBaseline([record('a', '2025-01', 100), record('b', '2025-02', 200), record('c', '2025-03', 300)], '2025', 'meter')
    expect(available.value).toBe(200)
  })

  it('calculates intensity from matching facility area', () => {
    const total = calculateTotalEnergy([record('a', '2025-01', 100)], '2025', 'meter')
    expect(calculateEnergyIntensity(total, facility, '2025', 'meter').value).toBe(1)
  })

  it('does not calculate payback without positive annual savings', () => {
    expect(calculateSimplePayback(1000, 0)).toBeUndefined()
    expect(calculateSimplePayback(1000, 250)).toBe(4)
  })
})
