var turl = localStorage.getItem('turl') ? localStorage.getItem('turl') : ''; 
var furl = localStorage.getItem('furl') ? localStorage.getItem('furl') : ''; 
var ourl = localStorage.getItem('ourl') ? localStorage.getItem('ourl') : ''; 

console.log ('furl='+furl);
console.log ('ourl='+ourl);
console.log ('turl='+turl);


//turl = 'http://www.bom.gov.au/australia/tides/print.php?region=NSW&aac=NSW_TP007&type=tide&tz=Australia/Sydney&days=2&date=';

console.log('--->'+decodeURIComponent(encodeURIComponent(turl)));

//furl = 'http://www.bom.gov.au/marine/lite/forecast/sydney-closed-waters.shtml';
//ourl = 'http://www.bom.gov.au/nsw/observations/sydney.shtml';

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
var range;

function getTide() {
//  var url = "http://www.bom.gov.au/australia/tides/print.php?aac=NSW_TP007&type=tide&region=NSW&tz=Australia/Sydney&days=2&date=";
  var url = turl;
  if (url !== "") {
  //var url1 = "&region=NSW&tz=Australia/Sydney&days=2"; // Ask for 2 days so we can work out how long to the next tide when the last
                                                      // tide for the day has already passed
  var d = new Date();
  var url2 = url + d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear(); // + url1;

//  console.log(url2);
    xhrRequest(url2, 'GET', 
    function(responseText) {

      // Assemble dictionary using our keys
      var response = responseText;
      HTMLTable(response);
      Pebble.showSimpleNotificationOnPebble("Tides","For " + d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + 
                                            " Local Times\n" + nt + "\n" + t1);  
    }      
  );
  }
  else
    Pebble.showSimpleNotificationOnPebble("Tides","Tides URL not configured");
  console.log("turl:"+url+":");
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
  range = "";
  t1 = "";
  
  for (i = 0; i < 5; i++) {
    text = text.substring(text.search(/<th rowspan=[^=]*..instance[^>]*tide.>/));
    r[i] = text.substring(text.search(">")+1,text.search(/<\/th>/));
    text = text.substring(text.search(/<td[^=]*..localtime[^>]*>/));
    s[i] = text.substring(text.search(">")+1,text.search(/<\/td>/)).replace(" ","");
    text = text.substring(text.search(/<td[^=]*..height[^>]*>/));
    t[i] = text.substring(text.search(">")+1,text.search(/<\/td>/));
    console.log(i +"->"+ "r[i]="+r[i]+ " s[i]="+s[i]+ " t[i]="+t[i]);
    
    hrs = Number(s[i].substring(0,s[i].search(":")));
    mins = Number(s[i].substring(s[i].search(":")+1,s[i].search(/[ap]m/)));

    var pmFlag = s[i].search("am") < 0; //True if PM
    console.log(i + "-> hrs: " + hrs + " mins: " + mins + " pmFlag: " + pmFlag);
    if (!pmFlag && ampm == 12)  //We were previously correcting for PM but now back to AM - we've skipped to the next day
      addDay = 24 * 3600 * 1000; // One day in msec
    else addDay = 0;
    console.log(i + "-> addDay " + addDay);
    
    if (pmFlag && hrs < 12)  // Must be PM (but only need to adjust when hours go past 12)
      ampm = 12;
    else
      ampm = 0;
    
    if (!pmFlag && hrs == 12) 
      hrs = 0;
    console.log(i + "-> hrs (after midday correction): " + hrs + " ampm: " + ampm);
    
    var d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(),  hrs + ampm, mins, 0, 0); // Time of tide
    diff = addDay + d2.getTime() - d.getTime();
    console.log ("addDay: " + addDay + " Diff: " + diff);
   if (diff > 0) {
  // Later than now
  
    var hdiff = (diff / 3600000) | 0;
    var mdiff = (((diff/3600000) - hdiff) * 60 ) | 0;
     console.log(i +"->"+ " Hdiff=" + hdiff + " hdiff /3600000=" +diff/3600000+ " Mdiff=" + mdiff);
    if (nt === "") // We have not yet found the next tide
      {
        if (i > 0) // This is not the first tide of the day so we can work out the range
          {
            var lvl1, lvl2, pc;
            lvl1 = Number(t[i-1].replace("m",""));  // Get rid of the metres symbole
            lvl2 = Number(t[i].replace("m","")); // Get rid of the netres symbol
            pc = Math.abs(lvl1-lvl2) / 1.89 * 100; // Adjust for max possible tide
            range = "\n" + (pc | 0) + "% max range";
            console.log("Range: " + range);
          }
        else
          range = "";
     if (hdiff === 0) // Less than an hour to go
       nt = r[i] + " in " + mdiff + "m";
     else // More than an hour to go
       nt = r[i] + " in " + hdiff + "h " + mdiff + "m";
     nt = nt + range;
      }
    console.log(i +"->"+" Next " + r[i] + " tide in " + hdiff + " hours" + mdiff + " mins");
    console.log(i + "->" + d.getFullYear() + ":" + d.getMonth()+":"+d.getDate()+":"+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":::" + d.getTime());
    console.log(i + "->" + d2.getFullYear() + ":" + d2.getMonth()+":"+d2.getDate()+":"+d2.getHours()+":"+d2.getMinutes()+":"+d2.getSeconds()+":::" + d2.getTime());
   }

    t1 = t1 + s[i] + " " + t[i].replace(" ","") + "\n"; // Get rid of needless spaces
  }
}


