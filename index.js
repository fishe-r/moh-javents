/** Manh Truong Nguyen, 000893836
 * Feb 17, 2023
 *
 * Stable, no bugs, no surprises
 * Base requirements + extra features:
 *   + Progress bar around the screen with changing background colors and transition
 *   + Progress bar resets on image changes by the user
 *   + Progress bar self adjusts to any screen sizes
 *   + Timer is on page title as well
 *   + Images are 100% different on every change
 *   + Images have titles and alt texts
 *   + Click event on images has 2 different animations
 *   + User input loosely accepts signs of numbers, integers or decimals, white spaces before and after a number
 *   + Countdown text also changes color for better contrast
 *
 * This script contains 1 main running code block, 3 global constants, 14 impure functions and 16 pure functions
 * Structure (Variable and function declarations follow this order):
 *   - Main block
 *   - Global constants:
 *      + INTERVAL_UNIT
 *      + INITIAL_STATES
 *      + IMAGES
 *   - Impure functions:
 *      + reset_states
 *      + animate_img
 *      + update_html_progress_bar
 *      + change_html_progress_bar_background
 *      + update_html_counter
 *      + update_html_timer
 *      + change_html_timer_background
 *      + handle_changing_image
 *      + handle_changing_images
 *      + attach_image
 *      + attach_images
 *      + choose_random_image
 *      + choose_random_images
 *      + random_int
 *   - Pure functions:
 *      + reset_cycle
 *      + update_cycle
 *      + update_count
 *      + store_current_key
 *      + store_current_keys
 *      + increment_count
 *      + get_object_keys
 *      + get_object_values
 *      + get_object_key_value_pairs
 *      + get_current_input_value
 *      + to_seconds
 *      + to_integer
 *      + round
 *      + is_number
 *      + is_number_in_range
 *      + is_allowed_keystroke
 * Each function has its own encapsulated functionality but may be a dependency of other functions.
 *
 * Predefined JSDoc data types for typehints
 * @typedef {{ src: string, alt: string, key: string }} Image
 * @typedef {{ frog: Image, hamster: Image, squirrel: Image }} Animals
 * @typedef {{ evos: Image, empire: Image, cowboy: Image }} Teams
 * @typedef {{ pizza: Image, pasta: Image, cake: Image }} Foods
 * @typedef {{ animals: Animals, teams: Teams, foods: Foods }} Images
 * @typedef {{ count: number, current_keys: Array.<string>, change: { interval: number, cycle: number, max_cycle: number }}} States
 */

/* ===========================================================================================
 * ======================================= Main Block ========================================
 * ===========================================================================================
 */

/**
 * Entry point of application. All side effects or mutation of
 * states or DOM manipulations must go inside this code block.
 * All pure functions and constants must be outside of this block.
 */
