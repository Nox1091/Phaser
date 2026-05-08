import { Button } from "@/components/ui/button";

type ActionButtonProps = {
  text: string;
  onClick: () => void;
  className?: string;
};

export function ActionButton({
  text,
  onClick,
  className = "",
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`px-4 py-3 rounded-lg font-semibold transition-colors shadow-lg min-w-[110px] ${className}`}
    >
      {text}
    </Button>
  );
}
