import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  Pressable,
  ImageBackground,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart } from "react-native-chart-kit";
import * as ScreenOrientation from "expo-screen-orientation";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { WebSocketEventType } from "@/types";
import {
  getSoilMoisture,
  getSoilMoistureData,
  getWaterLevel,
  getWeather,
  stopWater,
  updatePosition,
  water,
} from "@/apis";
import { timeAgo } from "@/time";
import { useBackdrop } from "../Backdrop";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function Dashboard() {
  const [isModalVisible, setModalVisible] = useState(false);
  const { onOpen, onClose } = useBackdrop();
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: dayjs(Date.now()).subtract(30, "day").toDate(), // 30 days ago
    to: new Date(Date.now()),
  });

  const { data: soilMoisture } = useQuery({
    queryKey: [WebSocketEventType.SoilMoisture],
    queryFn: getSoilMoisture,
  });

  const { data: waterLevel } = useQuery({
    queryKey: [WebSocketEventType.WaterLevel],
    queryFn: getWaterLevel,
  });

  const { data: weather } = useQuery({
    queryKey: [WebSocketEventType.Weather],
    queryFn: getWeather,
  });

  const { data: soilMoistureData } = useQuery({
    queryKey: [WebSocketEventType.SoilMoisture, date],
    queryFn: async () => {
      if (date?.from === undefined || date?.to === undefined) return [];
      const data = await getSoilMoistureData(
        date!.from!.getTime(),
        dayjs(date!.to!).add(1, "day").toDate().getTime()
      );

      return data.slice(0, 10).map(({ timestamp, moisture_level }) => ({
        timestamp: dayjs(new Date(timestamp)).format("HH:mm").toString(),
        moisture_level: ((moisture_level / 4095) * 100).toPrecision(2),
      }));
    },
  });

  const handleWatering = async () => {
    if (isWatering) {
      await stopWater();
    } else {
      await water();
    }

    setIsWatering((prev) => !prev);
  };

  const handleChartPress = async () => {
    // Change orientation to landscape
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
    setModalVisible(true);
  };

  const handleCloseModal = async () => {
    // Change orientation back to portrait
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    setModalVisible(false);
  };

  const onFromDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate;
    setDate({ ...date, from: currentDate });
  };

  const onToDateChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate;
    setDate({ ...date, to: currentDate });
  };

  useEffect(() => {
    if (!soilMoistureData || !soilMoisture || !waterLevel || !weather) {
      onOpen();
    } else {
      onClose();
    }
  }, [soilMoistureData, soilMoisture, waterLevel, weather]);

  if (!soilMoistureData || !soilMoisture || !waterLevel || !weather) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: 20 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Soil Moisture</Text>
            <Icon name="leaf" size={24} color="black" />
          </View>
          {soilMoisture && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <Text style={styles.dataText}>
                  {((soilMoisture.moisture_level / 4095) * 100).toFixed(2)}%
                </Text>
                <Text style={{ color: "gray" }}>
                  {timeAgo(soilMoisture.timestamp)}
                </Text>
              </View>
              <ProgressBar
                progress={soilMoisture.moisture_level / 4095}
                color={"#000"}
                style={styles.progressBar}
              />
            </>
          )}
        </View>
        <Pressable
          style={{
            ...styles.button,
            backgroundColor: "black",
            marginBottom: 15,
          }}
          onPress={handleWatering}
        >
          <Text
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: 16,
              paddingHorizontal: 20,
              textAlign: "center",
            }}
          >
            {!isWatering ? "Water 💦" : "Stop 🛑"}
          </Text>
        </Pressable>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Water Level</Text>
            <Icon name="waves" size={24} color="black" />
          </View>
          {waterLevel && (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 10,
                paddingTop: 10,
              }}
            >
              <View>
                <Text style={{ fontWeight: 700, fontSize: 16 }}>
                  {waterLevel.water_level === 0
                    ? "Water tank is above 30%"
                    : "Water tank is below 30%"}
                </Text>
                <Text style={{ color: "gray" }}>
                  Always get update after 5s
                </Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Weather</Text>
            {weather && (
              <ImageBackground
                source={{
                  uri: `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/2nd%20Set%20-%20Color/${weather.icon}.png`,
                }}
                style={{ height: 20, width: 20 }}
              />
            )}
          </View>
          {weather && (
            <View>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                {weather?.address}
              </Text>
              <Text>Temperature: {weather.temp}°F</Text>
              <Text>Humidity: {weather.humidity}%</Text>
              <Text>{weather.description}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleChartPress}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Soil Moisture Statistics</Text>
              <Icon name="chart-line" size={24} color="black" />
            </View>
            <View>
              {soilMoistureData && (
                <LineChart
                  data={{
                    labels: soilMoistureData
                      .slice(5, 10)
                      .map((data) => data.timestamp),
                    datasets: [
                      {
                        data: soilMoistureData
                          .slice(5, 10)
                          .map(
                            (data) => data.moisture_level
                          ) as any as number[],
                      },
                    ],
                  }}
                  bezier
                  width={screenWidth - 100} // from react-native
                  height={220}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726",
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Soil Moisture Statistics (Full Screen)
            </Text>
            {soilMoistureData && (
              <>
                <LineChart
                  data={{
                    labels: soilMoistureData.map((data) => data.timestamp),
                    datasets: [
                      {
                        data: soilMoistureData.map(
                          (data) => data.moisture_level
                        ) as any as number[],
                      },
                    ],
                  }}
                  width={screenHeight} // Full screen width
                  height={screenWidth - 20}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726",
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  bezier
                />
              </>
            )}
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 1,
    flex: 1,
  },
  smallCard: {
    flex: 0.48, // Make both cards take up half the screen width
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dataText: {
    fontSize: 24,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
});
