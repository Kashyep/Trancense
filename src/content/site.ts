export const siteContent = {
  brand: "Trancense",
  nav: [{ label: "Platform", href: "/product" }, { label: "How it works", href: "/how-it-works" }, { label: "For audit teams", href: "/consultants" }, { label: "For facility teams", href: "/facility-teams" }, { label: "Security", href: "/security" }],
  hero: { eyebrow: "Evidence-first energy audits", title: "Turn energy evidence into defensible action.", body: "Trancense helps energy auditors structure evidence, review data, explain calculations, and turn findings into accountable action.", primary: "Request a pilot", secondary: "Explore the platform" },
  audiences: [
    ["Consultants and auditors", "Keep source evidence, assumptions, calculations, findings, and actions connected in one reviewable record."],
    ["Facility teams", "Give the people responsible for action a clear view of what was observed, what was approved, and what still needs verification."],
    ["Pilot owners", "Start with a bounded scope, agreed success criteria, and a named owner for the review and response process."],
  ],
  chain: ["Evidence", "Approved data", "Reproducible calculation", "Reviewable finding", "Accountable action", "Measured verification"],
  principles: ["Original values remain visible alongside normalized units.", "Approval states keep draft and rejected inputs out of trusted calculations.", "Every result carries its boundary, formula, assumptions, warnings, and sources.", "A completed action is not presented as verified savings."],
  faqs: [
    ["Who is Trancense for?", "It is designed for energy consultants, auditors, and facility teams that need the reasoning behind an energy finding to remain easy to inspect."],
    ["What does a pilot include?", "A pilot starts with an agreed facility context, evidence scope, review process, and success criteria. The exact included and excluded features are confirmed before work begins."],
    ["Does Trancense certify audits or guarantee savings?", "No. Trancense is decision support. It does not certify an audit, determine regulatory compliance, replace a qualified auditor, or guarantee savings."],
    ["What should I bring to a pilot conversation?", "Bring the facility type, intended audit scope, available evidence, and the person responsible for coordinating the review."],
  ],
  provisional: "Evidence-first energy-audit software for Indian audit teams. Pilot conversations begin with a defined scope, review path, and support owner.",
} as const;