window.onload = () => {
  /** @type {Array.<HTMLImageElement>} */
  const html_imgs = Array.from(document.querySelectorAll('.custom--img')) // Working with array of {HTMLImageElement} is easier than working with {NodeList}

  /** @type {HTMLButtonElement} */
  const html_button_randomize = document.querySelector(
    '.custom--button-randomize'
  )

  /** @type {HTMLSpanElement} */
  const html_span_counter = document.querySelector('.custom--span-counter')

  /** @type {HTMLSpanElement} */
  const html_span_timer = document.querySelector('.custom--span-timer')

  /** @type {HTMLInputElement} */
  const html_input_timeout = document.querySelector('.custom--input-timeout')

  /** @type {HTMLDivElement} */
  const html_div_progress_bar_1 = document.querySelector(
    '.custom--progress-bar-1'
  )

  /** @type {HTMLDivElement} */
  const html_div_progress_bar_2 = document.querySelector(
    '.custom--progress-bar-2'
  )

  /** @type {HTMLDivElement} */
  const html_div_progress_bar_3 = document.querySelector(
    '.custom--progress-bar-3'
  )

  /** @type {HTMLDivElement} */
  const html_div_progress_bar_4 = document.querySelector(
    '.custom--progress-bar-4'
  )

  /* Condition to make sure that every element is available in the DOM. Just to be on the safe side */
  const is_DOM_loaded =
    html_imgs.length &&
    html_button_randomize &&
    html_span_counter &&
    html_span_timer &&
    html_input_timeout &&
    html_div_progress_bar_1 &&
    html_div_progress_bar_2 &&
    html_div_progress_bar_3 &&
    html_div_progress_bar_4

  /**
   * All attributes of this application must be stored in this object
   *
   * @type {States}
   */
  let states = INITIAL_STATES

  /** @type {number} */

  if (is_DOM_loaded) {
    /* Set initial images on page first load
       Counting of changes is not initiated in this phase */
    states = handle_changing_images(IMAGES, states, html_imgs, 0)

    /* Set images to be changed every n seconds where n is the `interval`
       property of the `states.change` object */
    setInterval(() => {
      const { interval, cycle, max_cycle } = states.change
      const cycle_millisecond = interval - cycle * TIMER_INTERVAL
      const cycle_second = to_seconds(cycle_millisecond)
      const is_timing = cycle < max_cycle

      if (is_timing) states = update_cycle(states, 1)
      if (!is_timing) {
        states = handle_changing_images(IMAGES, states, html_imgs, 3)
        states = reset_cycle(states)
        update_html_counter(html_span_counter, states)
      }

      update_document_title(cycle_second)
      update_html_timer(html_span_timer, cycle_second)
      change_html_timer_background(cycle, max_cycle, html_span_timer)
      update_html_progress_bar(
        html_div_progress_bar_1,
        html_div_progress_bar_2,
        html_div_progress_bar_3,
        html_div_progress_bar_4,
        max_cycle,
        cycle
      )
      change_html_progress_bar_background(
        html_div_progress_bar_1,
        html_div_progress_bar_2,
        html_div_progress_bar_3,
        html_div_progress_bar_4,
        max_cycle,
        cycle
      )
    }, TIMER_INTERVAL)

    /* Add handler to click event of Randomize button */
    html_button_randomize.onclick = () => {
      states = handle_changing_images(IMAGES, states, html_imgs, 3)
      states = reset_cycle(states)
      update_html_counter(html_span_counter, states)
    }

    /* Add handlers to click event of <img> tags */
    for (const [index, html_img] of html_imgs.entries())
      html_img.onclick = () => {
        const animation_duration = 1000
        const class_names = ['primary', 'secondary']
        setTimeout(
          () =>
            (states = handle_changing_image(
              IMAGES,
              states,
              html_img,
              states.current_keys[index],
              index
            )),
          animation_duration / 2
        )
        states = reset_cycle(states)
        update_html_counter(html_span_counter, states)
        animate_img(
          html_img,
          animation_duration,
          Math.random() > 0.5 ? class_names[0] : class_names[1]
        )
      }

    /* Add handler ot keyboard event */
    html_input_timeout.addEventListener('keyup', (event) => {
      const input = get_current_input_value(event)
      const is_valid_input = is_number(input) && is_number_in_range(input)
      const is_valid_keypress = is_allowed_keystroke(event)
      if (is_valid_keypress && is_valid_input)
        states = {
          ...states,
          change: {
            cycle: 0,
            interval: to_integer(input),
            max_cycle: round(to_integer(input) / TIMER_INTERVAL),
          },
        }
    })
  }
}

/* ===========================================================================================
 * ================================== Start Global Variables =================================
 * ===========================================================================================
 */

/**
 * The base unit that timer uses to create an interval
 *
 * @type {number}
 */
const TIMER_INTERVAL = 100

/**
 * The initial attributes of application's states
 * `max_cycle` = (round) `interval` / `timer_interval` - 1
 *
 * @type {States}
 */
const INITIAL_STATES = {
  count: 0,
  change: { cycle: 0, max_cycle: 50, interval: 5000 },
  current_keys: [],
}

/**
 * More images can be added to each category but the number
 * of categories must remain the same as the number of <img>
 * tags in index.html
 * ANY ADDITION OF DATA IN THE FUTURE MUST COMFORM TO THIS OBJECT'S FORMAT
 *
 * @type {ImageCollection}
 */
