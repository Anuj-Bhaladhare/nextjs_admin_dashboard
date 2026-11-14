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