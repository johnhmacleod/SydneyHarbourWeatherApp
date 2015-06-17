#include <pebble.h>
  
#define KEY_WIND_SPEED 0
#define KEY_WIND_DIR   1
#define KEY_TIME  2
#define KEY_WIND_SPEED1 3
#define KEY_WIND_DIR1   4
#define KEY_TIME1  5
#define KEY_WIND_SPEED2 6
#define KEY_WIND_DIR2   7
#define KEY_TIME2  8
#define KEY_FORECAST_ISSUED 9
#define KEY_GETWEATHER 20
#define KEY_GETFORECAST 21
#define KEY_GETTIDE 22
#define KEY_WIND_SPEED3 10
#define KEY_WIND_DIR3   11
#define KEY_TIME3  12
#define KEY_WIND_SPEED4 13
#define KEY_WIND_DIR4   14
#define KEY_TIME4  15
#define KEY_WIND_SPEED5 16
#define KEY_WIND_DIR5   17
#define KEY_TIME5  18

#ifdef PBL_COLOR
  #define myColour GColorDarkCandyAppleRed
#else
  #define myColour GColorBlack
#endif

void showWeather();
static void redisplay(int animate);
static Window *s_main_window;
static TextLayer *s_time_layer;
static TextLayer *s_weather_layer[6];
static TextLayer *s_weather_title[6];

static GRect g1, g2, g3, g4, g5, g6, g7, g8, g9, gA, gB, gC, gD, gE, gF, gG;

static int shift = 0;

//static GFont s_time_font;
static GFont s_weather_font, s_weather_title_font;

static BitmapLayer *s_background_layer;
static GBitmap *s_background_bitmap;

static void update_time() {
  // Get a tm structure
  time_t temp = time(NULL); 
  struct tm *tick_time = localtime(&temp);

  // Create a long-lived buffer
  static char buffer[] = "00:00:00";

  // Write the current hours and minutes into the buffer
  if(clock_is_24h_style() == true) {
  //Use 2h hour format
    strftime(buffer, sizeof("00:00:00"), "%H:%M:%S", tick_time);
  } else {
    //Use 12 hour format
    strftime(buffer, sizeof("00:00:00"), "%I:%M:%S", tick_time);
  }

  // Display this time on the TextLayer
  text_layer_set_text(s_time_layer, buffer);
}


void on_animation_stopped(Animation *anim, bool finished, void *context)
{
    //Free the memoery used by the Animation
    property_animation_destroy((PropertyAnimation*) anim);
}
 
void animate_layer(PropertyAnimation **anim, Layer *layer, GRect *start, GRect *finish, int duration, int delay)
{
    //Declare animation
    *anim = property_animation_create_layer_frame(layer, start, finish);
 
    //Set characteristics
    animation_set_duration((Animation*) *anim, duration);
    animation_set_delay((Animation*) *anim, delay);
 
    //Set stopped handler to free memory
    AnimationHandlers handlers = {
        //The reference to the stopped handler is the only one in the array
        .stopped = (AnimationStoppedHandler) on_animation_stopped
    };
    animation_set_handlers((Animation*) *anim, handlers, NULL);
 
    //Start animation!
    animation_schedule((Animation*) *anim);
}



static void long_select_click_handler(ClickRecognizerRef recognizer, void *context) {
      DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
  text_layer_set_text(s_weather_layer[0 + shift], "Wating");
  text_layer_set_text(s_weather_layer[1 + shift], "for data");
  text_layer_set_text(s_weather_layer[2 + shift], "refresh");
  text_layer_set_text(s_weather_title[0 + shift], "");
  text_layer_set_text(s_weather_title[1 + shift], "");
  text_layer_set_text(s_weather_title[2 + shift], "");
    // Add a key-value pair
    dict_write_uint8(iter, KEY_GETWEATHER, 0);
    // Send the message!
    app_message_outbox_send();

}

  void select_multi_click_handler(ClickRecognizerRef recognizer, void *context) {
  int i = click_number_of_clicks_counted(recognizer);
    
  if (i==2)
    {
      DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    // Add a key-value pair
    dict_write_uint8(iter, KEY_GETTIDE, 0);
    // Send the message!
    app_message_outbox_send();
  }
    
  }