const IMAGES = {
  /* Categories */
  animals: {
    /* Images */
    frog: {
      key: 'frog',
      src: 'images/frog.png',
      alt: 'Smilling Frog',
    },
    hamster: {
      key: 'hamster',
      src: 'images/hamster.png',
      alt: 'Guinea Pig',
    },
    squirrel: {
      key: 'squirrel',
      src: 'images/squirrel.png',
      alt: 'Squirrel Holding A Nut',
    },
  },
  teams: {
    evos: {
      key: 'evos',
      src: 'images/evos.png',
      alt: 'Esports Team Evos',
    },
    empire: {
      key: 'empire',
      src: 'images/empire.png',
      alt: 'Esports Team Empire',
    },
    cowboy: {
      key: 'cowboy',
      src: 'images/cowboy.png',
      alt: 'Team Cowboy',
    },
  },
  foods: {
    pizza: {
      key: 'pizza',
      src: 'images/pizza.png',
      alt: 'Full Pizza with A Cut Slice',
    },
    pasta: {
      key: 'pasta',
      src: 'images/pasta.png',
      alt: 'Dish of Pasta and Tomatoes',
    },
    cake: {
      key: 'cake',
      src: 'images/cake.png',
      alt: 'Cake with a Spoon',
    },
  },
}

/* ===========================================================================================
 * ===================================== Impure Functions ====================================
 * ===========================================================================================
 */

/**
 * reset all attributes of states back to initial values
 *
 * @param {States} _states The current states.
 * @param {States} initial_states The initial states
 */
const reset_states = (_states, initial_states) => (_states = initial_states)

/**
 * Add and timeout remove animation class to <img> tag
 * to create animation
 *
 * @param {HTMLImageElement} html_img The <img> tag to be animated
 * @param {number} duration The duration of the animation in milliseconds
 * @param {string} class_name The class name of the animation
 */
const animate_img = (html_img, duration, class_name) => {
  html_img.classList.add('custom--img-animation-' + class_name)
  setTimeout(() => {
    html_img.classList.remove('custom--img-animation-' + class_name)
  }, duration)
}

/**
 * Updates the title of document according to timer
 *
 * @param {number} cycle_second The current cycle in second
 */
const update_document_title = (cycle_second) =>
  (document.title = `${cycle_second}s to action`)

/**
 * Animates progress bars. This animation is done by
 * creating 4 bars and update bars' width or height
 * on each inteval cycle. All bars have the same length
 * of total sides of screen.
 *
 * @param {HTMLElement} html_progress_bar_1 The top bar
 * @param {HTMLElement} html_progress_bar_2 The right bar
 * @param {HTMLElement} html_progress_bar_3 The bottom bar
 * @param {HTMLElement} html_progress_bar_4 The left bar
 * @param {number} max_cycle The max cycle of interval
 * @param {number} cycle The current cycle of interval
 */
const update_html_progress_bar = (
  html_progress_bar_1,
  html_progress_bar_2,
  html_progress_bar_3,
  html_progress_bar_4,
  max_cycle,
  cycle
) => {
  const progress_bar_length = 2 * (window.innerWidth + window.innerHeight)
  const length_per_cycle = progress_bar_length / max_cycle

  if (cycle === 1) {
    html_progress_bar_1.classList.add('transition')
    html_progress_bar_2.classList.add('transition')
    html_progress_bar_3.classList.add('transition')
    html_progress_bar_4.classList.add('transition')
  }

  if (cycle === max_cycle) {
    html_progress_bar_1.classList.remove('transition')
    html_progress_bar_2.classList.remove('transition')
    html_progress_bar_3.classList.remove('transition')
    html_progress_bar_4.classList.remove('transition')
  }

  html_progress_bar_1.style.width = `${length_per_cycle * cycle}px`
  html_progress_bar_2.style.height = `${length_per_cycle * cycle}px`
  html_progress_bar_3.style.width = `${length_per_cycle * cycle}px`
  html_progress_bar_4.style.height = `${length_per_cycle * cycle}px`
}

