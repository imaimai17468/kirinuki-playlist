import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  icon = <FileQuestion className="h-12 w-12 text-muted-foreground/50" />,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex justify-center">{icon}</div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>
    </div>
  );
};
