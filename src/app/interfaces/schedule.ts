export interface Schedule {
  departure?: {
    airport?: {
      icao?: string;
      iata?: string;
      name?: string;
      countryCode?: string;
      timeZone?: string;
    };
    scheduledTime?: {
      utc?: string;
      local?: string;
    };
    revisedTime?: {
      utc?: string;
      local?: string;
    };
    runwayTime?: {
      utc?: string;
      local?: string;
    };
    terminal?: string;
    checkInDesk?: string;
    gate?: string;
    runway?: string;
    quality?: string[];
  };
  arrival?: {
    airport?: {
      icao?: string;
      iata?: string;
      name?: string;
      countryCode?: string;
      timeZone?: string;
    };
    scheduledTime?: {
      utc?: string;
      local?: string;
    };
    revisedTime?: {
      utc?: string;
      local?: string;
    };
    terminal?: string;
    baggageBelt?: string;
    quality?: string[];
  };
  number?: string;
  callSign?: string;
  status?: string;
  codeshareStatus?: string;
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
}
