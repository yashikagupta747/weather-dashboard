// Select elements from the DOM needed for the weather app
const cityInput = document.querySelector(".city-input"); // Input field for the city name
const searchButton = document.querySelector(".search-btn"); // Button to search for the weather of the entered city
const locationButton = document.querySelector(".location-btn"); // Button to use the user's current location
const currentWeatherDiv = document.querySelector(".current-weather"); // Division to display the current weather
const weatherCardsDiv = document.querySelector(".weather-cards"); // Division to display the weather forecast cards

const API_KEY = "83c4f67c000826295816c72b682fe8d3"; // API key for accessing the OpenWeatherMap API

// Function to create HTML for weather cards based on the weather item and its index
const createWeatherCard = (cityName, weatherItem, index) => {
    // If it's the first card, create a detailed current weather card
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2> <!-- Display city name and date -->
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6> <!-- Convert Kelvin to Celsius and display -->
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6> <!-- Display wind speed -->
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6> <!-- Display humidity percentage -->
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon"> <!-- Display weather icon -->
                    <h6>${weatherItem.weather[0].description}</h6> <!-- Display weather description -->
                </div>`;
    } else { // If it's not the first item, create a forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3> <!-- Display the date -->
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon"> <!-- Display weather icon -->
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6> <!-- Display temperature -->
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6> <!-- Display wind speed -->
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6> <!-- Display humidity -->
                </li>`;
    }
}

// Function to fetch weather details based on city coordinates
const getWeatherDetails = (cityName, latitude, longitude) => {
    // Construct the API URL for fetching 5-day weather forecast
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    // Fetch data from the weather API
    fetch(WEATHER_API_URL)
        .then(response => response.json()) // Convert the response to JSON format
        .then(data => {
            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = []; // Array to keep track of unique forecast days
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate(); // Get the date from the forecast
                // If the date is not already in the uniqueForecastDays array, add it
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate); // Add the date to the array
                    return true; // Keep the forecast
                }
                return false; // Skip duplicate forecasts
            });

            // Clear previous weather data from the UI
            cityInput.value = ""; // Reset the input field
            currentWeatherDiv.innerHTML = ""; // Clear current weather display
            weatherCardsDiv.innerHTML = ""; // Clear forecast cards

            // Create weather cards and add them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index); // Generate HTML for each weather item
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html); // Insert current weather card into the DOM
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html); // Insert forecast cards into the DOM
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!"); // Show error alert if fetching fails
        });
}

// Function to get the coordinates of a city based on the name entered in the input field
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Trim any extra whitespace from the input
    if (cityName === "") return; // If the input is empty, do nothing
    
    // Construct the API URL for geocoding the city name into coordinates
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Fetch data from the geocoding API
    fetch(API_URL)
        .then(response => response.json()) // Convert the response to JSON format
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`); // Alert if no coordinates are found
            const { lat, lon, name } = data[0]; // Destructure the latitude, longitude, and name from the first result
            getWeatherDetails(name, lat, lon); // Call function to get weather details using the coordinates
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!"); // Show error alert if fetching fails
        });
}

// Function to get the user's current geographical coordinates
const getUserCoordinates = () => {
    // Get the current position of the user
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates from the position object
            // Construct the API URL for reverse geocoding to get the city name
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL)
                .then(response => response.json()) // Convert the response to JSON format
                .then(data => {
                    const { name } = data[0]; // Get the city name from the data
                    getWeatherDetails(name, latitude, longitude); // Get weather details using the city name and coordinates
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!"); // Show error alert if fetching fails
                });
        },
        error => { // Callback for errors when retrieving user location
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again."); // Alert for permission denial
            } else {
                alert("Geolocation request error. Please reset location permission."); // General error alert
            }
        });
}

// Add event listeners to buttons and input for user interaction
locationButton.addEventListener("click", getUserCoordinates); // When location button is clicked, get user's coordinates
searchButton.addEventListener("click", getCityCoordinates); // When search button is clicked, get coordinates for the input city
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates()); // Allow city search on 'Enter' key press

