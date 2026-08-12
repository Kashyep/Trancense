export type SolarInputs = {
  roofArea: number;
  exclusions: number;
  moduleW: number;
  moduleArea: number;
  yieldKwhPerKw: number;
  losses: number;
  selfConsumption: number;
  capex: number;
  annualOm: number;
  tariff: number;
  life: number;
  discountRate: number;
  degradation: number;
};

function bounded(value: number, min = 0, max = Number.POSITIVE_INFINITY) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

export function simplePayback(capex: number, annualSavings: number) {
  return annualSavings > 0 ? bounded(capex) / annualSavings : null;
}

export function solarModel(input: SolarInputs) {
  const usableArea = Math.max(0, bounded(input.roofArea) - bounded(input.exclusions));
  const capacityKw = input.moduleArea > 0 ? usableArea / input.moduleArea * bounded(input.moduleW) / 1000 : 0;
  const generation = capacityKw * bounded(input.yieldKwhPerKw) * (1 - bounded(input.losses, 0, 1));
  const selfConsumed = generation * bounded(input.selfConsumption, 0, 1);
  const exported = Math.max(0, generation - selfConsumed);
  const annualBenefit = selfConsumed * bounded(input.tariff) + exported * bounded(input.tariff) * 0.7;
  const life = Math.floor(bounded(input.life));
  const flows = [-bounded(input.capex), ...Array.from({ length: life }, (_, year) => annualBenefit * Math.pow(1 - bounded(input.degradation, 0, 1), year) - bounded(input.annualOm))];
  const npv = flows.reduce((total, flow, year) => total + flow / Math.pow(1 + bounded(input.discountRate), year), 0);
  const annualNet = flows[1] ?? 0;
  return { usableArea, capacityKw, generation, selfConsumed, exported, annualBenefit, payback: simplePayback(input.capex, annualNet), npv, lcoe: life > 0 && generation > 0 ? bounded(input.capex) / (generation * life) : null, flows };
}
