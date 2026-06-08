import {Skeleton} from "@/components/ui/skeleton";
import {TableBody, TableCell, TableRow} from "@/components/ui/table.ui";
import type {FC} from "react";

const SKELETON_ROWS = 5;

interface Props {
  columns: string[];
}

export const TableSkeleton: FC<Props> = ({columns}) => {
  return (
    <TableBody>
      {Array.from({length: SKELETON_ROWS}).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column) => (
            <TableCell key={column}>
              <Skeleton className="h-4 max-w-32" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};