static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
      DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    // Add a key-value pair
    dict_write_uint8(iter, KEY_GETFORECAST, 0);
    // Send the message!
    app_message_outbox_send();
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {

  if (shift > 0)
    {
  shift -= 1;
  redisplay(2);
  }
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
if (shift < 3)
  {
  shift += 1;
  redisplay(1);
}
}



static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
  window_long_click_subscribe(BUTTON_ID_SELECT, 0, long_select_click_handler, NULL);
  window_multi_click_subscribe(BUTTON_ID_SELECT, 2, 3, 200, true, select_multi_click_handler);

}


static void main_window_load(Window *window) {
  
  
  // Set up the weather areas
  // Use system font, apply it and add to Window
  s_weather_font = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  s_weather_title_font = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
  
  window_set_background_color(window, myColour);
  
  //Create GBitmap, then set to created BitmapLayer
//  s_background_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_BACKGROUND);
//  s_background_layer = bitmap_layer_create(GRect(0, 0, 144, 168));
//  bitmap_layer_set_bitmap(s_background_layer, s_background_bitmap);
//  layer_add_child(window_get_root_layer(window), bitmap_layer_get_layer(s_background_layer));
  
  // Create time TextLayer
  s_time_layer = text_layer_create(GRect(0, 138, 144, 30));
  
  text_layer_set_background_color(s_time_layer, myColour);
  text_layer_set_text_color(s_time_layer, GColorWhite);
  
  //Apply to TextLayer
  text_layer_set_font(s_time_layer, s_weather_font);
  text_layer_set_text_alignment(s_time_layer, GTextAlignmentCenter);
  
  // Add it as a child layer to the Window's root layer
  layer_add_child(window_get_root_layer(window), text_layer_get_layer(s_time_layer));

  // Set some intial string
  text_layer_set_text(s_time_layer, "00:00:00");  

  
  
  s_weather_layer[0] = text_layer_create(GRect(0, 0, 144, 28));
  s_weather_title[0] = text_layer_create(GRect(0, 28, 144, 18));
  s_weather_layer[1] = text_layer_create(GRect(0, 46, 144, 28));
  s_weather_title[1] = text_layer_create(GRect(0, 74, 144, 18));
  s_weather_layer[2] = text_layer_create(GRect(0, 92, 144, 28));
  s_weather_title[2] = text_layer_create(GRect(0, 120, 144, 18));
  s_weather_layer[3] = text_layer_create(GRect(0, -46, 144, 28)); // Off Screen
  s_weather_title[3] = text_layer_create(GRect(0, -18, 144, 18)); // Off Screen
  s_weather_layer[4] = text_layer_create(GRect(0, -46, 144, 28)); // Off Screen
  s_weather_title[4] = text_layer_create(GRect(0, -18, 144, 18)); // Off Screen
  s_weather_layer[5] = text_layer_create(GRect(0, -46, 144, 28)); // Off Screen
  s_weather_title[5] = text_layer_create(GRect(0, -18, 144, 18)); // Off Screen
  

  int i;
  for (i =0; i < 6; i++)
    {
    text_layer_set_background_color(s_weather_layer[i], GColorClear);
    text_layer_set_text_color(s_weather_layer[i], GColorWhite);
    text_layer_set_text_alignment(s_weather_layer[i], GTextAlignmentCenter);
    text_layer_set_text(s_weather_layer[i], "");
    text_layer_set_font(s_weather_layer[i], s_weather_font);
    layer_insert_below_sibling(text_layer_get_layer(s_weather_layer[i]), text_layer_get_layer(s_time_layer));
//    layer_add_child(window_get_root_layer(window), text_layer_get_layer(s_weather_layer[i]));

    text_layer_set_background_color(s_weather_title[i], GColorClear);
    text_layer_set_text_color(s_weather_title[i], GColorWhite);
    text_layer_set_text_alignment(s_weather_title[i], GTextAlignmentCenter);
    text_layer_set_font(s_weather_title[i], s_weather_title_font);
    layer_insert_below_sibling(text_layer_get_layer(s_weather_title[i]), text_layer_get_layer(s_time_layer));
//    layer_add_child(window_get_root_layer(window), text_layer_get_layer(s_weather_title[i]));

  }
    
  
  text_layer_set_text(s_weather_title[0], "All data");
  text_layer_set_text(s_weather_title[1], "sourced & (c)");
  text_layer_set_text(s_weather_title[2], "www.bom.gov.au");
  
  // Make sure the time is displayed from the start
  update_time();
}



