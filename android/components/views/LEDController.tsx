import { StyleSheet, Switch, Text, View } from "react-native";
import { useState } from "react";
import { Divider } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { LEDSettings } from "@/types";

const mockLED: Record<number, LEDSettings> = {
  1: {
    red: 100,
    blue: 200,
    green: 100,
    brightness: 100,
    isOn: true,
  },
  2: {
    red: 100,
    blue: 200,
    green: 100,
    brightness: 80,
    isOn: false,
  },
  3: {
    red: 100,
    blue: 200,
    green: 100,
    brightness: 20,
    isOn: true,
  },
};

export default function LEDController() {
  const [custom, setCustom] = useState(false);
  const [LEDs, setLEDs] = useState<Record<number, LEDSettings>>(mockLED);
  const [index, setIndex] = useState(1);

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Custom</Text>
        <Switch
          value={custom}
          onValueChange={setCustom}
          trackColor={{ false: "#767577", true: "#000" }}
          thumbColor="#f4f3f4"
        />
      </View>
      <Text>
        You can custom the LEDs on your own here, but when turn it on the
        realtime LEDs reflection will be disabled
      </Text>
      <Divider />
      <View>
        <Text>Choose the LED to custom</Text>
        <Picker selectedValue={index} enabled={custom} onValueChange={setIndex}>
          {Object.keys(LEDs).map((key) => (
            <Picker.Item key={key} label={key.toString()} value={key} />
          ))}
        </Picker>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text>State</Text>
        <Switch
          value={LEDs[index].isOn}
          onValueChange={() => {}}
          trackColor={{ false: "#767577", true: "#000" }}
          thumbColor="#f4f3f4"
        />
      </View>
      <View>
        <Text>Brightness</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 10,
          }}
        >
          <Slider
            style={{ flex: 1 }}
            value={LEDs[index].brightness}
            onValueChange={() => {}}
            minimumValue={0}
            maximumValue={100}
            step={5}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#767577"
          />
          <Text>{LEDs[index].brightness}</Text>
        </View>
      </View>
      <View>
        <Text>Color</Text>
        <View style={{ paddingLeft: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 10,
            }}
          >
            <Text style={{ width: 40 }}>Red</Text>
            <Slider
              style={{ flex: 1 }}
              value={LEDs[index].red}
              onValueChange={() => {}}
              minimumValue={0}
              maximumValue={100}
              step={5}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#767577"
            />
            <Text>{LEDs[index].red}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 10,
            }}
          >
            <Text style={{ width: 40 }}>Blue</Text>
            <Slider
              style={{ flex: 1 }}
              value={LEDs[index].blue}
              onValueChange={() => {}}
              minimumValue={0}
              maximumValue={100}
              step={5}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#767577"
            />
            <Text>{LEDs[index].blue}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 10,
            }}
          >
            <Text style={{ width: 40 }}>Green</Text>
            <Slider
              style={{ flex: 1 }}
              value={LEDs[index].green}
              onValueChange={() => {}}
              minimumValue={0}
              maximumValue={100}
              step={5}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#767577"
            />
            <Text>{LEDs[index].green}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    gap: 10,
  },
  card: {
    borderStyle: "solid",
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dataText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  errorCard: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    //   alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    gap: 20,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "gray",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
});
