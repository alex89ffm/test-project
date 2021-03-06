
var http = require('http');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
import Weather from './model/weather';
var dateFormat = require('dateformat');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({ignoreAttrs : false, mergeAttrs : true})
var ResultObject = {}
parser.on('error', function(err) { console.log('Parser error', err); });
var app = express();
const assetsPath = path.resolve(__dirname, "assets");
const jsonPath = path.join(assetsPath, "products.json");

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname));

//get all Products
app.get('/products', function (request, response) {
  response.header("Access-Control-Allow-Origin", "*");

  if(!fs.existsSync(jsonPath)){
    var emptyProducts = [];
    fs.writeFileSync(jsonPath, JSON.stringify(emptyProducts, null, 2), (err) =>{
      if(err){
        console.log(err);
        response.send("error");
      }else{
        response.json(JSON.parse(emptyProducts));
      }
    });
  }else{
    var json_products = fs.readFile(jsonPath, 'utf8', function (err, data) {
      if (err) throw err; // we'll not consider error handling for now
      response.json(JSON.parse(data));
    });
  }

})

//get Weather from openWeatherMap
app.get('/weather', (request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  var data = '';
  var req = http.get("http://api.openweathermap.org/data/2.5/weather?q=stuttgart&appid=40a123745813c4f22c9e570fcf140979&mode=xml&units=metric&lang=de", function(res) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      res.on('data', function(data_) { data += data_.toString(); });
      res.on('end', function() {
        console.log('data', data);
        parser.parseString(data, function(err, js_result) {
          console.log(JSON.stringify(js_result.city, null, 2));
          const weatherResult = new Weather({
            city:js_result.current.city[0].name[0],
            condition: js_result.current.weather[0].value[0],
            low: js_result.current.temperature[0].min[0],
            high: js_result.current.temperature[0].max[0],
            sunrise: dateFormat(new Date(js_result.current.city[0].sun[0].rise[0]), 'H:MM'),
            sunset: dateFormat(new Date(js_result.current.city[0].sun[0].set[0]), 'H:MM')
          })
          response.json(weatherResult);
        });
      });
    }else{
      console.log(res.statusCode);
    }
  });
  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
});

//Create Product
app.post('/products', (request, response) => {
  var insertedObject = request.body;
  var json_products = fs.readFile(jsonPath, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);

    //increment last found id by 1
    var last = _.last(obj);
    if(_.has(last, 'productId')){
      insertedObject.productId = parseInt(last.productId) ;
    }else{
      insertedObject.productId = 1;
    }
    obj.push(insertedObject);
    fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2));
    response.send('success');
  });
});

//Read single Product
app.get('/products/:id', (request, response) => {
  const id = parseInt(request.params.id);
  var json_products = fs.readFile(jsonPath, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);
    var filtered = _.findWhere(obj, {productId: id});
    response.json(filtered);
  });
});

//Update Product
app.put('/products/:id', function (request, response) {
  var updatedObject = request.body;
  console.log(updatedObject);
  const id = parseInt(request.params.id);
  var json_products = fs.readFile(jsonPath, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);
    _.extend(_.findWhere(obj,{productId:id}), updatedObject);
    var result = JSON.stringify(obj, null, 2);
    fs.writeFileSync(jsonPath, result);
    return response.send('saved');
  });
});

//Delete Product
app.delete('/products/:id', (request, response) => {
  const id = parseInt(request.params.id);
  var json_products = fs.readFile(jsonPath, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);
    obj = _.without(obj, _.findWhere(obj, {
      productId: id
    }));
    var result = JSON.stringify(obj, null, 2);
    console.log(result);
    fs.writeFileSync(jsonPath, result);
    return response.send('deleted');
  });
});

app.listen(3000, function () {
  console.log('Example listening on port 3000!');
});

module.exports = app;
