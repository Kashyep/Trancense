export type Role = 'owner' | 'editor' | 'reviewer' | 'viewer'
export type ReviewState = 'draft' | 'approved' | 'rejected'
export type DataQuality =
  | 'measured'
  | 'meter-derived'
  | 'bill-derived'
  | 'imported'
  | 'user-entered'
  | 'estimated'
  | 'imputed'
  | 'pending-review'
  | 'rejected'
  | 'superseded'

export type EnergySource =
  | 'electricity'
  | 'diesel'
  | 'petrol'
  | 'lpg'
  | 'natural-gas'
  | 'renewable-generation'
  | 'other'

export type ActionStatus =
  | 'draft'
  | 'under-review'
  | 'approved'
  | 'planned'
  | 'in-progress'
  | 'completed'
  | 'deferred'
  | 'rejected'
  | 'verified'

export interface Workspace {
  id: string
  name: string
  slug: string
  countryCode: string
  currency: string
  timezone: string
  isDemo: boolean
}

export interface Site {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  notes?: string
}

export interface Facility {
  id: string
  siteId: string
  name: string
  type: string
  floorArea: number
  floorAreaUnit: 'm2' | 'ft2'
  occupancy: number
  operatingHours: number
  driverName?: string
  driverUnit?: string
  notes?: string
}

export interface Audit {
  id: string
  siteId: string
  facilityId: string
  name: string
  objective: string
  periodStart: string
  periodEnd: string
  scope: string
  boundary: string
  status: 'active' | 'completed' | 'archived'
  reviewState: ReviewState
}

export interface EvidenceDocument {
  id: string
  auditId: string
  filename: string
  documentType: string
  source: string
  period: string
  storagePath?: string
  mimeType: string
  sizeBytes: number
  reviewState: ReviewState
  isDemo: boolean
}

export interface EnergyRecord {
  id: string
  auditId: string
  facilityId: string
  evidenceId?: string
  period: string
  source: EnergySource
  rawQuantity: number
  rawUnit: string
  normalizedQuantity?: number
  normalizedUnit: 'kWh'
  normalizationStatus: 'not-required' | 'converted' | 'missing-factor'
  totalCost?: number
  unitRate?: number
  fixedCharge?: number
  costMethod?: 'direct-total' | 'rate-plus-fixed'
  dataQuality: DataQuality
  reviewState: ReviewState
  notes?: string
}

export interface ConversionFactor {
  id: string
  name: string
  source: EnergySource
  unitFrom: string
  unitTo: string
  value: number
  sourceName: string
  sourceUrl?: string
  vintage: string
  status: 'demo' | 'approved' | 'retired'
  notes?: string
}

export interface Equipment {
  id: string
  facilityId: string
  name: string
  category: string
  location: string
  quantity: number
  capacity?: number
  capacityUnit?: string
  operatingHours?: number
  installationYear?: number
  efficiency?: string
  condition: 'good' | 'fair' | 'poor' | 'unknown'
  dataQuality: DataQuality
  evidenceId?: string
  notes?: string
}

export interface Finding {
  id: string
  auditId: string
  title: string
  category: string
  problemStatement: string
  observation: string
  evidenceIds: string[]
  confidence: 'low' | 'medium' | 'high'
  status: ReviewState
}

export interface Recommendation {
  id: string
  auditId: string
  findingId?: string
  title: string
  intervention: string
  affectedSystem: string
  annualEnergySavings?: number
  annualCostSavings?: number
  implementationCost?: number
  simplePayback?: number
  confidence: 'low' | 'medium' | 'high'
  assumptions: string
  dependencies: string
  risks: string
  owner: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  status: ActionStatus
}

export interface CalculationResult {
  id: string
  auditId: string
  metric: string
  value?: number
  unit: string
  formulaName: string
  formulaVersion: string
  inputRecordIds: string[]
  period: string
  boundary: string
  factors: string[]
  warnings: string[]
  calculatedAt: string
  available: boolean
}

export interface PilotState {
  workspace: Workspace
  site: Site
  facility: Facility
  audit: Audit
  evidence: EvidenceDocument[]
  energyRecords: EnergyRecord[]
  factors: ConversionFactor[]
  equipment: Equipment[]
  findings: Finding[]
  recommendations: Recommendation[]
}
