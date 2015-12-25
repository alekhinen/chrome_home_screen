/** @name init()
  * @description the main initializer.
  * @returns None
  */
function init() {
  getCurrentLocation();
  Requests.getRandomPhoto();
}

var Requests = {

  getLocationFromCoords: function( lat, lng ) {
    var result, geoData,
      self = this;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://weathrapp.herokuapp.com/geocode/lat/' + lat + '/lng/' + lng, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        data = xhr.responseText;
        result = JSON.parse( data ).results[0];
        var cityName = result.address_components[3].long_name;
        console.log(result);
        console.log(cityName);
        chrome.storage.local.set({'city': cityName}, function() {
          console.log('city saved');
        });
        $('#place-name').html(cityName);
      }
    }
    xhr.send();
  },

  getWeatherFromCoords: function( lat, lng ) {
    var self = this,
      result;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://weathrapp.herokuapp.com/weather/lat/' + lat + '/lng/' + lng, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        data = xhr.responseText;
        result = JSON.parse( data );
        var currentTemperature = Math.round(result.currently.temperature);
        var currentHigh = Math.round(result.daily.data[0].apparentTemperatureMax);
        var currentLow = Math.round(result.daily.data[0].apparentTemperatureMin);
        console.log(result);
        $('#place-temperature').html(currentTemperature);
        $('#place-high-temp').html(currentHigh);
        $('#place-low-temp').html(currentLow);
      }
    }
    xhr.send();
  },

  getRandomPhoto: function() {
    // <img src="https://farm<%= farm %>.staticflickr.com/<%= server %>/<%= id %>_<%= secret %>_z.jpg"/>

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://nickalekhine.herokuapp.com/content/interesting_photographs/', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        data = xhr.responseText;
        result = JSON.parse( data );
        var photos = result.photos.photo;
        var randomIndex = Math.floor(Math.random() * photos.length - 1) + 0;
        var randomPhoto = photos[randomIndex];
        console.log(randomPhoto);
        $('#flickr-image-container').html('<img class="bg-cover" src="https://farm' + randomPhoto.farm + '.staticflickr.com/' + randomPhoto.server + '/' + randomPhoto.id + '_' + randomPhoto.secret + '_z.jpg"/>');
      }
    }
    xhr.send();
  }

};

function getCurrentLocation() {
  var lat, lng;

  chrome.storage.local.get(['lat', 'lng'], function(items) {
    var lat, lng, city;
    lat = items.lat;
    lng = items.lng;
    city = items.city;

    if (lat && lng) {
      Requests.getWeatherFromCoords( lat, lng );

      if (city) {
        $('#place-name').html(city);
      } else {
        Requests.getLocationFromCoords( lat, lng );
      }
    } else {
      getCurrentLocationFromGeoLocation();
    }

  });
}

function getCurrentLocationFromGeoLocation() {
  var lat, lng, geoLoc, weatherData, self;
  self = this;

  navigator.geolocation.getCurrentPosition( function( pos ) {
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
    Requests.getLocationFromCoords( lat, lng );
    Requests.getWeatherFromCoords( lat, lng );
    chrome.storage.local.set({'lat': lat, 'lng': lng}, function() {
      console.log('lat + lng saved');
    });
    // if ( geoLoc ) {
    //   console.log(geoLoc);
    //   // weatherData = Requests.getWeatherData( geoLoc );
    // } if ( weatherData ) {
    //   // self.showWeather( 'current', geoLoc, weatherData );
    // } else {
    //   // self.showError();
    // }
  });
}

init();
