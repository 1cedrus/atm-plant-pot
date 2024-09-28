import {
  Button,
  StyleSheet,
  Switch,
  Text,
  View,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { useState } from "react";
import { WateringMode, WateringReminder } from "@/types";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { Divider, IconButton } from "react-native-paper";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const mockReminder: Record<number, WateringReminder> = {
  1: {
    time: new Date(Date.now()),
    duration: 10,
    isOn: true,
  },
  2: {
    time: new Date(Date.now()),
    duration: 10,
    isOn: true,
  },
  3: {
    time: new Date(Date.now()),
    duration: 10,
    isOn: true,
  },
};

export default function WateringView() {
  const [mode, setMode] = useState<WateringMode>(WateringMode.AUTO);
  const [time, setTime] = useState<number>(10);
  const [reminder, setReminder] =
    useState<Record<number, WateringReminder>>(mockReminder);
  const [threshold, setThreshold] = useState(50);
  const [modalVisible, setModalVisible] = useState(false);

  const handleModeChange = (selectedMode: WateringMode) => {
    if (mode === selectedMode) {
      return setMode((prev) =>
        prev === WateringMode.AUTO ? WateringMode.MANUAL : WateringMode.AUTO
      );
    }

    setMode(selectedMode);
  };

  return (
    <View style={styles.container}>
      <View style={{ gap: 20 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Automatically water the plants</Text>
          <Switch
            value={mode === WateringMode.AUTO}
            onChange={() => handleModeChange(WateringMode.AUTO)}
            trackColor={{ false: "#767577", true: "#000" }}
            thumbColor="#f4f3f4"
          />
        </View>
        <View>
          <Text>
            Pick threshold if the soil moisture is below the pot will water the
            plants
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingTop: 10,
            }}
          >
            <Slider
              style={{ flex: 1 }}
              value={threshold}
              onValueChange={setThreshold}
              minimumValue={0}
              maximumValue={100}
              step={5}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#767577"
              disabled={mode !== WateringMode.AUTO}
            />
            <Text>{threshold}%</Text>
          </View>
        </View>
        <View>
          <Text>Choose water duration</Text>
          <Picker
            selectedValue={time}
            enabled={mode === WateringMode.AUTO}
            onValueChange={(itemValue, itemIndex) => setTime(itemValue)}
          >
            <Picker.Item label="5s" value={5} />
            <Picker.Item label="10s" value={10} />
            <Picker.Item label="20s" value={15} />
            <Picker.Item label="25s" value={25} />
            <Picker.Item label="30s" value={30} />
            <Picker.Item label="60s" value={60} />
          </Picker>
        </View>
      </View>
      <Divider bold={true} />
      <View style={{ gap: 10 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Manually water the plants</Text>
          <Switch
            value={mode === WateringMode.MANUAL}
            onChange={() => handleModeChange(WateringMode.MANUAL)}
            trackColor={{ false: "#767577", true: "#000" }}
            thumbColor="#f4f3f4"
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>Add new reminder</Text>
          <AddReminderModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
          />
          <IconButton
            icon="plus"
            onPress={() => setModalVisible(true)}
            iconColor="#000"
            disabled={mode !== WateringMode.MANUAL}
          />
        </View>
        <View>
          {Object.values(reminder).map((value, index) => (
            <ReminderCard
              key={index}
              index={index}
              reminder={value}
              isDisabled={mode !== WateringMode.MANUAL}
              setReminder={setReminder}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface AddReminderButtonProps {
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
}

function AddReminderModal({
  modalVisible,
  setModalVisible,
}: AddReminderButtonProps) {
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.cardTitle}>Add new reminder</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Choose time to water</Text>
            <Text onPress={() => setShowPicker(true)}>
              {time.toTimeString()}
            </Text>
          </View>
          <View>
            <Text>Choose water duration</Text>
            <Picker
              placeholder="Duration"
              selectedValue={duration}
              onValueChange={setDuration}
            >
              <Picker.Item label="5s" value={5} />
              <Picker.Item label="10s" value={10} />
              <Picker.Item label="20s" value={15} />
              <Picker.Item label="25s" value={25} />
              <Picker.Item label="30s" value={30} />
              <Picker.Item label="60s" value={60} />
            </Picker>
          </View>
          {showPicker && (
            <RNDateTimePicker
              mode="time"
              display="spinner"
              value={time}
              onChange={(e) => {
                setShowPicker(false);
                setTime(new Date(e.nativeEvent.timestamp));
              }}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <Pressable
              style={styles.button}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={styles.text}>Cancel</Text>
            </Pressable>
            <Pressable
              style={{ ...styles.button, backgroundColor: "black" }}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text
                style={{
                  ...styles.text,
                  color: "white",
                  paddingHorizontal: 20,
                }}
              >
                Add
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ReminderCardProps {
  index: number;
  reminder: WateringReminder;
  setReminder: (reminder: Record<number, WateringReminder>) => void;
  isDisabled: boolean;
}

function ReminderCard({
  index,
  reminder,
  setReminder,
  isDisabled,
}: ReminderCardProps) {
  const [on, setOn] = useState(true);

  return (
    <View style={styles.card}>
      <View>
        <Text>{`Time: ${reminder.time.toTimeString()}`}</Text>
        <Text>{`Duration: ${reminder.duration}s`}</Text>
      </View>
      <Switch
        disabled={isDisabled}
        value={on}
        onValueChange={setOn}
        trackColor={{ false: "#767577", true: "#000" }}
        thumbColor="#f4f3f4"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
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
