import { Component } from '@angular/core';
import {Aircraft} from '../aircraft/aircraft';

@Component({
  selector: 'app-privacy-policy',
  imports: [
    Aircraft
  ],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})

export class PrivacyPolicy {}
