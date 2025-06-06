const apiKey = "%%%CLAVE_API_CLIMA%%%";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentWeatherDiv = document.getElementById("current-weather");
const forecastDiv = document.getElementById("forecast");
let hourlyChartCanvas = document.getElementById("hourlyChart");

let fullForecastData = null;
let currentWeatherData = null;
let hourlyChartInstance = null;

function showLocationUnavailableMessage() {
  currentWeatherDiv.innerHTML = `
        <p class="loading-message">
            <span style="font-size: 2em;">📍</span><br>
            <strong>¡No pudimos obtener tu ubicación!</strong><br><br>
            Para ver el clima local, por favor permite el acceso a la ubicación en tu navegador.<br>
            O, <strong>busca una ciudad</strong> en el campo de arriba para comenzar.
        </p>
    `;
  forecastDiv.innerHTML = "";
  clearHourlyChart();
}

async function getWeatherByCity(city) {
  currentWeatherDiv.innerHTML =
    "<p class='loading-message'>Cargando clima...</p>";
  forecastDiv.innerHTML = "";
  clearHourlyChart();
  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`
    );
    if (!currentRes.ok) throw new Error("Ciudad no encontrada");
    currentWeatherData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=es`
    );
    fullForecastData = await forecastRes.json();

    showCurrentWeather(currentWeatherData, "current");
    showForecast(fullForecastData);
    showHourlyChart(fullForecastData, 0);
  } catch (error) {
    currentWeatherDiv.innerHTML = `<p class="error-message">Error: ${error.message}. Por favor, intenta de nuevo.</p>`;
    forecastDiv.innerHTML = "";
    clearHourlyChart();
  }
}

async function getWeatherByCoords(lat, lon) {
  currentWeatherDiv.innerHTML =
    "<p class='loading-message'>Cargando clima...</p>";
  forecastDiv.innerHTML = "";
  clearHourlyChart();
  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );
    if (!currentRes.ok)
      throw new Error("No se pudieron obtener los datos de ubicación.");
    currentWeatherData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );
    fullForecastData = await forecastRes.json();

    showCurrentWeather(currentWeatherData, "current");
    showForecast(fullForecastData);
    showHourlyChart(fullForecastData, 0);
  } catch (error) {
    console.error("Error en getWeatherByCoords:", error);
    currentWeatherDiv.innerHTML = `<p class="error-message">Error al obtener datos de ubicación.</p>`;
    forecastDiv.innerHTML = "";
    clearHourlyChart();
  }
}

function normalizeIconCode(iconCode) {
  if (typeof iconCode !== "string" || iconCode.trim() === "") {
    return "01d";
  }

  // Convertir todos los códigos de "cielo despejado" o "pocas nubes" a '01d'
  // Esto incluye: '01d', '01n', '02d', '02n'
  if (
    iconCode === "01d" ||
    iconCode === "01n" ||
    iconCode === "02d" ||
    iconCode === "02n"
  ) {
    return "01d";
  }

  // Para otros códigos de icono, devolverlos sin cambios
  return iconCode;
}

function showCurrentWeather(data, type = "forecast") {
  let iconCode =
    data.weather &&
    data.weather[0] &&
    typeof data.weather[0].icon === "string" &&
    data.weather[0].icon.trim() !== ""
      ? data.weather[0].icon
      : "01d";

  iconCode = normalizeIconCode(iconCode);

  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  let title = "";
  if (type === "current") {
    title = `<h2>${data.name}, ${data.sys.country}</h2>`;
  } else {
    const date = new Date(data.dt * 1000);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    title = `<h2>Clima para ${date.toLocaleDateString("es-ES", options)}</h2>`;
  }

  currentWeatherDiv.innerHTML = `
        <div class="current-header">
            ${title}
        </div>
        <div class="current-details">
            <img src="${iconUrl}" alt="${
    data.weather[0] ? data.weather[0].description : "icono del clima"
  }" class="weather-icon-large" />
            <p>🌡️ Temperatura: ${data.main.temp}°C</p>
            <p>☁️ Clima: ${
              data.weather[0] ? data.weather[0].description : "N/A"
            }</p>
            <p>💨 Viento: ${data.wind.speed} m/s</p>
        </div>
    `;
}

