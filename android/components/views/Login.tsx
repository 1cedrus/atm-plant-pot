import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ToastAndroid,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import { useSession } from "@/providers/AuthenticationProvider";
import { router } from "expo-router";
import { login } from "@/apis";
import { useAppContext } from "@/providers/AppProvider";
import axios from "axios";

export default function Login() {
  const [pin, setPin] = useState("");
  const { signIn } = useSession();
  const { setAddress: _setAddress, setWs: _setWs } = useAppContext();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [ws, setWs] = useState("");

  const onClose = () => setOpen(false);

  const handleLogin = async () => {
    if (!pin) return;

    if (!axios.defaults.baseURL) {
      ToastAndroid.showWithGravity(
        "Please configure the server!",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
      return;
    }

    try {
      const { access_token } = await login(pin);
      signIn(access_token);

      router.replace("/");

      ToastAndroid.showWithGravity(
        "Login successful!",
        ToastAndroid.SHORT,
        ToastAndroid.TOP // This will place the toast at the top of the screen
      );
    } catch (error) {
      ToastAndroid.showWithGravity(
        "Wrong PIN!",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
    }

    setPin("");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Pressable
        onPress={() => setOpen(true)}
        style={{ position: "absolute", bottom: 0, right: 0, padding: 20 }}
      >
        <Text style={{ fontSize: 24 }}>🏵️</Text>
      </Pressable>
      <Text style={styles.title}>🌺 Plant Watering</Text>
      <Text style={styles.description}>Enter you pin to continue</Text>

      <TextInput
        style={styles.input}
        secureTextEntry={true}
        placeholder="PIN"
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        autoCapitalize="none"
      />

      <Button color="#000" title="Login" onPress={handleLogin} />
      <Modal animationType="fade" transparent={true} visible={open}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.cardTitle}>Server configuration</Text>
                <TextInput
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="WS"
                  value={ws}
                  onChangeText={setWs}
                  autoCapitalize="none"
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <Pressable
                    style={{
                      ...styles.button,
                      backgroundColor: "black",
                    }}
                    onPress={() => {
                      onClose();
                      _setAddress(address);
                      _setWs(ws);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  description: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    textAlign: "center",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
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