/**
 * Changes the background color of progress bar
 * Every time the interval reach a third of total cycles, the background color will change
 * The classes of background color are Bootstrap classes
 *
 * @param {HTMLElement} html_progress_bar_1 The top bar
 * @param {HTMLElement} html_progress_bar_2 The right bar
 * @param {HTMLElement} html_progress_bar_3 The bottom bar
 * @param {HTMLElement} html_progress_bar_4 The left bar
 * @param {number} max_cycle The max cycle of interval
 * @param {number} cycle The current cycle of interval
 */
const change_html_progress_bar_background = (
  html_progress_bar_1,
  html_progress_bar_2,
  html_progress_bar_3,
  html_progress_bar_4,
  max_cycle,
  cycle
) => {
  const css_bg_classes = ['bg-success', 'bg-warning', 'bg-danger']
  const third_of_max = max_cycle / 3
  const is_in_first_third = cycle < third_of_max
  const is_in_second_third = cycle >= third_of_max && cycle < 2 * third_of_max
  const is_in_last_third = cycle >= 2 * third_of_max

  for (const css_bg_class of css_bg_classes) {
    html_progress_bar_1.classList.remove(css_bg_class)
    html_progress_bar_2.classList.remove(css_bg_class)
    html_progress_bar_3.classList.remove(css_bg_class)
    html_progress_bar_4.classList.remove(css_bg_class)
  }

  // Lower cycle means higher countdown time
  if (is_in_first_third) {
    html_progress_bar_1.classList.add(css_bg_classes[0])
    html_progress_bar_2.classList.add(css_bg_classes[0])
    html_progress_bar_3.classList.add(css_bg_classes[0])
    html_progress_bar_4.classList.add(css_bg_classes[0])
  }
  if (is_in_second_third) {
    html_progress_bar_1.classList.add(css_bg_classes[1])
    html_progress_bar_2.classList.add(css_bg_classes[1])
    html_progress_bar_3.classList.add(css_bg_classes[1])
    html_progress_bar_4.classList.add(css_bg_classes[1])
  }
  if (is_in_last_third) {
    html_progress_bar_1.classList.add(css_bg_classes[2])
    html_progress_bar_2.classList.add(css_bg_classes[2])
    html_progress_bar_3.classList.add(css_bg_classes[2])
    html_progress_bar_4.classList.add(css_bg_classes[2])
  }
}

/**
 * Updates the counter element in DOM
 *
 * @param {HTMLElement} html_counter The html counter element
 * @param {States} states The current states
 */
const update_html_counter = (html_counter, { count }) =>
  (html_counter.textContent = `${count} time${count > 1 ? 's' : ''}`)

/**
 * Updates the timer element in DOM
 *
 * @param {HTMLElement} html_timer The html timer element
 * @param {number} second The currently timing second
 */
const update_html_timer = (html_timer, second) =>
  (html_timer.textContent = `${second}s`)

/**
 * Changes the background color of the timer html node
 * Every time the interval reach a third of total cycles, the background color will change
 * The classes of background color are Bootstrap classes
 *
 * @param {number} cycle The current cycle that the timer interval is in
 * @param {number} max_cycle The maximum cycle
 * @param {HTMLElement} html_timer The html timer tag
 */
const change_html_timer_background = (cycle, max_cycle, html_timer) => {
  const css_bg_classes = ['bg-success', 'bg-warning', 'bg-danger']
  const css_text_classes = ['text-white', 'text-dark']
  const third_of_max = max_cycle / 3
  const is_in_first_third = cycle < third_of_max
  const is_in_second_third = cycle >= third_of_max && cycle < 2 * third_of_max
  const is_in_last_third = cycle >= 2 * third_of_max

  for (const css_bg_class of css_bg_classes)
    html_timer.classList.remove(css_bg_class)

  for (const css_text_class of css_text_classes)
    html_timer.classList.remove(css_text_class)

  // Lower cycle means higher countdown time
  if (is_in_first_third)
    html_timer.classList.add(css_bg_classes[0], css_text_classes[0])
  if (is_in_second_third)
    html_timer.classList.add(css_bg_classes[1], css_text_classes[1])
  if (is_in_last_third)
    html_timer.classList.add(css_bg_classes[2], css_text_classes[0])
}

