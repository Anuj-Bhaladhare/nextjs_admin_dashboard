import mqtt, { MqttClient } from "mqtt";
import { mqttConfig } from "./mqtt.config";

let client: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (client) return client;

  client = mqtt.connect(
    mqttConfig.brokerUrl,
    {
      ...mqttConfig.options,
      username: mqttConfig.username,
      password: mqttConfig.password,
    }
  );

  client.on("connect", () => {
    console.log("MQTT connected");
  });

  client.on("reconnect", () => {
    console.log("MQTT reconnecting...");
  });

  client.on("error", (error) => {
    console.error("MQTT error:", error.message);
  });

  return client;
}