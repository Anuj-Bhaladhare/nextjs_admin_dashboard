Aah\! Ab tumhara architecture clear ho gaya. Pehle main tumhari actual development setup ko samajh leta hoon.

Tum abhi Ubuntu 24 laptop par development kar rahe ho, Raspberry Pi par nahi. Baad mein complete project Raspberry Pi par deploy karoge.

Toh abhi MQTT Broker bhi tumhare Ubuntu laptop par install hona chahiye.

## 1. Tumhara current architecture

Ubuntu 24 Laptop

Development

IP: 192.168.1.50

- Next.js Application
- MQTT.js Client
- Mosquitto MQTT Broker

Wi-Fi / LAN

ESP32

Hardware

- Wi-Fi
- PubSubClient
- Built-in LED

## 2. Ubuntu 24 par Mosquitto install karo

Terminal open karo:

bash

```bash
sudo apt update

sudo apt install mosquitto mosquitto-clients -y
```

Service start karo:

bash

```bash
sudo systemctl enable --now mosquitto
```

Check karo:

bash

```bash
sudo systemctl status mosquitto
```

Expected:

text

```text
Active: active (running)
```

## 3. Mosquitto ko network par accessible karo

Ubuntu par Mosquitto default mein localhost-only mode mein ho sakta hai.

Development ke liye authenticated LAN listener configure karo.

File create karo:

bash

```bash
sudo nano /etc/mosquitto/conf.d/local.conf
```

Ismein:

conf

```conf
listener 1883 0.0.0.0

allow_anonymous false

password_file /etc/mosquitto/passwd
```

Ab MQTT username create karo:

bash

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd mqttuser
```

Password enter karo.

Mosquitto restart karo:

bash

```bash
sudo systemctl restart mosquitto
```

Check:

bash

```bash
sudo ss -lntp | grep 1883
```

Ab broker LAN connections accept karne ke liye configured hai.

## 4. Ubuntu firewall check karo

Agar UFW enabled hai:

bash

```bash
sudo ufw status
```

Agar active hai, apne local network ke liye port allow karo:

bash

```bash
sudo ufw allow from 192.168.1.0/24 to any port 1883 proto tcp
```

Port ko public internet par expose mat karna.

## 5. Next.js environment variable update karo

Tumhare `.env.local` mein:

env

```env
MQTT_BROKER_URL=mqtt://127.0.0.1:1883

MQTT_USERNAME=mqttuser
MQTT_PASSWORD=your_password
```

Yahan `127.0.0.1` kyun?

Kyunki Next.js aur Mosquitto dono same Ubuntu laptop par run ho rahe hain.

## 6. ESP32 mein kya change karna hai?

ESP32 ko laptop ka IP address dena hai:

cpp

```cpp
const char* MQTT_BROKER = "192.168.1.50";
const int MQTT_PORT = 1883;

const char* MQTT_USERNAME = "mqttuser";
const char* MQTT_PASSWORD = "your_password";
```

Dhyan rahe:

- Laptop aur ESP32 same Wi-Fi/LAN par hon.
- Laptop ka IP `192.168.1.50` stable rahe.
- ESP32 mein `localhost` use nahi karna.

## 7. Final deployment mein kya change hoga?

## Development vs Production

Abhi – DevelopmentUbuntu Laptop (192.168.1.50)

- Next.js
- Mosquitto
- MQTT.js
  Next.js broker URL: localhost:1883

Baad mein – ProductionRaspberry Pi (example: 192.168.1.10)

- Next.js
- Mosquitto
- MQTT.js
  Next.js broker URL: localhost:1883

ESP32 ka broker address development mein laptop IP aur production mein Raspberry Pi IP ho jayega.

Iska sabse achha part ye hai ki tumhe Next.js aur ESP32 ka communication architecture dobara design nahi karna padega. Sirf environment configuration change hogi.

## Ab hum pehle ek test karenge

Ubuntu par Mosquitto install karne ke baad do terminals open karo.

Terminal 1 – Subscribe:

bash

```bash
mosquitto_sub -h localhost -p 1883 -u mqttuser -P 'YOUR_PASSWORD' -t "esp32/led" -v
```

Terminal 2 – Publish:

bash

```bash
mosquitto_pub -h localhost -p 1883 -u mqttuser -P 'YOUR_PASSWORD' -t "esp32/led" -m "ON"
```

Expected output:

text

```text
esp32/led ON
```

Pehle ye test successful karte hain. Phir ESP32 connect karenge aur finally Next.js button se LED control karenge.
