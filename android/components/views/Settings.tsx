import { useSession } from "@/providers/AuthenticationProvider";
import { OperationMode } from "@/types";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { View,  Text, StyleSheet, Pressable } from "react-native";

export default function Settings() {
  const [mode, setMode] = useState(OperationMode.Realtime);
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16 }}>Operation mode</Text>
        <Picker selectedValue={mode} onValueChange={setMode}>
          <Picker.Item label="Realtime" value={OperationMode.Realtime} />
          <Picker.Item label="Adaptive" value={OperationMode.Adaptive} />
        </Picker>
      </View>
      <View style={{ gap: 10 }}>
        <Pressable style={{...styles.button, borderColor: '#000'}} onPress={signOut}>
          <Text style={styles.text}>Change password</Text>
        </Pressable>
        <Pressable style={{...styles.button, borderColor: '#000'}} onPress={signOut}>
          <Text style={styles.text}>Sign out</Text>
        </Pressable>
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
    textAlign: "center",
  },
});