function getForecast() {
//  var url = "http://www.bom.gov.au/marine/lite/forecast/sydney-closed-waters.shtml";
  var url = furl;
  if (url !== '') {
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
    });
  }
    else
      Pebble.showSimpleNotificationOnPebble("Forecast", "Forecast URL not confiured");
}

function getWind() {
  // Construct URL
//  var url = "http://www.bom.gov.au/nsw/observations/sydney.shtml";
  var url = ourl;
  if (url !== '') {
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
    }  // End Function    
   ); // End xhrRequest()
  }
  else
    {
          var dictionary = {
        "KEY_WIND_SPEED": "Observa",
        "KEY_WIND_DIR": "tions",
        "KEY_TIME" : "",
        "KEY_WIND_SPEED1": "URL",
        "KEY_WIND_DIR1": "",
        "KEY_TIME1" : "",
        "KEY_WIND_SPEED2": "Undefin",
        "KEY_WIND_DIR2": "ed",
        "KEY_TIME2" : "",
        "KEY_WIND_SPEED3": "",
        "KEY_WIND_DIR3": "",
        "KEY_TIME3" : "",
        "KEY_WIND_SPEED4": "",
        "KEY_WIND_DIR4": "",
        "KEY_TIME4" : "",
        "KEY_WIND_SPEED5": "",
        "KEY_WIND_DIR5": "",
        "KEY_TIME5" : ""
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
    }

Pebble.addEventListener('showConfiguration', function(e) {
  // Show config page
//  Pebble.openURL('http://www.patrickcatanzariti.com/find_me_anything/configurable.html?searchingFor=John');
  console.log(turl);
  Pebble.openURL('https://6b836609bedda8293bb9d3b47e879231281cd4d8.googledrive.com/host/0B7EcUQ9OPCb1fnBCbGxHYVcyY1M1eDBqb3M4Nzl6bFdHVWU3UXRpQmJNZzJwQzJYbjBaVnc/?turl=' +
                 encodeURIComponent(turl) + '&furl=' + encodeURIComponent(furl) + '&ourl=' + encodeURIComponent(ourl));
});


// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log("PebbleKit JS ready!");
    getWind();
  }
);

Pebble.addEventListener('webviewclosed',
  function(e) {
    console.log('Configuration window returned: ' + e.response);
    var options = JSON.parse(decodeURIComponent(e.response));
    var tmp = decodeURIComponent(options.ourl);
    if (tmp != 'undefined')
      ourl = tmp;
    tmp = decodeURIComponent(options.turl);
    if (tmp != 'undefined')
      turl = tmp;
    tmp = decodeURIComponent(options.furl);
        if (tmp != 'undefined')
          furl = tmp;
    console.log(turl);

  localStorage.setItem('turl', turl);
  localStorage.setItem('ourl', ourl);
  localStorage.setItem('furl', furl);
  
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

