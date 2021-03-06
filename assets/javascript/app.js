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
        result = JSON.parse(data);
        console.log(result);

        var currentTemperature = Math.round(result.currently.temperature);
        var currentSummary = result.currently.summary;
        var currentIcon = result.currently.icon;
        var currentHigh = Math.round(result.daily.data[0].apparentTemperatureMax);
        var currentLow = Math.round(result.daily.data[0].apparentTemperatureMin);
        var currentAlerts = result.alerts;

        $('#place-temperature').html(currentTemperature);
        $('#place-high-temp').html(currentHigh);
        $('#place-low-temp').html(currentLow);
        var icon = '<span class="icon ' + currentIcon + '"> </span>';
        $('#currently-summary').html(icon + ' ' + currentSummary);
        $('#alert-title').html(currentAlerts.length + ' Weather Alerts');
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
        $('#flickr-image-title').html(randomPhoto.title);
        $('#flickr-image-owner').html('by ' + randomPhoto.ownername);
        // URL: 'https://www.flickr.com/photos/' + this.owner + '/' + this.id;
        $('#flickr-image-url').html('<a href="https://www.flickr.com/photos/' + randomPhoto.owner + '/' + randomPhoto.id + '" target="_blank"></a>')
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
