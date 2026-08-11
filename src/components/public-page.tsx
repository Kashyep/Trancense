import { PublicFooter, PublicHeader } from "@/components/public-header";

export function PublicPage({ children }: { children: React.ReactNode }) {
  return <main><PublicHeader />{children}<PublicFooter /></main>;
}
