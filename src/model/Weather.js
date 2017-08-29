class Weather {
      constructor(data) {
            this.city = data.city;
            this.low = data.low;
            this.high = data.high;
            this.sunrise = data.sunrise;
            this.sunset = data.sunset;
            this.condition = data.condition;
      }

      getCity() { return this.city; }
      getCondition() { return this.condition; }
      getLow() { return this.low; }
      getHigh() { return this.high; }
      getSunrise() { return this.sunrise; }
      getSunset() { return this.sunset; }
}
export default Weather;
