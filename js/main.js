const apiKey = "c8c31816f1c7d878c5b08e7a5b2fb95e"; // Asegúrate de cambiar esto por "c8c31816f1c7d878c5b08e7a5b2fb95e" antes de subir a GitHub
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentWeatherDiv = document.getElementById("current-weather");
const forecastDiv = document.getElementById("forecast");
let hourlyChartCanvas = document.getElementById("hourlyChart");

let fullForecastData = null;
let currentWeatherData = null;
let hourlyChartInstance = null; // Para guardar la instancia del gráfico Chart.js

// --- NUEVA FUNCIÓN: Muestra un mensaje si la ubicación no está disponible ---
function showLocationUnavailableMessage() {
  currentWeatherDiv.innerHTML = `
        <p class="loading-message">
            <span style="font-size: 2em;">📍</span><br>
            <strong>¡No pudimos obtener tu ubicación!</strong><br><br>
            Para ver el clima local, por favor permite el acceso a la ubicación en tu navegador.<br>
            O, <strong>busca una ciudad</strong> en el campo de arriba para comenzar.
        </p>
    `;
  // Limpia el pronóstico y el gráfico
  forecastDiv.innerHTML = "";
  clearHourlyChart(); // Destruye el gráfico existente y limpia el canvas
}

// Función para obtener y mostrar clima por ciudad
async function getWeatherByCity(city) {
  currentWeatherDiv.innerHTML =
    "<p class='loading-message'>Cargando clima...</p>";
  forecastDiv.innerHTML = "";
  clearHourlyChart();
  try {
    // Petición para el clima actual
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`
    );
    if (!currentRes.ok) throw new Error("Ciudad no encontrada");
    currentWeatherData = await currentRes.json();

    // Petición para el pronóstico
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=es`
    );
    fullForecastData = await forecastRes.json();

    showCurrentWeather(currentWeatherData, "current");
    showForecast(fullForecastData);
    showHourlyChart(fullForecastData, 0); // Mostrar gráfico de "Hoy" inicialmente
  } catch (error) {
    currentWeatherDiv.innerHTML = `<p class="error-message">Error: ${error.message}. Por favor, intenta de nuevo.</p>`;
    forecastDiv.innerHTML = "";
    clearHourlyChart();
  }
}

// Función para obtener y mostrar clima por coordenadas
async function getWeatherByCoords(lat, lon) {
  currentWeatherDiv.innerHTML =
    "<p class='loading-message'>Cargando clima...</p>";
  forecastDiv.innerHTML = "";
  clearHourlyChart();
  try {
    // Petición para el clima actual
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );
    if (!currentRes.ok)
      throw new Error("No se pudieron obtener los datos de ubicación.");
    currentWeatherData = await currentRes.json();

    // Petición para el pronóstico
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );
    fullForecastData = await forecastRes.json();

    showCurrentWeather(currentWeatherData, "current");
    showForecast(fullForecastData);
    showHourlyChart(fullForecastData, 0); // Mostrar gráfico de "Hoy" inicialmente
  } catch (error) {
    currentWeatherDiv.innerHTML = `<p class="error-message">Error al obtener datos de ubicación.</p>`;
    forecastDiv.innerHTML = "";
    clearHourlyChart();
  }
}

// showCurrentWeather ahora acepta un segundo parámetro para el tipo de datos
function showCurrentWeather(data, type = "forecast") {
  // --- Console.logs para depuración ---
  // console.log('Datos pasados a showCurrentWeather:', data);
  // console.log('Contenido de data.weather:', data.weather);
  // if (data.weather && data.weather[0]) {
  //     console.log('Icon code:', data.weather[0].icon);
  // } else {
  //     console.log('ERROR: data.weather o data.weather[0] no está definido.');
  // }
  // --- FIN console.logs ---

  // Agregado fallback: si no hay icono, usa '01d' (sol)
  const iconCode =
    data.weather && data.weather[0] ? data.weather[0].icon : "01d";
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

  // Iteramos sobre los datos del pronóstico para encontrar un punto por día
  for (const item of data.list) {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split("T")[0];

    if (!processedDates.has(dayKey)) {
      let representativeItem;
      if (processedDates.size === 0) {
        // Si es el primer día (Hoy)
        representativeItem = item; // Tomamos el primer item disponible
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

    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const itemDateStr = date.toISOString().split("T")[0];

    html += `
                <div class="day-forecast" data-day-index="${index}" data-date="${itemDateStr}">
                    <p><strong>${dayLabel}</strong></p>
                    <img src="${iconUrl}" alt="${item.weather[0].description}" class="weather-icon" />
                    <p>🌡️ ${item.main.temp}°C</p>
                    <p>☁️ ${item.weather[0].description}</p>
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

  // Si dayIndex es 0 (Hoy), mostramos las próximas 24 horas (8 intervalos de 3h)
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

// Nueva función para añadir los listeners a los días del pronóstico
function addForecastDayClickListeners() {
  const dayForecasts = document.querySelectorAll(".day-forecast");
  dayForecasts.forEach((dayDiv) => {
    dayDiv.addEventListener("click", () => {
      dayForecasts.forEach((div) => div.classList.remove("active"));
      dayDiv.classList.add("active");

      const dayIndex = parseInt(dayDiv.dataset.dayIndex);

      if (fullForecastData) {
        if (dayIndex === 0) {
          // Si es "Hoy", volvemos a mostrar los datos del clima actual
          showCurrentWeather(currentWeatherData, "current");
        } else {
          // Para cualquier otro día, tomamos un dato representativo del día seleccionado
          // y lo pasamos a showCurrentWeather
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
        // Actualizar el gráfico horario para el día seleccionado
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

// --- EVENT LISTENERS ---

// Evento para botón buscar
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

// Evento para presionar Enter en el input de búsqueda
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// --- INICIALIZACIÓN DE LA APLICACIÓN AL CARGAR LA PÁGINA ---

// Al cargar la página, pedir ubicación y mostrar clima
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
        showLocationUnavailableMessage(); // Muestra el mensaje personalizado
      }
    );
  } else {
    showLocationUnavailableMessage(); // Muestra el mensaje personalizado
  }
};
