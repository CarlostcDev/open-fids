import {Airport} from './airport';

export interface SearchAirport extends Airport {
  searchName: string;
  searchCity: string;
  searchIata: string;
}
