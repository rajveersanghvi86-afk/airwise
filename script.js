let chartMain, chartHistory;

function showSection(id, event) {
  document.querySelectorAll('.section').forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
  event.target.classList.add('active');
}

async function getAQI() {
  navigator.geolocation.getCurrentPosition(fetchReal, () => {
    alert("Enable location access");
  });
}

async function fetchReal(pos) {
  let { latitude, longitude } = pos.coords;

  let res = await fetch(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=a4c8aba8bac6487825c5ae93e599e83613e67940`);
  let result = await res.json();

  updateUI(result.data);
}

function updateUI(data) {

  let aqi = data.aqi;

  document.getElementById("aqiValue").innerText = aqi;
  document.getElementById("aqiStatus").innerText =
    aqi < 80 ? "Good" : aqi < 150 ? "Moderate" : "Poor";

  document.getElementById("location").innerText = "📍 " + data.city.name;
  document.getElementById("time").innerText = new Date().toLocaleString();

  document.querySelector(".stats").innerHTML = `
    <div class="card">🌡️ ${data.iaqi.t?.v || "--"}°C</div>
    <div class="card">💧 ${data.iaqi.h?.v || "--"}%</div>
    <div class="card">🌬️ ${data.iaqi.w?.v || "--"} km/h</div>
  `;

  updateTips(aqi);
  updateMap(data);
  createCharts(data);
}

function updateTips(aqi) {
  let tips = [
    "Avoid heavy traffic roads",
    "Wear mask in polluted areas",
    "Stay hydrated",
    "Limit outdoor exercise",
    "Check AQI daily",
    "Use public transport"
  ];

  document.getElementById("tipsList").innerHTML =
    tips.map(t => `<li>${t}</li>`).join("");
}

function updateMap(data) {
  let aqi = data.aqi;

  document.getElementById("routeAdvice").innerText =
    aqi < 80 ? "All routes safe" :
    aqi < 150 ? "Avoid highways" :
    "Stay indoors";
}

function createCharts(data) {

  let pm25 = data.forecast?.daily?.pm25 || [];
  let labels = pm25.map(d => d.day.slice(5));
  let values = pm25.map(d => d.avg);

  if (chartMain) chartMain.destroy();
  if (chartHistory) chartHistory.destroy();

  chartMain = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "PM2.5", data: values }]
    }
  });

  chartHistory = new Chart(document.getElementById("chartHistory"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "PM2.5 Levels", data: values }]
    }
  });
}
