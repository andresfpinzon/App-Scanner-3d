import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { Motor } from "../models/EscanerModel";
import { EscanerController } from "../controllers/EscanerController";

export const EscanerScreen = () => {
  const [motores, setMotores] = useState<Motor[]>([]);

  useEffect(() => {
    setMotores(EscanerController.obtenerMotores());
  }, []);

  const toggleMotor = async (motor: Motor) => {
    const actualizado = { ...motor, activo: !motor.activo };

    if (actualizado.activo) {
      await EscanerController.activarMotor(actualizado);
    } else {
      await EscanerController.detenerMotor(actualizado);
    }

    setMotores(prev =>
      prev.map(m =>
        m.id === motor.id ? actualizado : m
      )
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Control de Motores</Text>
      {motores.map((motor) => (
        <View key={motor.id} style={styles.motor}>
          <Text style={styles.motorName}>{motor.nombre}</Text>
          <Button
            title={motor.activo ? "Detener" : "Iniciar"}
            onPress={() => toggleMotor(motor)}
            color={motor.activo ? "red" : "green"}
          />
          <Text style={{ marginTop: 5 }}>
            Estado: {motor.activo ? "En movimiento" : "Detenido"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  motor: {
    marginBottom: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
  },
  motorName: {
    fontSize: 18,
    marginBottom: 10,
  },
});
