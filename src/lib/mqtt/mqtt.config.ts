
export const mqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL!,
  username: process.env.MQTT_USERNAME!,
  password: process.env.MQTT_PASSWORD!,
  topic: process.env.MQTT_TOPIC || "esp32/led",

  options: {
    reconnectPeriod: 3000,
    connectTimeout: 30000,
    clean: true,
    clientId: "nextjs_admin_dashboard",
  },
};
