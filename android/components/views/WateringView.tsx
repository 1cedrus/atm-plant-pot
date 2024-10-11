import {
  StyleSheet,
  Switch,
  Text,
  View,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  AutomaticSettings,
  ManualSettings,
  Reminder,
  WateringMode,
  WebSocketEventType,
} from "@/types";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { Divider, IconButton } from "react-native-paper";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteReminder,
  getWateringMode,
  getWateringModeSettings,
  newReminder,
  setWateringMode,
  updateReminder,
  updateWateringModeSettings,
} from "@/apis";
import dayjs from "dayjs";
import { Swipeable } from "react-native-gesture-handler";
import { useBackdrop } from "../Backdrop";

export default function WateringView() {
  const [modalVisible, setModalVisible] = useState(false);
  const { onOpen, onClose } = useBackdrop();
  const [_threshold, setThreshold] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const queryClient = useQueryClient();

  const wateringModeMutation = useMutation({
    mutationFn: (selectedMode: WateringMode) => {
      if (mode === selectedMode) {
        return setWateringMode(
          selectedMode === WateringMode.Automatic
            ? WateringMode.Manual
            : WateringMode.Automatic
        );
      }

      return setWateringMode(selectedMode);
    },
    onSuccess: () =>
      queryClient.setQueryData([WebSocketEventType.WateringMode], (old) =>
        old === WateringMode.Automatic
          ? WateringMode.Manual
          : WateringMode.Automatic
      ),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: AutomaticSettings) =>
      updateWateringModeSettings(settings),
    onSuccess: (_, settings) => {
      queryClient.setQueryData([WateringMode.Automatic], settings);
    },
  });

  const { data: mode } = useQuery({
    queryKey: [WebSocketEventType.WateringMode],
    queryFn: getWateringMode,
  });

  const { data: manualSettings } = useQuery({
    queryKey: [WateringMode.Manual],
    queryFn: () => getWateringModeSettings(WateringMode.Manual),
  });

  const { data: automationSettings } = useQuery({
    queryKey: [WateringMode.Automatic],
    queryFn: async () => {
      const res = (await getWateringModeSettings(
        WateringMode.Automatic
      )) as AutomaticSettings;

      setThreshold(res.threshold || 0);

      return res;
    },
  });

  useEffect(() => {
    if (_threshold === automationSettings?.threshold) return;

    timerRef.current = setTimeout(
      () =>
        updateSettingsMutation.mutate({
          ...(automationSettings as AutomaticSettings),
          threshold: _threshold,
        }),
      500
    );

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [_threshold]);

  useEffect(() => {
    if (!mode || !manualSettings || !automationSettings) {
      onOpen;
    } else {
      onClose();
    }
  }, [mode, manualSettings, automationSettings]);

  if (!mode || !manualSettings || !automationSettings) {
    return null;
  }

  const { duration } = automationSettings as AutomaticSettings;
  const reminders = (manualSettings as ManualSettings)?.reminders.sort(
    (a, b) => a.id! - b.id!
  );

  return (
    <View style={[styles.container]}>
      <View style={{ gap: 20 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Automatically water the plants</Text>
          <Switch
            value={mode === WateringMode.Automatic}
            onChange={() => wateringModeMutation.mutate(WateringMode.Automatic)}
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
              value={Math.trunc((_threshold / 4095) * 100)}
              onValueChange={(value) =>
                setThreshold(Math.trunc((value / 100) * 4095))
              }
              minimumValue={0}
              maximumValue={100}
              step={5}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#767577"
              disabled={mode !== WateringMode.Automatic}
            />
            <Text>{Math.trunc((_threshold / 4095) * 100)}%</Text>
          </View>
        </View>
        <View>
          <Text>Choose water duration</Text>
          <Picker
            selectedValue={duration}
            enabled={mode === WateringMode.Automatic}
            onValueChange={(value) =>
              updateSettingsMutation.mutate({
                ...automationSettings,
                duration: value,
              })
            }
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
            value={mode === WateringMode.Manual}
            onChange={() => wateringModeMutation.mutate(WateringMode.Manual)}
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
            disabled={mode !== WateringMode.Manual}
          />
        </View>
        <View>
          {reminders.map((reminder, index) => (
            <ReminderCard
              key={index}
              reminder={reminder}
              isDisabled={mode !== WateringMode.Manual}
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
  const [duration, setDuration] = useState(5);
  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const newReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => newReminder(reminder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WateringMode.Manual] });
    },
  });

  useEffect(() => {
    if (modalVisible) {
      setTime(new Date());
      setDuration(5);
    }
  }, [modalVisible]);

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback>
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
                  style={{
                    ...styles.button,
                    backgroundColor: "black",
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    newReminderMutation.mutate({
                      time: time.getTime(),
                      duration,
                      state: true,
                    });
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

interface ReminderCardProps {
  reminder: Reminder;
  isDisabled: boolean;
}

function ReminderCard({ reminder, isDisabled }: ReminderCardProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<number>(reminder.duration);
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState<Date>(new Date(reminder.time));
  const ref = useRef<any>();

  const currentTime = new Date(reminder.time);

  const deleteReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => deleteReminder(reminder),
    onSuccess: () => {
      queryClient.setQueryData([WateringMode.Manual], (old: ManualSettings) => {
        const newReminders = old.reminders.filter((r) => r.id !== reminder.id);
        return { ...old, reminders: newReminders };
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: (reminder: Reminder) => updateReminder(reminder),
    onSuccess: (_, _reminder) => {
      queryClient.setQueryData([WateringMode.Manual], (old: ManualSettings) => {
        const newReminders = old.reminders.map((r) =>
          r.id === _reminder.id ? _reminder : r
        );
        return { ...old, reminders: newReminders };
      });
    },
  });

  const onClose = () => {
    setOpen(false);
    ref.current.reset();
  };

  const renderRightActions = () => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: "green",
            width: "100%",
            justifyContent: "flex-end",
          },
        ]}
      >
        <Text style={{ fontSize: 16, fontWeight: 800, color: "white" }}>
          Change 🫡
        </Text>
      </View>
    );
  };

  const renderLeftActions = () => {
    return (
      <View style={[styles.card, { backgroundColor: "red", width: "100%" }]}>
        <Text style={{ fontSize: 16, fontWeight: 800, color: "white" }}>
          Delete 🗑️
        </Text>
      </View>
    );
  };

  return (
    <Swipeable
      ref={ref}
      dragOffsetFromLeftEdge={5}
      renderLeftActions={renderLeftActions}
      onSwipeableLeftOpen={() => deleteReminderMutation.mutate(reminder)}
      dragOffsetFromRightEdge={5}
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={() => setOpen(true)}
    >
      <View style={styles.card}>
        <View>
          <Text>{`Time: ${dayjs(reminder.time).format("hh:mm A")}`}</Text>
          <Text>{`Duration: ${reminder.duration}s`}</Text>
        </View>
        <Switch
          disabled={isDisabled}
          value={reminder.state}
          onValueChange={(value) =>
            updateReminderMutation.mutate({
              ...reminder,
              state: value,
            })
          }
          trackColor={{
            false: "#767577",
            true: isDisabled ? "#767577" : "#000",
          }}
          thumbColor="#f4f3f4"
        />
      </View>
      <Modal animationType="fade" transparent={true} visible={open}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
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
                      onClose();
                    }}
                  >
                    <Text style={styles.text}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={{
                      ...styles.button,
                      backgroundColor: "black",
                    }}
                    onPress={() => {
                      onClose();
                      updateReminderMutation.mutate({
                        ...reminder,
                        time: time.getTime(),
                        duration,
                      });
                    }}
                  >
                    <Text
                      style={{
                        ...styles.text,
                        color: "white",
                        paddingHorizontal: 20,
                      }}
                    >
                      Update
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Swipeable>
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
    borderBottomWidth: 1,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
  },
  modalView: {
    gap: 20,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
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