static void main_window_unload(Window *window) {
  //Unload GFont
  
  //fonts_unload_custom_font(s_weather_font);
  //fonts_unload_custom_font(s_weather_title_font);
  
  //Destroy BitmapLayer
  bitmap_layer_destroy(s_background_layer);
  
  //Destroy GBitmap
  gbitmap_destroy(s_background_bitmap);
  
  // Destroy TextLayer
  text_layer_destroy(s_time_layer);
  
  // Destroy weather elements
  text_layer_destroy(s_weather_layer[0]);
  text_layer_destroy(s_weather_layer[1]);
  text_layer_destroy(s_weather_layer[2]);
  text_layer_destroy(s_weather_layer[3]);
  text_layer_destroy(s_weather_layer[4]);
  text_layer_destroy(s_weather_layer[5]);
  text_layer_destroy(s_weather_title[0]);
  text_layer_destroy(s_weather_title[1]);
  text_layer_destroy(s_weather_title[2]);
  text_layer_destroy(s_weather_title[3]);
  text_layer_destroy(s_weather_title[4]);
  text_layer_destroy(s_weather_title[5]);

  
}


static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_time();
  static bool sentIt = false;
  
  // Get weather update every 10 minutes
  if(!sentIt && tick_time->tm_min % 10 == 8) {
    // Begin dictionary

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    // Add a key-value pair
    dict_write_uint8(iter, KEY_GETWEATHER, 0);
    // Send the message!
    app_message_outbox_send();
    sentIt = true;
  }
  else if ((tick_time->tm_min % 10)!= 8)
    sentIt = false;
}

  static char wind_speed_buffer[8];
  static char time_buffer[32];
  static char wind_dir_buffer[32];
  static char weather_layer_buffer[32];
  static char weather_layer_buffer1[32];
  static char weather_layer_buffer2[32];

static char weather_layer_buffer3[32];
static char weather_layer_buffer4[32];
static char weather_layer_buffer5[32];

  static char wind_speed_buffer1[8];
  static char time_buffer1[32];
  static char wind_dir_buffer1[32];

  static char wind_speed_buffer2[8];
  static char time_buffer2[32];
  static char wind_dir_buffer2[32];

  static char wind_speed_buffer3[8];
  static char time_buffer3[32];
  static char wind_dir_buffer3[32];

  static char wind_speed_buffer4[8];
  static char time_buffer4[32];
  static char wind_dir_buffer4[32];

  static char wind_speed_buffer5[8];
  static char time_buffer5[32];
  static char wind_dir_buffer5[32];

