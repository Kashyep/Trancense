export const siteContent = {
  brand: "Trancense",
  nav: [{ label: "Platform", href: "/product" }, { label: "How it works", href: "/how-it-works" }, { label: "For audit teams", href: "/consultants" }, { label: "For facility teams", href: "/facility-teams" }, { label: "Security", href: "/security" }],
  hero: { eyebrow: "Evidence-first energy audits", title: "Turn energy evidence into defensible action.", body: "Trancense helps energy auditors structure evidence, review data, explain calculations, and turn findings into accountable action.", primary: "Request a pilot", secondary: "Explore the platform" },
  chain: ["Evidence", "Approved data", "Reproducible calculation", "Reviewable finding", "Accountable action", "Measured verification"],
  principles: ["Original values remain visible alongside normalized units.", "Approval states keep draft and rejected inputs out of trusted calculations.", "Every result carries its boundary, formula, assumptions, warnings, and sources.", "A completed action is not presented as verified savings."],
  provisional: "[Provisional copy — replace with approved founder/team contact details before public launch.]",
} as const;
