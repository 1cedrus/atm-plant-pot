import { View, Text, StyleSheet } from "react-native";
import WateringView from "@/components/views/WateringView";

export default function WateringMode() {
  return <WateringView />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
