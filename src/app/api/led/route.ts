
import { NextResponse } from "next/server";
import { publishLED } from "@/lib/mqtt/mqtt.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const command = body.command;

    if (
      command !== "ON" &&
      command !== "OFF"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid LED command",
        },
        { status: 400 }
      );
    }

    await publishLED(command);

    return NextResponse.json({
      success: true,
      message: `LED ${command} command published`,
      command,
    });

  } catch (error) {
    console.error("LED MQTT Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "MQTT communication failed",
      },
      { status: 503 }
    );
  }
}
