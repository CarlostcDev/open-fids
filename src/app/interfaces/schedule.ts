export interface FlightTime {
  local?: string;
}

export interface FlightAirport {
  icao?: string;
  iata?: string;
  name?: string;
  timeZone?: string;
}

export interface ScheduleLeg {
  airport?: FlightAirport;
  scheduledTime?: FlightTime;
  revisedTime?: FlightTime;
  runwayTime?: FlightTime;
  terminal?: string;
  checkInDesk?: string;
  gate?: string;
  runway?: string;
  baggageBelt?: string;
}

export interface Codeshare {
  iata?: string;
  number?: string;
}

export interface Schedule {
  departure?: ScheduleLeg;
  arrival?: ScheduleLeg;
  number?: string;
  callSign?: string;
  status?: string;
  isCargo?: boolean;
  aircraft?: {
    reg?: string;
    modeS?: string;
    model?: string;
  };
  airline?: {
    name?: string;
    iata?: string;
    icao?: string;
  };
  codeshares?: Codeshare[];
}
