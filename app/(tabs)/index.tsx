import { router } from "expo-router";
import HomeScreen from "../../components/HomeScreen";

// Define valid grid configurations
const VALID_GRIDS = [
  { rows: 2, cols: 3 },
  { rows: 3, cols: 3 },
  { rows: 3, cols: 4 },
  { rows: 4, cols: 4 },
] as const;

export default function Index() {
  const handleSelectGrid = (rows: number, cols: number) => {
    // Validate grid configuration
    const isValidGrid = VALID_GRIDS.some(
      (grid) => grid.rows === rows && grid.cols === cols
    );

    if (!isValidGrid) {
      console.warn("Invalid grid configuration");
      return;
    }

    router.push({
      pathname: "/(game)/[id]",
      params: {
        id: `${rows}-${cols}`,
        rows: rows.toString(),
        cols: cols.toString(),
      },
    });
  };

  return <HomeScreen onSelectGrid={handleSelectGrid} />;
}
