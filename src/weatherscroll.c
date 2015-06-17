#include "pebble.h"

void showWeather();
void hideWeather();
static Window *weatherWindow;

// This is a scroll layer
static ScrollLayer *scroll_layer;
// We also use a text layer to scroll in the scroll layer
static TextLayer *text_layer;
// The scroll layer can other things in it such as an invert layer
// static InverterLayer *inverter_layer;
// Lorum ipsum to have something to scroll
static char scroll_text[] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quam tellus, fermentu m quis vulputate quis, vestibulum interdum sapien. Vestibulum lobortis pellentesque pretium. Quisque ultricies purus e u orci convallis lacinia. Cras a urna mi. Donec convallis ante id dui dapibus nec ullamcorper erat egestas. Aenean a m auris a sapien commodo lacinia. Sed posuere mi vel risus congue ornare. Curabitur leo nisi, euismod ut pellentesque se d, suscipit sit amet lorem. Aliquam eget sem vitae sem aliquam ornare. In sem sapien, imperdiet eget pharetra a, lacin ia ac justo. Suspendisse at ante nec felis facilisis eleifend.";


static const int vert_scroll_text_padding = 4;
// Setup the scroll layer on window load
// We do this here in order to be able to get the max used text size

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
hideWeather();
}

static void scroll_offset_change(ScrollLayer *scroll_layer, void *context) {}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}


static void weather_window_load(Window *window) {

Layer *window_layer = window_get_root_layer(window);
GRect bounds = layer_get_frame(window_layer);
GRect max_text_bounds = GRect(0, 0, bounds.size.w, 2000);
// Initialize the scroll layer
scroll_layer = scroll_layer_create(bounds);
// This binds the scroll layer to the window so that up and down map to scrolling
// You may use scroll_layer_set_callbacks to add or override interactivity
scroll_layer_set_click_config_onto_window(scroll_layer, window);
scroll_layer_set_callbacks 	(scroll_layer,		(ScrollLayerCallbacks) {.click_config_provider = click_config_provider,
                                                                     .content_offset_changed_handler = scroll_offset_change} ); 	
//window_set_click_config_provider(weatherWindow, click_config_provider);
  // Initialize the text layer
text_layer = text_layer_create(max_text_bounds);
text_layer_set_text(text_layer, scroll_text);
// Change the font to a nice readable one
// This is system font; you can inspect pebble_fonts.h for all system fonts
// or you can take a look at feature_custom_font to add your own font
text_layer_set_font(text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
// Trim text layer and scroll content to fit text box
GSize max_size = text_layer_get_content_size(text_layer);
text_layer_set_size(text_layer, max_size);
scroll_layer_set_content_size(scroll_layer, GSize(bounds.size.w, max_size.h + vert_scroll_text_padding));
// Add the layers for display
scroll_layer_add_child(scroll_layer, text_layer_get_layer(text_layer));
// The inverter layer will highlight some text
// inverter_layer = inverter_layer_create(GRect(0, 28, bounds.size.w, 28));
// scroll_layer_add_child(scroll_layer, inverter_layer_get_layer(inverter_layer));
layer_add_child(window_layer, scroll_layer_get_layer(scroll_layer));
}



static void weather_window_unload(Window *window) {
// inverter_layer_destroy(inverter_layer);
text_layer_destroy(text_layer);
scroll_layer_destroy(scroll_layer);
}

void showWeather(void) {
weatherWindow = window_create();
window_set_window_handlers(weatherWindow, (WindowHandlers) {
.load = weather_window_load,
.unload = weather_window_unload,
});
window_stack_push(weatherWindow, true /* Animated */);
}

void hideWeather(void) {
window_stack_remove(weatherWindow, true);
}