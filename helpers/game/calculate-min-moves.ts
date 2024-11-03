import { getManhattanDistance } from "./get-manhattan-distance";
import { getTargetPosition } from "./get-target-position";

export const calculateMinimumMoves = (grid: (number | null)[][], rows: number, cols: number): number => {
    let totalDistance = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const number = grid[i][j];
            if (number !== null) {
                const target = getTargetPosition(number, rows, cols);
                totalDistance += getManhattanDistance({ row: i, col: j }, target);
            }
        }
    }
    return totalDistance;
};