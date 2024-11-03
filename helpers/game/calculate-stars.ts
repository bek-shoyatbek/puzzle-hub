export const calculateStars = (moves: number, minMoves: number): number => {
    const ratio = moves / minMoves;
    if (ratio <= 1.2) return 3;
    if (ratio <= 1.5) return 2;
    return 1;
};