import { Text, View, StyleSheet } from "react-native";

type EventCardProps = {
  description?: string;
  hostId: string;
  location: string;
  title: string;
};

export default function EventCard(props: EventCardProps) {
  function getLocation() {
    return props.location;
  }

  function getHost() {
    return props.hostId;
  }

  return (
    <View>
      <Text>{props.title}</Text>
      <Text>{getHost()}</Text>
      <Text>{getLocation()}</Text>
    </View>
  );
}