/**
 * This is top level function to handle all tasks that need to be done when
 * updating ONE image
 *
 * @param {Images} images A collection object of categories that themselves are objects containing images
 * @param {States} states The current states
 * @param {HTMLImageElement} html_tag The html tag that will contain the image
 * @param {string} current_key The key of currently displaying image
 * @param {index} index The index of category
 * @returns {States} The next states
 */
const handle_changing_image = (
  images,
  states,
  html_tag,
  current_key,
  index
) => {
  const category = get_object_keys(images)[index]
  const { src, alt, key } = choose_random_image(images, category, current_key)
  const { count } = increment_count(states, 1)
  const { current_keys } = store_current_key(states, key, index)

  attach_image(html_tag, src, alt)

  return { ...states, count, current_keys }
}

/**
 * This is top level function to handle all tasks that need to be done when
 * updating all images
 *
 * @param {Images} images A collection object of categories that themselves are objects containing images
 * @param {States} states The current states
 * @param {Array.<HTMLImageElement>} html_tags The html tags that will contain images
 * @param {number} increment_amount The amount to increment count state
 * @returns {States} The next states
 */
const handle_changing_images = (
  images,
  states,
  html_tags,
  increment_amount
) => {
  const next_images = choose_random_images(images, states.current_keys)
  const next_keys = next_images.map(({ key }) => key)
  const { count } = increment_count(states, increment_amount)
  const { current_keys } = store_current_keys(states, next_keys)

  attach_images(html_tags, next_images)

  return { ...states, count, current_keys }
}

/**
 * Attaches src and alt of one image to one html tag
 *
 * @param {HTMLImageElement} html_tag The tag to attach src and alt to
 * @param {string} src The image source
 * @param {string} alt The image alt text
 */
const attach_image = (html_tag, src, alt) => {
  html_tag.src = src
  html_tag.alt = alt
  html_tag.title = alt
}

/**
 * attaches images' srcs and alts to multiple html tags
 *
 * @param {Array.<HTMLImageElement>} html_tags An array of html tags to attach srcs and alts to
 * @param {Array.<Image>} images An array of images
 */
const attach_images = (html_tags, images) => {
  for (const index in html_tags)
    attach_image(html_tags[index], images[index].src, images[index].alt)
}

/**
 * Selects a random image from a category of images
 * Image is assured to be different from the current one
 *
 * @param {Images} images A collection object of categories that themselves are objects containing images
 * @param {string} category The category to pick an image
 * @param {string} current_key The key of current image
 * @returns {Image} The randomly selected image
 */
const choose_random_image = (images, category, current_key) => {
  const image_pack = images[category] // Access and get the images of a category
  const image_keys = get_object_keys(image_pack) // Extract the titles of those images
  const last_index = image_keys.length - 1
  const index = [random_int(last_index)] // Use an array to avoid using `let` in my code
  while (image_keys[index] === current_key) index[0] = random_int(last_index) // As long as the random image has the same title as the previous one, random another one
  const next_image = image_keys[index[0]]
  return image_pack[next_image]
}

/**
 * Selects random images from categories (1 image per category)
 *
 * @param {Images} images An collection object of categories that themselves are objects containing info of images
 * @param {Array.<string>} current_keys The titles of images currently on screen
 * @returns {Array.<Image>} One image for each category
 */
const choose_random_images = (images, current_keys) => {
  const next_images = []
  const categories = get_object_keys(images)
  for (const [index, category] of categories.entries()) {
    const next_image = choose_random_image(
      images,
      category,
      current_keys.length ? current_keys[index] : ''
    )
    next_images.push(next_image)
  }
  return next_images
}

/**
 * Generates a random integer in the [min, max] range (inclusive)
 *
 * @param {number} max The maximum boundary
 * @param {number} min The minimum boundary
 * @returns {number} A random integer between min and max (inclusive)
 */
const random_int = (max, min = 0) =>
  Math.floor(Math.random() * (max - min + 1)) + min

/* ===========================================================================================
 * ====================================== Pure Functions =====================================
 * ===========================================================================================
 */

