var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};


function remove_tags(html)
  {

    var sub = ["&nbsp;", "Issued at", "Winds:", "  *","&nbsp;", "<[^>]*>", "erly", "knots", "[Nn]ortheast", "[Ss]Southeast","[Ss]outhwest","[Nn]orthwest","[Ee]ast", "[Ss]outh", "[Nn]orth","[Ww]est"];
    var rep = [" ",      "Issued",    "Wind:",   " ",  " ",     "",         "",    "kts",   "NE",           "SE",           "SW",          "NW",          "E",        "S",       "N",       "W"];
    var tmp = html; 
    
    var i;
    for (i = 0; i <sub.length; i++)
      {
        var re = new RegExp(sub[i], "g");
        tmp = tmp.replace(re, rep[i]);
      }
    return tmp;
  }

 
function getForecast() {
  var url = "http://www.bom.gov.au/marine/lite/forecast/sydney-closed-waters.shtml";
  xhrRequest(url, 'GET', 
    function(responseText) {

      // Assemble dictionary using our keys
      var response = remove_tags(responseText);
      var fc_issued_at= response.substring(response.search("Issued"), response.search(/ E[DS]T/));
      var fc_forecast1 = response.substring(response.search("Weather Situation")); // Get us past the first "Forecase for"
      var fc_forecast2 = fc_forecast1.substring(fc_forecast1.search("midnight")+10);
//      var fc_forecast3 = fc_forecast2.substring(0,20 + fc_forecast2.substring(20).search("Forecast for"));
      var fc_forecast3 = fc_forecast2.substring(0, fc_forecast2.search("Forecast for"));    
      Pebble.showSimpleNotificationOnPebble("Forecast", fc_issued_at + fc_forecast3);
 
    }      
  );
}

