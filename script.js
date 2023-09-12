const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const dayofTheWeek = new Map([ // Map to get day of the week from date
    [0, "Sunday"], [1, "Monday"], [2, "Tuesday"], [3, "Wednesday"], [4, "Thursday"], [5, "Friday"], [6, "Saturday"]]);

const API_KEY = "7199f4dd5c961bf764e2a9d939688fd8"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    let date = new Date(weatherItem.dt_txt);
    let day = dayofTheWeek.get(date.getDay());
        return `<li class="card">
                    <h3>${day}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${((weatherItem.main.temp - 273.15) * (9/5) + 32).toFixed(0)}°F</h6>
                    <h6>Wind: ${Math.round(weatherItem.wind.speed * 2.237)} MPH</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    //}
}

const createForecast = async (lat, long) => {
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_KEY}`;
    let response = await fetch(FORECAST_API_URL).catch(() => {alert("An error occurred while fetching the weather forecast!")});
    let data = await response.json();
    let date = new Date(0);
    date.setUTCSeconds(data.dt);
    let day = dayofTheWeek.get(date.getDay());
    let html =  `<div class="details">
                <h2>${data.name} --- ${day}</h2>
                <h6>Temperature: ${((data.main.temp - 273.15) * (9/5) + 32).toFixed(0)}°F</h6>
                <h6>Wind: ${Math.round(data.wind.speed * 2.237)}  MPH</h6>
                <h6>Humidity: ${data.main.humidity}%</h6>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="weather-icon">
                <h6>${data.weather[0].description}</h6>
            </div>`;
    console.log(html);
    return html;
}
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        
        createForecast(latitude, longitude).then(html2 => {
            currentWeatherDiv.insertAdjacentHTML("beforeend", html2);
        });

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());