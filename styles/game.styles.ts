import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 8,
    borderRadius: 8,
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  resetButton: {
    backgroundColor: "#FF9800",
    padding: 12,
    borderRadius: 8,
  },
  grid: {
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 5,
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tileContainer: {
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  tile: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  movableTile: {
    borderColor: "rgba(255,255,255,0.2)",
  },
  tileText: {
    color: "#fff",
    fontWeight: "bold",
  },
  exitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#f44336",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  exitButtonText: {
    color: "#f44336",
    fontSize: 18,
    fontWeight: "600",
  }
});