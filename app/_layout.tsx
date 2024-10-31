import { Slot } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Slot />;
}
