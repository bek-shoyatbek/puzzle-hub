export const isSolvable = (puzzle: (number | null)[], rows: number, cols: number): boolean => {
    const numbers = puzzle.filter((n) => n !== null) as number[];
    let inversions = 0;

    for (let i = 0; i < numbers.length - 1; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            if (numbers[i] > numbers[j]) {
                inversions++;
            }
        }
    }

    if (cols % 2 === 1) {
        return inversions % 2 === 0;
    }

    const emptyRowFromBottom = rows - Math.floor(puzzle.indexOf(null) / cols);
    return (emptyRowFromBottom % 2 === 0) === (inversions % 2 === 0);
};