import {AlertCircleIcon} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import type {FC} from "react";

interface Props {
  message: string;
  onRetry: () => void;
}

export const ProductErrorAlert: FC<Props> = ({message, onRetry}) => {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Failed to load products</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
};
