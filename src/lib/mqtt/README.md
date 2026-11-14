Your existing `src/lib` structure is already well organized. I recommend adding MQTT as a separate service module, just like your existing `email` service.

Don't put MQTT logic inside `auth`, `db`, or API routes directly. Keep the MQTT connection and publishing/subscribing logic reusable.

## 1. Recommended folder structure

Add an `mqtt` directory inside `src/lib`:

text

```text
src/
└── lib/
    ├── auth/
    ├── db/
    ├── email/
    │
    └── mqtt/
        ├── mqtt.client.ts
        ├── mqtt.config.ts
        ├── mqtt.service.ts
        ├── mqtt.types.ts
        └── README.md
```

Each file has a specific responsibility:

| File | Responsibility |
| --- | --- |
| `mqtt.client.ts` | Create and manage MQTT connection |
| `mqtt.config.ts` | Broker URL, credentials, connection options |
| `mqtt.service.ts` | Publish commands and subscribe to topics |
| `mqtt.types.ts` | TypeScript types for messages |
| `README.md` | MQTT architecture and usage |

## 2. Install dependency

From your Next.js project root:

bash

```bash
npm install mqtt
```

## 3. mqtt.config.ts

Location: `src/lib/mqtt/mqtt.config.ts`

typescript

```typescript
export const mqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL!,
  username: process.env.MQTT_USERNAME!,
  password: process.env.MQTT_PASSWORD!,

  options: {
    reconnectPeriod: 3000,
    connectTimeout: 30000,
    clean: true,
    clientId: "nextjs_admin_dashboard",
  },
};
```

## 4. mqtt.types.ts

Location: `src/lib/mqtt/mqtt.types.ts`

typescript

```typescript
export type GateCommand = "OPEN" | "CLOSE";

export type GateStatus =
  | "OPENING"
  | "OPENED"
  | "CLOSING"
  | "CLOSED"
  | "ERROR";

export interface GateCommandMessage {
  commandId: string;
  deviceId: string;
  command: GateCommand;
}

export interface GateStatusMessage {
  deviceId: string;
  status: GateStatus;
  commandId?: string;
  timestamp: number;
}
```

## 5. mqtt.client.ts

Location: `src/lib/mqtt/mqtt.client.ts`

This file manages a reusable MQTT connection.

typescript

```typescript
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
```

## 6. mqtt.service.ts

Location: `src/lib/mqtt/mqtt.service.ts`

This is your business-level MQTT service.

typescript

```typescript
import { getMqttClient } from "./mqtt.client";
import type {
  GateCommand,
  GateStatusMessage,
} from "./mqtt.types";

export async function publishGateCommand(
  deviceId: string,
  command: GateCommand
) {
  const client = getMqttClient();

  if (!client.connected) {
    throw new Error("MQTT broker is not connected");
  }

  const topic = `devices/${deviceId}/command`;

  const message = JSON.stringify({
    deviceId,
    command,
    commandId: crypto.randomUUID(),
    timestamp: Date.now(),
  });

  return new Promise<void>((resolve, reject) => {
    client.publish(topic, message, { qos: 1 }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export function subscribeToGateStatus(
  callback: (data: GateStatusMessage) => void
) {
  const client = getMqttClient();

  client.subscribe("devices/+/status", { qos: 1 });

  const handler = (topic: string, payload: Buffer) => {
    if (!topic.endsWith("/status")) return;

    try {
      const data = JSON.parse(
        payload.toString()
      ) as GateStatusMessage;

      callback(data);
    } catch {
      console.error("Invalid MQTT status message");
    }
  };

  client.on("message", handler);

  return () => {
    client.removeListener("message", handler);
  };
}
```

Note: The status subscription should be initialized once by a persistent backend service, not separately by every API request. Also validate incoming device IDs and message schemas before trusting them.

## 7. Create your API route

Location:

`src/app/api/gate/route.ts`

typescript

```typescript
import { NextResponse } from "next/server";
import { publishGateCommand } from "@/lib/mqtt/mqtt.service";
import type { GateCommand } from "@/lib/mqtt/mqtt.types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { deviceId, command } = await request.json();

    if (
      !["gate_esp32_001", "gate_esp32_002"].includes(deviceId) ||
      !["OPEN", "CLOSE"].includes(command)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    await publishGateCommand(
      deviceId,
      command as GateCommand
    );

    return NextResponse.json({
      success: true,
      message: "Command published",
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "MQTT operation failed",
      },
      { status: 503 }
    );
  }
}
```

Make sure this route also checks the authenticated user's session and permission to operate that particular gate before publishing commands.

## 8. Environment variables

In `.env.local`:

env

```env
MQTT_BROKER_URL=mqtt://127.0.0.1:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
```

This assumes Next.js and Mosquitto run on the same Raspberry Pi and in the same network namespace.

## 9. Final architecture

Next.js Admin Dashboard

`src/app/api/gate/route.ts`

Authentication + Authorization

`src/lib/mqtt/mqtt.service.ts`

Publish / Subscribe

`src/lib/mqtt/mqtt.client.ts`

Persistent MQTT connection

Mosquitto Broker

Raspberry Pi

ESP32 Gate Controller

## My architectural recommendation

Since your project already has `auth`, `db`, and `email` separated into services, follow exactly the same pattern for MQTT.

One important deployment detail: if you use Next.js with a persistent Node.js server, this architecture works well. If you use multiple Next.js instances or serverless functions, use a dedicated MQTT worker/service instead of relying on module-level connection state.

Next step: I would implement a dedicated `mqtt` service with command acknowledgement tracking and live gate-status delivery, so your dashboard can distinguish between `Command Sent`, `Gate Opening`, and `Gate Opened`.
