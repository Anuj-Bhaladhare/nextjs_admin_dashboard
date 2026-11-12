
import mqtt from "mqtt";
import { mqttConfig } from "./mqtt.config";

export async function publishLED(
  command: "ON" | "OFF"
): Promise<boolean> {

  const client = mqtt.connect(
    mqttConfig.brokerUrl,
    {
      ...mqttConfig.options,
      username: mqttConfig.username,
      password: mqttConfig.password,
      reconnectPeriod: 0,
    }
  );

  return new Promise((resolve, reject) => {

    let settled = false;

    const finish = (
      error?: Error
    ) => {
      if (settled) return;

      settled = true;
      clearTimeout(timeout);

      client.end(true);

      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    };

    const timeout = setTimeout(() => {
      finish(new Error("MQTT connection timeout"));
    }, 10000);

    client.once("error", (error) => {
      finish(error);
    });

    client.once("connect", () => {

      client.publish(
        mqttConfig.topic,
        command,
        { qos: 1 },
        (error) => {
          finish(error || undefined);
        }
      );

    });
  });
}

