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

var nt = ""; //Next Tide
var t1 = ""; //Tide info

function getTide() {
  var url = "http://www.bom.gov.au/australia/tides/print.php?aac=NSW_TP007&type=tide&date=";
  var url1 = "&region=NSW&tz=Australia/Sydney&days=2"; // Ask for 2 days so we can work out how long to the next tide when the last
                                                      // tide for the day has already passed
  var d = new Date();
  var url2 = url + d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + url1;

//  console.log(url2);
    xhrRequest(url2, 'GET', 
    function(responseText) {

      // Assemble dictionary using our keys
      var response = responseText;
      HTMLTable(response);
      Pebble.showSimpleNotificationOnPebble("Tides","For " + d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " Local Times\n" + nt + "\n" + t1);  
    }      
  );

}

var r = [];
var s = [];
var t = [];


function HTMLTable(text) {
  var i;
  var d = new Date();
  var addDay = 0;
  var ampm, hrs, mins, diff;
  
  nt = "";
  t1 = "";
  
  for (i = 0; i < 5; i++) {
    text = text.substring(text.search(/<th rowspan=[^=]*..instance[^>]*tide.>/));
    r[i] = text.substring(text.search(">")+1,text.search(/<\/th>/));
    text = text.substring(text.search(/<td[^=]*..localtime[^>]*>/));
    s[i] = text.substring(text.search(">")+1,text.search(/<\/td>/)).replace(" ","");
    text = text.substring(text.search(/<td[^=]*..height[^>]*>/));
    t[i] = text.substring(text.search(">")+1,text.search(/<\/td>/));
    if (s[i].search("am") < 0)  // Must be PM
      ampm = 12;
    else { // Must be AM
      if (ampm == 12)  //Back to AM - we've skipped to the next day
        addDay = 24 * 3600 * 1000; // One day in msec
      ampm = 0;
    }
 //   console.log(i +"->"+ "s[i]="+s[i]);
    hrs = Number(s[i].substring(0,s[i].search(":")));
    if (ampm === 0 && hrs == 12) 
      hrs = 0;
 //   console.log(i +"->"+ "Hrs="+hrs);
    mins = Number(s[i].substring(s[i].search(":")+1,s[i].search(/[ap]m/)));
 //   console.log(i +"->"+" Mins="+mins);
    var d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(),  hrs + ampm, mins, 0, 0);
    diff = addDay + d2.getTime() - d.getTime();
   if (diff > 0) {
    var hdiff = (diff / 3600000) | 0;
    var mdiff = (((diff/3600000) - hdiff) * 60 ) | 0;
//     console.log(i +"->"+ " Hdiff=" + hdiff + " hdiff /3600000=" +diff/3600000+ " Mdiff=" + mdiff);
    if (nt === "")
      {
        var range;
        if (i > 0) // This is not the first tide of the day so we can work out the range
          {
            var lvl1, lvl2, pc;
            lvl1 = Number(t[i-1].replace("m",""));
            lvl2 = Number(t[i].replace("m",""));
            pc = Math.abs(lvl1-lvl2) / 1.89 * 100;
            range = "\n" + (pc | 0) + "% max range";
            console.log(range);
          }
     if (hdiff === 0)
       nt = r[i] + " in " + mdiff + "m";
     else
       nt = r[i] + " in " + hdiff + "h " + mdiff + "m";
     nt = nt + range;
      }
//      console.log(i +"->"+" Next " + r[i] + " tide in " + hdiff + " hours" + mdiff + " mins");
//     console.log(i + "->" + d.getFullYear() + ":" + d.getMonth()+":"+d.getDate()+":"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":::" + d.getTime());
//      console.log(i + "->" + d2.getFullYear() + ":" + d2.getMonth()+":"+d2.getDate()+":"+d2.getHours()+":"+d2.getMinutes()+":"+d2.getSeconds()+":::" + d2.getTime());
   }  

//    console.log("R=" + r[i] + "   S=" + s[i] + "   T=" + t[i]);  

    t1 = t1 + s[i] + " " + t[i].replace(" ","") + "\n";
  }

    

}


function getForecast() {
  var url = "http://www.bom.gov.au/marine/lite/forecast/sydney-closed-waters.shtml";
  xhrRequest(url, 'GET', 
    function(responseText) {
      var d = new Date();
      // Assemble dictionary using our keys
      var response = remove_tags(responseText);
      var fc_issued_at= response.substring(response.search("Issued"), response.search(/ E[DS]T/)) + " " + Number(d.getDate()) + "/" + (Number(d.getMonth())+1) + "/" + d.getFullYear();
      var fc_forecast1 = response.substring(response.search("Weather Situation")); // Get us past the first "Forecase for"
      var fc_forecast2 = fc_forecast1.substring(fc_forecast1.search("midnight")+10);
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
    
    else if (typeof e.payload["KEY_GETFORECAST"] != "undefined")
      {
            getForecast();  
      }
    
    else if (typeof e.payload["KEY_GETTIDE"] != "undefined")
      {
        getTide();
      }
  }                     
);

