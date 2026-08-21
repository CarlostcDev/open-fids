export interface FlightViewModel {
  number: string;
  rawTime: string | undefined;
  formattedTime: string;
  airlineLogo: string;
  airlineAlt: string;
  airportCode: string;
  airportName: string;
  status: string;
  isDelayed: boolean;
  isScheduled: boolean;
  isBoarding: boolean;
  terminal: string;
  gate: string;
}
