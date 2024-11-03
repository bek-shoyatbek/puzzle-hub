export const getTargetPosition = (number: number, rows: number, cols: number): { row: number; col: number } => {
    if (number === null) {
        return { row: rows - 1, col: cols - 1 };
    }
    const pos = number - 1;
    return {
        row: Math.floor(pos / cols),
        col: pos % cols,
    };
};