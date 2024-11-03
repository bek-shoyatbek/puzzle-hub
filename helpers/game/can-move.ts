import { Position } from "@/types/game";

export const canMove = (row: number, col: number, emptyPosition: Position): boolean => {
    return (
      (Math.abs(row - emptyPosition.row) === 1 && col === emptyPosition.col) ||
      (Math.abs(col - emptyPosition.col) === 1 && row === emptyPosition.row)
    );
  };