import { cn } from "../../lib/utils"

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("border-b border-border bg-muted/50", className)} {...props} />
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableFooter({ className, ...props }) {
  return <tfoot className={cn("border-t border-border bg-muted/50 font-medium", className)} {...props} />
}

export function TableRow({ className, ...props }) {
  return <tr className={cn("border-b border-border hover:bg-muted/50 transition-colors", className)} {...props} />
}

export function TableHead({ className, ...props }) {
  return (
    <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", className)} {...props} />
  )
}

export function TableCell({ className, ...props }) {
  return <td className={cn("p-4 align-middle", className)} {...props} />
}
