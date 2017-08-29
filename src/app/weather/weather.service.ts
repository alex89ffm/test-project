import { Injectable } from '@angular/core';
import { IWeather } from './weather';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class WeatherService {

  private _weatherUrl = 'http://localhost:3000/weather';
  weather: IWeather;

  constructor(private _http: HttpClient) {
  }

  getWeather(): Observable<IWeather> {
    return this._http.get<IWeather>(this._weatherUrl)
          .catch(this.handleError);
  }
  private handleError(err: HttpErrorResponse) {
    console.log(err.message);
    return Observable.throw(err.message);
  }
}