/**
 * Reset cycle to 0
 *
 * @param {States} states The current states
 * @returns {States} The current states in cycle 0
 */
const reset_cycle = (states) => ({
  ...states,
  change: { ...states.change, cycle: 0 },
})

/**
 * Increments the cycle state in n amount
 *
 * @param {States} states The current states
 * @param {number} n The amount to increment
 * @returns {States} The next states
 */
const update_cycle = (states, n) => ({
  ...states,
  change: { ...states.change, cycle: states.change.cycle + n },
})

/**
 * Increments the count state in `count` amount
 *
 * @param {States} states The current states
 * @param {number} count The amount to increment
 * @returns {States} The next states
 */
const update_count = (states, count) => ({
  ...states,
  count: states.count + count,
})

/**
 * Updates one single key of the current_keys state
 *
 * @param {States} states The current states
 * @param {string} current_key The current image to be stored
 * @param {number} index The index in `current_keys` array where current image key should be stored
 * @returns {States} The updated states
 */
const store_current_key = (states, current_key, index) => {
  const current_keys = states.current_keys
  current_keys[index] = current_key
  return { ...states, current_keys }
}

/**
 * Updates entire current_keys state
 *
 * @param {States} states The current states
 * @param {Array.<string>} current_keys The array of current images to be stored
 * @returns {States} The updated states
 */
const store_current_keys = (states, current_keys) => ({
  ...states,
  current_keys,
})

/**
 * Calculates new count state
 *
 * @param {States} states The current states
 * @param {number} amount The amount to increment
 * @returns {States} The updated states
 */
const increment_count = (states, amount = 1) => ({
  ...states,
  count: states.count + amount,
})

/**
 * Wrapper function to get all keys of an object
 *
 * @returns {Array.<string>} All keys of an object
 */
const get_object_keys = (object) => Object.keys(object)

/**
 * Wrapper function to get all values of an object
 *
 * @returns {Array.<any>} All values of an object
 */
const get_object_values = (object) => Object.values(object)

/**
 * Wrapper function to get all values and keys of an object
 *
 * @returns {Array.<[string, any]>} All [key, value]s of an object
 */
const get_object_key_value_pairs = (object) => Object.entries(object)

/**
 * Gets the input value after user release a key from pressing down
 *
 * @param {Event} event The event of "keyup"
 * @returns {string} the input value
 */
const get_current_input_value = (event) => event.target.value

/**
 * Converts milliseconds to seconds with 1 decimal place
 *
 * @param {number} milliseconds The milliseconds to be converted
 * @returns {string} Seconds with 1 decimal place
 */
const to_seconds = (milliseconds) => (milliseconds / 1000).toFixed(1)

/**
 * Rounds and converts a decimal number into integer
 *
 * @param {string} value The decimal number string to be rounded
 * @returns {number} The rounded integer
 */
const to_integer = (value) => round(parseFloat(value))

/**
 * Rounds a decimal number to the nearest integer
 *
 * @param {number} float The number to be rounded
 * @returns {number} The rounded number
 */
const round = (float) => Math.round(float)

/**
 * Checks if a string is a number
 * The string can:
 *   + Have blank spaces on the two ends
 *   + Have a sign '-' or '+' or none
 *   + Be an integer or a decimal number
 *
 * @param {string} string The string to check
 * @returns {boolean} true if the string is valid number or otherwise
 */
const is_number = (string) => /^[+-]?\d+([.]\d+)?$/.test(string.trim())

/**
 * Checks if a number in type string is in the range allowed in this app
 *
 * @param {string} string The string number to check
 * @returns {boolean} true if the string number is in range or otherwise
 */
const is_number_in_range = (string) => {
  const number = parseInt(string)
  return number >= 500 && number <= 10000
}
/**
 * Checks if a key value of an event key stroke is valid
 * Good key stroke is number key or `.` or `-` or `+` or ' '
 *
 * @param {KeyboardEvent} event The input event
 * @returns {boolean} true if the key stroke is valid or otherwise
 */
const is_allowed_keystroke = (event) => / |\.|-|\+|\d/.test(event.key)
