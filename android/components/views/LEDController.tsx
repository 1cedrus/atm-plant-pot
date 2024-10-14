import { Pressable, StyleSheet, Text, View, Modal } from "react-native";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import ColorPicker from "react-native-wheel-color-picker";
import { Divider } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LED, LEDMode, LEDState, WebSocketEventType } from "@/types";
import {
  getLEDCustomSettings,
  getLEDMode,
  setLEDMode,
  updateLED,
} from "@/apis";
import RadioGroup from "react-native-radio-buttons-group";
import { useBackdrop } from "../Backdrop";
import { useExpoRouter } from "expo-router/build/global-state/router-store";

export default function LEDController() {
  const [brightness, setBrightness] = useState<number>(0);
  const { onClose, onOpen } = useBackdrop();
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const [selectedLED, setSelectedLED] = useState<LED>();
  const [settings, setSettings] = useState<Record<number, LED>>({});

  const radioButtons = useMemo(
    () => [
      {
        id: LEDMode.Realtime,
        label: "Realtime",
        value: LEDMode.Realtime,
      },
      {
        id: LEDMode.Off,
        label: "Off",
        value: LEDMode.Off,
      },
      {
        id: LEDMode.Custom,
        label: "Custom",
        value: LEDMode.Custom,
      },
    ],
    []
  );

  useQuery({
    queryKey: [LEDMode.Custom],
    queryFn: async () => {
      const res = await getLEDCustomSettings();
      const settings: Record<number, LED> = res.reduce(
        (_s, curr) => ({
          [curr.id]: curr,
          ..._s,
        }),
        {} as Record<number, LED>
      );

      setSettings(settings);

      return res;
    },
  });

  const { data: ledMode } = useQuery({
    queryKey: [WebSocketEventType.LEDMode],
    queryFn: getLEDMode,
  });

  const updateLEDModeMutation = useMutation({
    mutationFn: (mode: LEDMode) => setLEDMode(mode),
    onSuccess: (_, mode) => {
      queryClient.setQueryData([WebSocketEventType.LEDMode], mode);
    },
  });

  const updateLEDMutation = useMutation({
    mutationFn: (LED: LED) => {
      const { id, state, red, green, blue, brightness } = LED;
      return updateLED(
        `${id},${red},${green},${blue},${brightness.toFixed(0)},${state}`
      );
    },
    onSuccess: (_, LED) => {
      setSettings((prev) => ({ ...prev, [LED.id]: LED }));

      if (selectedLED?.id === LED.id) {
        setSelectedLED(LED);
      }
    },
  });

  useEffect(() => {
    if (!selectedLED) {
      return;
    }

    const timeout = setTimeout(() => {
      updateLEDMutation.mutate({ ...selectedLED, brightness });
    }, 100);

    return () => clearTimeout(timeout);
  }, [brightness]);

  useEffect(() => {
    if (!ledMode || !Object.keys(settings).length) {
      onOpen();
    } else {
      onClose();
    }

    return () => onClose();
  }, [ledMode, settings]);

  const selectLED = (id: number) => {
    if (id === 0) {
      setSelectedLED(undefined);
    } else {
      setSelectedLED(settings![id]);
      setBrightness(settings![id].brightness);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>LED Mode</Text>
          <RadioGroup
            radioButtons={radioButtons}
            onPress={(value) => updateLEDModeMutation.mutate(value as LEDMode)}
            selectedId={ledMode}
          />
        </View>
        <Text>
          You can custom the LEDs on your own here, but when turn it on the
          realtime LEDs reflection will be disabled
        </Text>
        <Divider />
        {ledMode === LEDMode.Custom && (
          <View>
            <View>
              <Text style={{ fontWeight: 700 }}>LED to custom</Text>
              <Picker
                selectedValue={selectedLED?.id}
                onValueChange={selectLED}
                placeholder="Select a LED"
              >
                <Picker.Item label={"Choose one"} value={0} />
                <Picker.Item label={"LED 1"} value={1} />
                <Picker.Item label={"LED 2"} value={2} />
                <Picker.Item label={"LED 3"} value={3} />
              </Picker>
            </View>
            {selectedLED && (
              <>
                <View>
                  <Text style={{ fontWeight: 700 }}>State</Text>
                  <Picker
                    selectedValue={selectedLED?.state}
                    onValueChange={(value) => {
                      if (value === selectedLED.state) return;
                      updateLEDMutation.mutate({
                        ...selectedLED,
                        state: value,
                      });
                    }}
                  >
                    <Picker.Item label="On" value={LEDState.On} />
                    <Picker.Item label="Starlight" value={LEDState.Starlight} />
                    <Picker.Item label="Off" value={LEDState.Off} />
                  </Picker>
                </View>
                <View>
                  <Text style={{ fontWeight: 700 }}>Color</Text>
                  <Pressable
                    style={{
                      ...styles.button,
                      backgroundColor: `rgb(${selectedLED.red},${selectedLED.green},${selectedLED.blue})`,
                      height: 35,
                      marginVertical: 10,
                    }}
                    onPress={() => setModalVisible(true)}
                  ></Pressable>
                </View>
                <View>
                  <Text style={{ fontWeight: 700 }}>Brightness</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingTop: 10,
                    }}
                  >
                    <Slider
                      style={{ flex: 1 }}
                      value={Math.trunc((brightness / 255) * 100)}
                      onValueChange={(value) =>
                        setBrightness(Math.trunc((value / 100) * 255))
                      }
                      minimumValue={0}
                      maximumValue={100}
                      step={5}
                      minimumTrackTintColor="#000000"
                      maximumTrackTintColor="#767577"
                    />
                    <Text>{Math.trunc((brightness / 255) * 100)}%</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>
      {selectedLED && (
        <ColorController
          key={selectedLED.id}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedLED={selectedLED}
          setSelectedLED={setSelectedLED}
          setSettings={setSettings}
        />
      )}
    </>
  );
}

interface ColorControllerProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedLED: LED;
  setSelectedLED: (state: SetStateAction<LED | undefined>) => void;
  setSettings: (state: SetStateAction<Record<number, LED>>) => void;
}

function ColorController({
  modalVisible,
  setModalVisible,
  selectedLED,
  setSettings,
  setSelectedLED,
}: ColorControllerProps) {
  const [color, setColor] =
    useState(`#${selectedLED.red.toString(16).padStart(2, "0")}${selectedLED.green.toString(16).padStart(2, "0")}${selectedLED.blue.toString(16).padStart(2, "0")}
                      `);

  const updateLEDMutation = useMutation({
    mutationFn: (LED: LED) => {
      const { id, state, red, green, blue, brightness } = LED;
      return updateLED(
        `${id},${red},${green},${blue},${brightness.toFixed(0)},${state}`
      );
    },
    onSuccess: (_, LED) => {
      setSettings((prev) => ({ ...prev, [LED.id]: LED }));
      setSelectedLED(LED);
    },
  });

  useEffect(() => {
    if (
      color ===
      `#${selectedLED.red.toString(16).padStart(2, "0")}${selectedLED.green.toString(16).padStart(2, "0")}${selectedLED.blue.toString(16).padStart(2, "0")}`
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      const [red, green, blue] = color
        .slice(1)
        .match(/.{2}/g)!
        .map((v) => parseInt(v, 16));

      updateLEDMutation.mutate({ ...selectedLED, red, green, blue });
    }, 100);

    return () => clearTimeout(timeout);
  }, [color]);

  if (!selectedLED) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.cardTitle}>Pick colorrs</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cardTitle}>Close</Text>
            </Pressable>
          </View>
          <ColorPicker color={color} onColorChange={setColor} />
        </View>
      </View>
    </Modal>
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
  },
  modalView: {
    height: "100%",
    backgroundColor: "white",
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
    borderRadius: 10,
    padding: 10,
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
