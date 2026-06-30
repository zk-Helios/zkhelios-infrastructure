import { Card, CardTitle } from "@zkhelios/ui";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, toolbar, children, className }: ChartCardProps) {
  return (
    <Card padding="md" className={cn("flex flex-col", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <CardTitle className="text-h6">{title}</CardTitle>
        {toolbar}
      </div>
      {children}
    </Card>
  );
}
