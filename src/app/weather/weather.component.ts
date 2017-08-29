import { Component, OnInit } from '@angular/core';
import { IWeather } from './weather';
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  currentWeather: IWeather  = ( {
    city: '',
    low: 0,
    high: 0,
    condition: '',
    sunrise: '',
    sunset: ''
  });
  errorMessage: string;

  constructor(private _weatherService: WeatherService) { }

  ngOnInit(): void {
    this._weatherService.getWeather()
    .subscribe(
      weather => {
        this.currentWeather = weather;
      },
      error => this.errorMessage = <any>error);
  }
}