function showForecast(data) {
  let html =
    "<h3 class='forecast-title'>Pronóstico Detallado</h3><div class='forecast-container'>";

  const dailyForecasts = [];
  const processedDates = new Set();

  for (const item of data.list) {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split("T")[0];

    if (!processedDates.has(dayKey)) {
      let representativeItem;
      if (processedDates.size === 0) {
        representativeItem = item;
      } else {
        representativeItem =
          data.list.find((d) => {
            const itemDate = new Date(d.dt * 1000);
            return (
              itemDate.toISOString().split("T")[0] === dayKey &&
              itemDate.getHours() >= 12
            );
          }) || item;
      }

      dailyForecasts.push(representativeItem);
      processedDates.add(dayKey);
    }
    if (dailyForecasts.length >= 4) break;
  }

  dailyForecasts.slice(0, 4).forEach((item, index) => {
    const date = new Date(item.dt * 1000);
    const options = { weekday: "long", month: "short", day: "numeric" };
    let dayLabel;

    if (index === 0) {
      dayLabel = "Hoy";
    } else if (index === 1) {
      dayLabel = "Mañana";
    } else {
      dayLabel = date.toLocaleDateString("es-ES", options);
    }

    let iconCode =
      item.weather &&
      item.weather[0] &&
      typeof item.weather[0].icon === "string" &&
      item.weather[0].icon.trim() !== ""
        ? item.weather[0].icon
        : "01d";

    // Aplicar la normalización para el icono pequeño de "Hoy" (index === 0)
    if (index === 0) {
      iconCode = normalizeIconCode(iconCode);
    }

    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const itemDateStr = date.toISOString().split("T")[0];

    html += `
                <div class="day-forecast" data-day-index="${index}" data-date="${itemDateStr}">
                    <p><strong>${dayLabel}</strong></p>
                    <img src="${iconUrl}" alt="${
      item.weather[0] ? item.weather[0].description : "icono del clima"
    }" class="weather-icon" />
                    <p>🌡️ ${item.main.temp}°C</p>
                    <p>☁️ ${
                      item.weather[0] ? item.weather[0].description : "N/A"
                    }</p>
                    <p>💨 Viento: ${item.wind.speed} m/s</p>
                </div>
            `;
  });

  html += "</div>";
  forecastDiv.innerHTML = html;

  addForecastDayClickListeners();
}

function showHourlyChart(fullData, dayIndex) {
  let hourlyDataToDisplay;

  if (dayIndex === 0) {
    hourlyDataToDisplay = fullData.list.slice(0, 8);
  } else {
    const selectedDate = new Date(fullData.list[0].dt * 1000);
    selectedDate.setDate(selectedDate.getDate() + dayIndex);
    const targetDateStr = selectedDate.toISOString().split("T")[0];

    hourlyDataToDisplay = fullData.list.filter((item) => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toISOString().split("T")[0] === targetDateStr;
    });
  }

  const labels = hourlyDataToDisplay.map((item) => {
    const date = new Date(item.dt * 1000);
    return date.getHours() + ":00";
  });

  const temps = hourlyDataToDisplay.map((item) => item.main.temp);

  const ctx = hourlyChartCanvas.getContext("2d");

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
  }

  hourlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperatura (°C)",
          data: temps,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: "white",
          },
        },
        x: {
          ticks: {
            color: "white",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
      },
    },
  });
}

function clearHourlyChart() {
  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
    hourlyChartInstance = null;
  }
}

function addForecastDayClickListeners() {
  const dayForecasts = document.querySelectorAll(".day-forecast");
  dayForecasts.forEach((dayDiv) => {
    dayDiv.addEventListener("click", () => {
      dayForecasts.forEach((div) => div.classList.remove("active"));
      dayDiv.classList.add("active");

      const dayIndex = parseInt(dayDiv.dataset.dayIndex);

      if (fullForecastData) {
        if (dayIndex === 0) {
          showCurrentWeather(currentWeatherData, "current");
        } else {
          const selectedDateStr = dayDiv.dataset.date;
          const representativeForecastItem = fullForecastData.list.find(
            (item) => {
              const itemDate = new Date(item.dt * 1000);
              return itemDate.toISOString().split("T")[0] === selectedDateStr;
            }
          );

          if (representativeForecastItem) {
            showCurrentWeather(representativeForecastItem, "forecast");
          }
        }
        showHourlyChart(fullForecastData, dayIndex);
      }
    });
  });

  if (dayForecasts.length > 0) {
    dayForecasts[0].classList.add("active");
    if (currentWeatherData) {
      showCurrentWeather(currentWeatherData, "current");
    }
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  } else {
    currentWeatherDiv.innerHTML =
      '<p class="error-message">Por favor, ingresa una ciudad para buscar.</p>';
    forecastDiv.innerHTML = "";
    clearHourlyChart();
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

window.onload = () => {
  currentWeatherDiv.innerHTML =
    "<p class='loading-message'>Cargando ubicación...</p>";
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error("Error al obtener la ubicación:", error);
        showLocationUnavailableMessage();
      }
    );
  } else {
    showLocationUnavailableMessage();
  }
};
