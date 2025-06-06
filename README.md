# ☀️ Aplicación del Clima Dinámica

Una aplicación web sencilla y elegante para obtener información meteorológica en tiempo real y pronósticos para cualquier ciudad del mundo.

---

## 📸 Vista Previa

¡Así es como se ve la aplicación!

![Captura de pantalla de la Aplicación del Clima](/img/Captura%20de%20pantalla%202025-06-06%20232958.png)

---

## 🚀 Demo en Vivo

👉 [Ver la página](https://samantainzerilli95.github.io/weather-app/)

---

## ✨ Funcionalidades

- **Clima actual**: Temperatura, descripción, viento y un icono representativo para el momento.
- **Pronóstico extendido**: Predicción para el día actual y los próximos 3 días (un total de 4 días) con sus datos clave.
  - **Nota Importante**: Es normal observar pequeñas diferencias en la temperatura o el viento entre la sección de "Clima actual" (la tarjeta grande) y la miniatura de "Hoy" en el pronóstico. Esto ocurre porque se utilizan dos fuentes de datos distintas de la API: una para el **clima observado en tiempo real** y otra para un **pronóstico por intervalos de 3 horas**. ¡Es el comportamiento esperado y preciso de los datos meteorológicos!
- **Gráfico horario**: Visualización interactiva de la temperatura por hora para el día seleccionado.
- **Detección de ubicación**: Obtiene automáticamente el clima de tu ubicación actual (con tu permiso).
- **Búsqueda por ciudad**: Buscá el clima de cualquier ciudad globalmente.
- **Diseño adaptable**: Interfaz optimizada para celulares y computadoras.

---

## 📦 Tecnologías

- **HTML5**: Estructura.
- **CSS3**: Estilos y responsive design.
- **JavaScript (ES6+)**: Lógica principal.
- **API de OpenWeatherMap**: Fuente de datos del clima.
- **Chart.js**: Para los gráficos de temperatura.
- **GitHub Pages**: Para el despliegue.

---

## 👨‍💻 Para Desarrolladores

Este proyecto utiliza la API de OpenWeatherMap. Para que la aplicación funcione en GitHub Pages, la clave API (`%%%CLAVE_API_CLIMA%%%`) se inyecta como un secreto de repositorio configurado en GitHub Actions.

---

¡Gracias por visitar el proyecto! 💫
