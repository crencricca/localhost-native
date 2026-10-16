import { Text, View, StyleSheet } from "react-native";
import EventCard from "@/components/EventCard/EventCard";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text className="text-xl">My Events</Text>
      <EventCard
        hostId="123"
        location="Jersey City, NJ"
        title="Poke Bowl Party"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