static void redisplay(int animate)
  {

    snprintf(weather_layer_buffer, sizeof(weather_layer_buffer), "%s %s", wind_speed_buffer, wind_dir_buffer);
    text_layer_set_text(s_weather_layer[0], weather_layer_buffer);
    text_layer_set_text(s_weather_title[0], time_buffer);

    snprintf(weather_layer_buffer1, sizeof(weather_layer_buffer1), "%s %s", wind_speed_buffer1, wind_dir_buffer1);
    text_layer_set_text(s_weather_layer[1], weather_layer_buffer1);
    text_layer_set_text(s_weather_title[1], time_buffer1);   

    snprintf(weather_layer_buffer2, sizeof(weather_layer_buffer2), "%s %s", wind_speed_buffer2, wind_dir_buffer2);
    text_layer_set_text(s_weather_layer[2], weather_layer_buffer2);
    text_layer_set_text(s_weather_title[2], time_buffer2);

    snprintf(weather_layer_buffer3, sizeof(weather_layer_buffer3), "%s %s", wind_speed_buffer3, wind_dir_buffer3);
    text_layer_set_text(s_weather_layer[3], weather_layer_buffer3);
    text_layer_set_text(s_weather_title[3], time_buffer3);

    snprintf(weather_layer_buffer4, sizeof(weather_layer_buffer4), "%s %s", wind_speed_buffer4, wind_dir_buffer4);
    text_layer_set_text(s_weather_layer[4], weather_layer_buffer4);
    text_layer_set_text(s_weather_title[4], time_buffer4);
 
    snprintf(weather_layer_buffer5, sizeof(weather_layer_buffer5), "%s %s", wind_speed_buffer5, wind_dir_buffer5);
    text_layer_set_text(s_weather_layer[5], weather_layer_buffer5);
    text_layer_set_text(s_weather_title[5], time_buffer5);
    
  
if (animate != 0) //Shifting
  {
  static PropertyAnimation *pa1, *pa2, *pa3, *pa4, *pa5, *pa6, *pa7, *pa8;
    
  g1 = GRect(0, 0, 144, 28); // 0 Data going out - from
  g2 = GRect(0, -46, 144, 28); // 0 Data going out - to
  g3 = GRect(0, 28, 144, 18); // 0 Title going out - from
  g4 = GRect(0, -18, 144, 18); // 0 Title going out - to
  g5 = GRect(0, 46, 144, 28); // 1 Data from
  g6 = GRect(0, 0, 144, 28); // 1 Data to (0 Data)
  g7 = GRect(0, 74, 144, 18); // 1 Title from
  g8 = GRect(0, 28, 144, 18); // 1 Title to (0 Title)
  g9 = GRect(0, 92, 144, 28); // 2 Data from
  gA = GRect(0, 46, 144, 28); // 2 Data to (1 Data)
  gB = GRect(0, 120, 144, 18); // 2 Title from
  gC = GRect(0, 74, 144, 18); // 2 Title to (1 Title)
  gD = GRect(0, 138, 144, 28); // New data 2 from off screen
  gE = GRect(0, 92, 144, 28); // New data 2 to (2 Data)
  gF = GRect(0, 166, 144, 18); // New title 2 from off screen
  gG = GRect(0, 120, 144, 18); // New title 2 to (2 Title)
  if (animate == 1) //up
    {
    animate_layer(&pa1, text_layer_get_layer(s_weather_layer[shift - 1]), &g1, &g2, 500, 0);
    animate_layer(&pa2, text_layer_get_layer(s_weather_title[shift - 1]), &g3, &g4, 500, 30);
    animate_layer(&pa3, text_layer_get_layer(s_weather_layer[0 + shift]), &g5, &g6, 500, 60);
    animate_layer(&pa4, text_layer_get_layer(s_weather_title[0 + shift]), &g7, &g8, 500, 90);
    animate_layer(&pa5, text_layer_get_layer(s_weather_layer[1 + shift]), &g9, &gA, 500, 120);
    animate_layer(&pa6, text_layer_get_layer(s_weather_title[1 + shift]), &gB, &gC, 500, 150);
    animate_layer(&pa7, text_layer_get_layer(s_weather_layer[2 + shift]), &gD, &gE, 500, 180);
    animate_layer(&pa8, text_layer_get_layer(s_weather_title[2 + shift]), &gF, &gG, 500, 210);
  }
  else // Down
   {
    animate_layer(&pa3, text_layer_get_layer(s_weather_layer[0 + shift]), &g2, &g1, 500, 0);
    animate_layer(&pa4, text_layer_get_layer(s_weather_title[0 + shift]), &g4, &g3, 500, 30);
    animate_layer(&pa5, text_layer_get_layer(s_weather_layer[1 + shift]), &g6, &g5, 500, 60);
    animate_layer(&pa6, text_layer_get_layer(s_weather_title[1 + shift]), &g8, &g7, 500, 90);
    animate_layer(&pa7, text_layer_get_layer(s_weather_layer[2 + shift]), &gA, &g9, 500, 120);
    animate_layer(&pa8, text_layer_get_layer(s_weather_title[2 + shift]), &gC, &gB, 500, 150);
    animate_layer(&pa1, text_layer_get_layer(s_weather_layer[shift + 3]), &gE, &gD, 500, 180);
    animate_layer(&pa2, text_layer_get_layer(s_weather_title[shift + 3]), &gG, &gF, 500, 210);
  } 
    
}

}

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // Store incoming information

  // Read first item
  Tuple *t = dict_read_first(iterator);

  // For all items
  while(t != NULL) {
    // Which key was received?
    switch(t->key) {
    case KEY_TIME:
      snprintf(time_buffer, sizeof(time_buffer), "North Head %s", t->value->cstring);
      break;
    case KEY_WIND_SPEED:
      snprintf(wind_speed_buffer, sizeof(wind_speed_buffer), "%s", t->value->cstring);
      break;
    case KEY_WIND_DIR:
      snprintf(wind_dir_buffer, sizeof(wind_dir_buffer), "%s", t->value->cstring);
    case KEY_TIME1:
      snprintf(time_buffer1, sizeof(time_buffer1), "Sydney Hbr %s", t->value->cstring);
      break;
    case KEY_WIND_SPEED1:
      snprintf(wind_speed_buffer1, sizeof(wind_speed_buffer1), "%s", t->value->cstring);
      break;
    case KEY_WIND_DIR1:
      snprintf(wind_dir_buffer1, sizeof(wind_dir_buffer1), "%s", t->value->cstring);
    case KEY_TIME2:
      snprintf(time_buffer2, sizeof(time_buffer2), "Ft Denison %s", t->value->cstring);
      break;
    case KEY_WIND_SPEED2:
      snprintf(wind_speed_buffer2, sizeof(wind_speed_buffer2), "%s", t->value->cstring);
      break;
    case KEY_WIND_DIR2:
      snprintf(wind_dir_buffer2, sizeof(wind_dir_buffer2), "%s", t->value->cstring);
      break;
    case KEY_TIME3:
      snprintf(time_buffer3, sizeof(time_buffer3), "Syd Airport %s", t->value->cstring);
      break;
    case KEY_WIND_SPEED3:
      snprintf(wind_speed_buffer3, sizeof(wind_speed_buffer3), "%s", t->value->cstring);
      break;
    case KEY_WIND_DIR3:
      snprintf(wind_dir_buffer3, sizeof(wind_dir_buffer3), "%s", t->value->cstring);
      break;
    case KEY_TIME4:
      snprintf(time_buffer4, sizeof(time_buffer4), "Wattamolla %s", t->value->cstring);
      break;
    case KEY_WIND_SPEED4:
      snprintf(wind_speed_buffer4, sizeof(wind_speed_buffer4), "%s", t->value->cstring);
      break;
    case KEY_WIND_DIR4:
      snprintf(wind_dir_buffer4, sizeof(wind_dir_buffer4), "%s", t->value->cstring);
      break;
    case KEY_TIME5:
      snprintf(time_buffer5, sizeof(time_buffer5), "Bellambi %s", t->value->cstring);
      break;
    case KEY_WIND_SPEED5:
      snprintf(wind_speed_buffer5, sizeof(wind_speed_buffer5), "%s", t->value->cstring);
      break;
    case KEY_WIND_DIR5:
      snprintf(wind_dir_buffer5, sizeof(wind_dir_buffer5), "%s", t->value->cstring);
      break;

    default:
      APP_LOG(APP_LOG_LEVEL_ERROR, "Key %d not recognized!", (int)t->key);
      break;
    }

    // Look for next item
    t = dict_read_next(iterator);
  }
  redisplay(0);
  
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}
  
static void init() {
  // Create main Window element and assign to pointer
  s_main_window = window_create();
  window_set_click_config_provider(s_main_window, click_config_provider);
  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });
  
#ifndef PBL_COLOR
  window_set_fullscreen(s_main_window, true);
#endif

  // Show the Window on the watch, with animated=true
  window_stack_push(s_main_window, true);
  
  // Register with TickTimerService
  tick_timer_service_subscribe(SECOND_UNIT, tick_handler);
  
  // Register callbacks
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  
  // Open AppMessage
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
    APP_LOG(APP_LOG_LEVEL_INFO, "Inbox Maximum %d", (int)app_message_inbox_size_maximum());
}

static void deinit() {
  // Destroy Window
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
