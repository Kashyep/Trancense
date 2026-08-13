export default function WorkspaceLoading() {
  return <main className="page-pad" aria-busy="true" aria-live="polite"><p className="kicker">Loading private workspace</p><div className="mt-5 grid gap-5 md:grid-cols-3"><div className="data-card h-36 skeleton-block" /><div className="data-card h-36 skeleton-block" /><div className="data-card h-36 skeleton-block" /></div><section className="data-card mt-8 h-64 skeleton-block" /><span className="sr-only">Loading audit workspace.</span></main>;
}
