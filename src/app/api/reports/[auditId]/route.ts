import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { NextResponse } from 'next/server'
import { calculateEmissions, calculateEnergyIntensity, calculateHistoricalBaseline, calculateTotalCost, calculateTotalEnergy } from '@/lib/calculations'
import { demoState } from '@/lib/demo-data'
import { formatNumber } from '@/lib/format'

export const runtime = 'nodejs'

function addLine(page: ReturnType<PDFDocument['addPage']>, font: Awaited<ReturnType<PDFDocument['embedFont']>>, text: string, y: number, size = 10, color = rgb(0.12, 0.17, 0.14)) {
  page.drawText(text.slice(0, 112), { x: 48, y, size, font, color })
}

export async function GET(_request: Request, context: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await context.params
  if (auditId !== demoState.audit.id) return NextResponse.json({ error: 'Audit not found or not authorized.' }, { status: 404 })

  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const page = pdf.addPage([595, 842])
  let y = 790
  const green = rgb(0.09, 0.24, 0.19)
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.97, 0.98, 0.97) })
  page.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: green })
  page.drawText('TRANCENSE', { x: 48, y: 785, size: 14, font: bold, color: rgb(0.84, 0.95, 0.89) })
  page.drawText('Audit Workspace · Draft Report', { x: 48, y: 758, size: 9, font: regular, color: rgb(0.75, 0.88, 0.81) })
  page.drawText(demoState.audit.name, { x: 48, y: 695, size: 24, font: bold, color: green })
  page.drawText(demoState.facility.name, { x: 48, y: 666, size: 13, font: regular, color: rgb(0.35, 0.42, 0.38) })
  page.drawText(`${demoState.site.name} · ${demoState.site.city}, India`, { x: 48, y: 646, size: 10, font: regular, color: rgb(0.35, 0.42, 0.38) })
  page.drawRectangle({ x: 48, y: 583, width: 499, height: 38, color: rgb(1, 0.95, 0.84) })
  page.drawText('DRAFT — requires professional review; savings estimates are not guaranteed.', { x: 60, y: 598, size: 9, font: bold, color: rgb(0.52, 0.33, 0.08) })
  y = 535
  page.drawText('Executive summary', { x: 48, y, size: 16, font: bold, color: green }); y -= 24
  const total = calculateTotalEnergy(demoState.energyRecords, `${demoState.audit.periodStart} to ${demoState.audit.periodEnd}`, demoState.audit.boundary)
  const baseline = calculateHistoricalBaseline(demoState.energyRecords, `${demoState.audit.periodStart} to ${demoState.audit.periodEnd}`, demoState.audit.boundary)
  const intensity = calculateEnergyIntensity(total, demoState.facility, `${demoState.audit.periodStart} to ${demoState.audit.periodEnd}`, demoState.audit.boundary)
  const cost = calculateTotalCost(demoState.energyRecords, `${demoState.audit.periodStart} to ${demoState.audit.periodEnd}`, demoState.audit.boundary)
  const emissions = calculateEmissions(demoState.energyRecords, demoState.factors[0].value, demoState.factors[0].id, `${demoState.audit.periodStart} to ${demoState.audit.periodEnd}`, demoState.audit.boundary)
  const summary = `This draft assessment covers ${demoState.audit.boundary}. It uses ${demoState.energyRecords.length} monthly bill-derived records, all currently approved in the demo state. The results are intended to support auditor review and prioritization.`
  addLine(page, regular, summary, y, 10); y -= 20; addLine(page, regular, 'The report separates evidence, deterministic analysis, and decisions. Missing or demo assumptions are shown explicitly.', y, 10); y -= 42
  page.drawText('Scope and method', { x: 48, y, size: 16, font: bold, color: green }); y -= 25
  addLine(page, regular, `Objective: ${demoState.audit.objective}`, y); y -= 18
  addLine(page, regular, `Period: ${demoState.audit.periodStart} to ${demoState.audit.periodEnd}`, y); y -= 18
  addLine(page, regular, `Boundary: ${demoState.audit.boundary}`, y); y -= 18
  addLine(page, regular, `Evidence: ${demoState.evidence.map((item) => item.filename).join(', ')}`, y); y -= 40
  page.drawText('Analysis snapshot', { x: 48, y, size: 16, font: bold, color: green }); y -= 27
  const metrics = [[`Total approved energy`, `${formatNumber(total.value)} kWh`], [`Historical baseline`, `${formatNumber(baseline.value)} kWh/month`], [`Energy intensity`, `${formatNumber(intensity.value, 1)} kWh/m²`], [`Total cost`, `INR ${formatNumber(cost.value)}`], [`Emissions`, `${formatNumber(emissions.value, 1)} kgCO₂e`]]
  for (const [label, value] of metrics) { page.drawText(label, { x: 58, y, size: 10, font: regular }); page.drawText(value, { x: 350, y, size: 10, font: bold, color: green }); y -= 22 }
  y -= 14; page.drawText('Data-quality and limitations', { x: 48, y, size: 16, font: bold, color: green }); y -= 25
  addLine(page, regular, '• Values are bill-derived and manually entered; document contents were not extracted automatically.', y); y -= 18
  addLine(page, regular, '• The displayed emissions factor is a demo value and must be replaced with an approved Indian source.', y); y -= 18
  addLine(page, regular, '• This document is not a certified regulatory submission or a guarantee of savings.', y); y -= 40
  page.drawText('Recommendations', { x: 48, y, size: 16, font: bold, color: green }); y -= 25
  demoState.recommendations.forEach((item) => { addLine(page, bold, item.title, y, 10, green); y -= 17; addLine(page, regular, `${item.intervention} Estimated annual cost savings: INR ${formatNumber(item.annualCostSavings)}. Status: ${item.status}.`, y); y -= 27 })
  y -= 12; page.drawText('Evidence index', { x: 48, y, size: 16, font: bold, color: green }); y -= 25
  demoState.evidence.forEach((item) => { addLine(page, regular, `${item.filename} · ${item.source} · ${item.period} · ${item.reviewState}`, y); y -= 18 })
  y -= 10; addLine(page, regular, `Generated ${new Date().toLocaleString('en-IN')} · Report version v1 · Requested from authorized pilot workspace`, y, 8, rgb(0.4, 0.46, 0.42))
  const bytes = await pdf.save()
  return new NextResponse(Buffer.from(bytes), { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="trancense-${auditId}-draft-report.pdf"`, 'Cache-Control': 'no-store' } })
}
