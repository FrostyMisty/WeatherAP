const search = document.getElementById("cityInput");
const searchBtn = document.querySelector(".search-btn");
const searchForm = document.querySelector(".searchFromm");
const cities = document.querySelector(".popular-cities");
const currentCity = document.querySelector(".currentCity");
const bgVideo = document.querySelector(".video-bg");
const videoSrc = document.querySelector(".videoSrc");
const mainContainer = document.querySelector(".mainContainer");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

// დატა ფეჩინგისთვის

const popularCities = [
  "New York",
  "London",
  "Tokyo",
  "Rome",
  "Stockholm",
  "Kyiv",
];
const gifs = [
  { title: "Rain", url: "./assets/videos/ForestRain.mp4" },
  { title: "Mist", url: "./assets/videos/fog.mp4" },
  { title: "Clear", url: "./assets/videos/clearsky.mp4" },
  { title: "Drizzle", url: "./assets/videos/drizzle.mp4" },
  { title: "Clouds", url: "./assets/videos/clouds.mp4" },
  { title: "Snow", url: "./assets/videos/snow.mp4" },
];

const citiesPerPage = 3;
let currentPage = 1;

init();

function init() {
  const lastCity = sessionStorage.getItem("lastCity");
  if (lastCity) fetchData(lastCity);

  renderPopularCities();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      fetchWithCoordinates(lat, lon);
    },
    (err) => console.error("Geolocation failed:", err.message)
  );
}

function fetchData(query) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=ea260460ef18e6abbbe367a420ba3f5f&units=metric`
  )
    .then((res) => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then((res) => {
      gifs.forEach((item) => {
        if (res.weather[0].main === item.title) {
          videoSrc.src = item.url;
          bgVideo.load();
          mainContainer.style.backgroundColor = "transparent";
        }
      });
      mainCardBuild(res);
      sessionStorage.setItem("lastCity", query);
    })
    .catch((err) => console.error("Fetch data error:", err.message));
}

function fetchWithCoordinates(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=ea260460ef18e6abbbe367a420ba3f5f&units=metric`
  )
    .then((res) => {
      if (!res.ok) throw new Error("Coordinates fetch failed");
      return res.json();
    })
    .then((res) => {
      gifs.forEach((item) => {
        if (res.weather[0].main === item.title) {
          videoSrc.src = item.url;
          bgVideo.load();
          mainContainer.style.backgroundColor = "transparent";
        }
      });
      mainCardBuild(res);
    })
    .catch((err) => console.error("Fetch coordinates error:", err.message));
}

async function fetchPopularCities(query) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=ea260460ef18e6abbbe367a420ba3f5f&units=metric`
    );
    if (!response.ok) throw new Error("City fetch failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching popular city:", error.message);
    return null;
  }
}

async function renderPopularCities() {
  cities.innerHTML = "";
  const start = (currentPage - 1) * citiesPerPage;
  const end = start + citiesPerPage;
  const paginatedCities = popularCities.slice(start, end);

  for (const city of paginatedCities) {
    const data = await fetchPopularCities(city);
    if (data) {
      buildCards(data);
      if (city === paginatedCities[0] && currentPage === 1) {
        gifs.forEach((item) => {
          if (data.weather[0].main === item.title) {
            videoSrc.src = item.url;
            bgVideo.load();
            mainContainer.style.backgroundColor = "transparent";
          }
        });
      }
    }
  }

  const totalPages = Math.ceil(popularCities.length / citiesPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

function buildCards(data) {
  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `
    <h2>${data.name}</h2>
    <div>
      <p>Temperature: ${Math.round(data.main.temp)}°C</p>
      <p>Condition: ${data.weather[0].description}</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} m/s</p>
    </div>
  `;
  cities.appendChild(div);
}

function mainCardBuild(data) {
  currentCity.innerHTML = `
    <h2>${data.name}</h2>
    <p>Temperature: ${Math.round(data.main.temp)}°C</p>
    <p>Condition: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!search.value) return;
  fetchData(search.value);
  search.value = "";
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPopularCities();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(popularCities.length / citiesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPopularCities();
  }
});

// ea260460ef18e6abbbe367a420ba3f5f
