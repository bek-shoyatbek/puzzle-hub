export const getManhattanDistance = (
    current: { row: number; col: number },
    target: { row: number; col: number }
): number => {
    return (
        Math.abs(current.row - target.row) + Math.abs(current.col - target.col)
    );
};