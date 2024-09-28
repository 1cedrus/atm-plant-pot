import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
  Platform,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LineChart } from "react-native-chart-kit";
import * as ScreenOrientation from "expo-screen-orientation";
import DateTimePicker from "@react-native-community/datetimepicker";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const waterLevel = 49; // Example water level percentage
  const isWaterAbove50 = waterLevel > 50;

  const handleChartPress = async () => {
    // Change orientation to landscape
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    );
    setModalVisible(true);
  };

  const handleCloseModal = async () => {
    // Change orientation back to portrait
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    setModalVisible(false);
  };

  const onFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fromDate;
    setShowFromDatePicker(Platform.OS === "ios");
    setFromDate(currentDate);
  };

  const onToDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || toDate;
    setShowToDatePicker(Platform.OS === "ios");
    setToDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Soil Moisture Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Soil Moisture</Text>
          <Icon name="leaf" size={24} color="black" />
        </View>
        <Text style={styles.dataText}>81.0%</Text>
        <ProgressBar
          progress={0.81}
          color={"#000"}
          style={styles.progressBar}
        />
      </View>

      {/* Water Level and Current Weather in the same row */}
      <View style={styles.rowContainer}>
        {/* Water Level Card */}
        <View style={[styles.card, styles.smallCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Water Level</Text>
            <Icon name="waves" size={24} color="black" />
          </View>
          <Text style={styles.dataText}>
            {isWaterAbove50 ? "Above 50%" : "Below 50%"}
          </Text>
        </View>

        {/* Current Weather Card */}
        <View style={[styles.card, styles.smallCard, styles.errorCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Weather</Text>
            <Icon name="weather-cloudy" size={24} color="black" />
          </View>
          <Text style={styles.errorText}>Failed to load weather data</Text>
        </View>
      </View>

      {/* Soil Moisture Chart Card */}
      <TouchableOpacity onPress={handleChartPress}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Soil Moisture Statistics</Text>
            <Icon name="chart-line" size={24} color="black" />
          </View>
          <LineChart
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [
                {
                  data: [70, 75, 80, 85, 78, 82], // Sample moisture data
                },
              ],
            }}
            width={screenWidth - 40} // from react-native
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
        </View>
      </TouchableOpacity>

      {/* Full Screen Chart Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Soil Moisture Statistics (Full Screen)
          </Text>
          <LineChart
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [
                {
                  data: [70, 75, 80, 85, 78, 82], // Sample moisture data
                },
              ],
            }}
            width={Dimensions.get("window").width} // Full screen width
            height={300}
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

          {/* Date Range Selection */}
          <View style={styles.dateContainer}>
            <Button
              title="Select From Date"
              onPress={() => setShowFromDatePicker(true)}
            />
            <Text>{fromDate.toDateString()}</Text>
            {showFromDatePicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={onFromDateChange}
              />
            )}

            <Button
              title="Select To Date"
              onPress={() => setShowToDatePicker(true)}
            />
            <Text>{toDate.toDateString()}</Text>
            {showToDatePicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={onToDateChange}
              />
            )}
          </View>

          <Button title="Close" onPress={handleCloseModal} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
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
});