function getWind() {
  // Construct URL
  var url = "http://www.bom.gov.au/nsw/observations/sydney.shtml";
  // Send request to BoM
  xhrRequest(url, 'GET', 
    function(responseText) {

      // Assemble dictionary using our keys
      var wind_time = responseText.substr(responseText.search("obs-datetime obs-station-north-head")+40, 5);
      var wind_dir_long= responseText.substr(responseText.search("obs-wind obs-wind-dir obs-station-north-head") + 46 , 10);
      var wind_dir = wind_dir_long.substring(0, wind_dir_long.search("<"));
      var wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-spd-kts obs-station-north-head") + 50, 10);
      var wind_speed = wind_speed_long.substring(0, wind_speed_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-gust-kts obs-station-north-head") + 51, 10);
      wind_speed = wind_speed + "-" + wind_speed_long.substring(0, wind_speed_long.search("<"));

      // Assemble dictionary using our keys
      var wind_time1 = responseText.substr(responseText.search("obs-datetime obs-station-sydney-harbour")+44, 5);
      wind_dir_long = responseText.substr(responseText.search("obs-wind obs-wind-dir obs-station-sydney-harbour") + 50 , 10);
      var wind_dir1 = wind_dir_long.substring(0, wind_dir_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-spd-kts obs-station-sydney-harbour") + 54, 10);
      var wind_speed1 = wind_speed_long.substring(0, wind_speed_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-gust-kts obs-station-sydney-harbour") + 55, 10);
      wind_speed1 = wind_speed1 + "-" + wind_speed_long.substring(0, wind_speed_long.search("<"));

      // Assemble dictionary using our keys
      var wind_time2 = responseText.substr(responseText.search("obs-datetime obs-station-fort-denison")+42, 5);
      wind_dir_long= responseText.substr(responseText.search("obs-wind obs-wind-dir obs-station-fort-denison") + 48 , 10);
      var wind_dir2 = wind_dir_long.substring(0, wind_dir_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-spd-kts obs-station-fort-denison") + 52, 10);
      var wind_speed2 = wind_speed_long.substring(0, wind_speed_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-gust-kts obs-station-fort-denison") + 53, 10);
      wind_speed2 = wind_speed2 + "-" + wind_speed_long.substring(0, wind_speed_long.search("<"));

            // Assemble dictionary using our keys
      var wind_time3 = responseText.substr(responseText.search("obs-datetime obs-station-sydney-airport")+44, 5);
      wind_dir_long= responseText.substr(responseText.search("obs-wind obs-wind-dir obs-station-sydney-airport") + 50 , 10);
      var wind_dir3 = wind_dir_long.substring(0, wind_dir_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-spd-kts obs-station-sydney-airport") + 54, 10);
      var wind_speed3 = wind_speed_long.substring(0, wind_speed_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-gust-kts obs-station-sydney-airport") + 55, 10);
      wind_speed3 = wind_speed3 + "-" + wind_speed_long.substring(0, wind_speed_long.search("<"));

      // Assemble dictionary using our keys
      var wind_time4 = responseText.substr(responseText.search("obs-datetime obs-station-wattamolla")+40, 5);
      wind_dir_long= responseText.substr(responseText.search("obs-wind obs-wind-dir obs-station-wattamolla") + 46 , 10);
      var wind_dir4 = wind_dir_long.substring(0, wind_dir_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-spd-kts obs-station-wattamolla") + 50, 10);
      var wind_speed4 = wind_speed_long.substring(0, wind_speed_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-gust-kts obs-station-wattamolla") + 51, 10);
      wind_speed4 = wind_speed4 + "-" + wind_speed_long.substring(0, wind_speed_long.search("<"));

      // Assemble dictionary using our keys
      var wind_time5 = responseText.substr(responseText.search("obs-datetime obs-station-bellambi")+38, 5);
      wind_dir_long= responseText.substr(responseText.search("obs-wind obs-wind-dir obs-station-bellambi") + 44 , 10);
      var wind_dir5 = wind_dir_long.substring(0, wind_dir_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-spd-kts obs-station-bellambi") + 48, 10);
      var wind_speed5 = wind_speed_long.substring(0, wind_speed_long.search("<"));
      wind_speed_long = responseText.substr(responseText.search("obs-wind obs-wind-gust-kts obs-station-bellambi") + 49, 10);
      wind_speed5 = wind_speed5 + "-" + wind_speed_long.substring(0, wind_speed_long.search("<"));

      
      var dictionary = {
        "KEY_WIND_SPEED": wind_speed,
        "KEY_WIND_DIR": wind_dir,
        "KEY_TIME" : wind_time,
        "KEY_WIND_SPEED1": wind_speed1,
        "KEY_WIND_DIR1": wind_dir1,
        "KEY_TIME1" : wind_time1,
        "KEY_WIND_SPEED2": wind_speed2,
        "KEY_WIND_DIR2": wind_dir2,
        "KEY_TIME2" : wind_time2,
        "KEY_WIND_SPEED3": wind_speed3,
        "KEY_WIND_DIR3": wind_dir3,
        "KEY_TIME3" : wind_time3,
        "KEY_WIND_SPEED4": wind_speed4,
        "KEY_WIND_DIR4": wind_dir4,
        "KEY_TIME4" : wind_time4,
        "KEY_WIND_SPEED5": wind_speed5,
        "KEY_WIND_DIR5": wind_dir5,
        "KEY_TIME5" : wind_time5
        
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log("Weather info sent to Pebble successfully!");
        },
        function(e) {
          console.log("Error sending weather info to Pebble!");
        }
      );
    }      
  );
}




// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log("PebbleKit JS ready!");
    getWind();
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log("[JAVASCRIPT] Received message from PEBBLE: " +
                JSON.stringify(e.payload));
      // console.log("[JAVASCRIPT] getWeatehr -> " + getWeather);
    if (typeof e.payload["KEY_GETWEATHER"] != "undefined")
      {
      getWind();

      }
    else if (typeof e.payload["KEY_GETFORECAST" != "undefined"])
      {
            getForecast();  
      }
  }                     
);

