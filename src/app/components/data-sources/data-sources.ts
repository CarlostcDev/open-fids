import { Component } from '@angular/core';
import {Aircraft} from '../aircraft/aircraft';

@Component({
  selector: 'app-data-sources',
  imports: [
    Aircraft
  ],
  templateUrl: './data-sources.html',
  styleUrl: './data-sources.scss',
})
export class DataSources {}
