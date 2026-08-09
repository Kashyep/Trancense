import { clsx } from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
type Variant="primary"|"secondary"|"ghost"|"destructive";
export function Button({children,variant="primary",className,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:Variant}){return <button className={clsx("button",`button-${variant}`,className)} {...props}>{children}</button>}
export function ActionLink({href,children,variant="primary",className}:{href:string;children:ReactNode;variant?:"primary"|"secondary"|"ghost";className?:string}){return <Link href={href} className={clsx("button",`button-${variant}`,className)}>{children}</Link>}
export function Badge({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"good"|"warning"|"blue"}){const classes={neutral:"tag",good:"tag tag-warm",warning:"tag tag-alert",blue:"tag tag-plain"};return <span className={classes[tone]}>{children}</span>}
export function EmptyState({title,children,action}:{title:string;children:ReactNode;action?:ReactNode}){return <section className="feature-card p-8 sm:p-10"><p className="eyebrow">A clear next step</p><h2 className="mt-3">{title}</h2><p className="mt-4 max-w-xl muted">{children}</p>{action&&<div className="mt-6">{action}</div>}</section>}
