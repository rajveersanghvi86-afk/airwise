let chartMain, chart1, chart2, chart3;

function showSection(id, event) {

  document.querySelectorAll('.section').forEach(s => {
    s.style.display = "none";
  });

  document.getElementById(id).style.display = "block";

  document.querySelectorAll('.sidebar li').forEach(li => {
    li.classList.remove('active');
  });

  event.target.classList.add('active');
}

async function getAQI() {
  fetchFast();
  navigator.geolocation.getCurrentPosition(fetchReal, fetchFast);
}

async function fetchFast() {
  let res = await fetch(`https://api.waqi.info/feed/here/?token=a4c8aba8bac6487825c5ae93e599e83613e67940`);
  let data = await res.json();
  updateUI(data.data);
}

async function fetchReal(pos) {
  let { latitude, longitude } = pos.coords;

  let res = await fetch(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=a4c8aba8bac6487825c5ae93e599e83613e67940`);
  let data = await res.json();

  updateUI(data.data);
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
  createMainChart(data);
  createHistoryCharts(data);
}

function updateTips(aqi) {

  let tips = aqi < 80 ? [
    "Go outside freely",
    "Great day for sports",
    "Open windows",
    "Cycle or walk",
    "Enjoy fresh air"
  ] : aqi < 150 ? [
    "Limit outdoor exposure",
    "Avoid traffic areas",
    "Stay hydrated",
    "Light exercise only"
  ] : [
    "Stay indoors",
    "Wear N95 mask",
    "Use air purifier",
    "Avoid exertion"
  ];

  document.getElementById("tipsList").innerHTML =
    tips.map(t => `<li>${t}</li>`).join("");
}

function updateMap(data) {

  let aqi = data.aqi;

  document.getElementById("mapLocation").innerText =
    "📍 " + data.city.name;

  document.getElementById("routeAdvice").innerText =
    aqi < 80 ? "All routes safe" :
    aqi < 150 ? "Avoid highways" :
    "Stay indoors";
}

function createMainChart(data) {

  let pm25 = data.forecast?.daily?.pm25 || [];

  let labels = pm25.map(d => d.day.slice(5));
  let values = pm25.map(d => d.avg);

  if (chartMain) chartMain.destroy();

  chartMain = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "AQI Trend", data: values }]
    }
  });
}

function createHistoryCharts(data) {

  let pm25 = data.forecast?.daily?.pm25 || [];

  let labels = pm25.map(d => d.day.slice(5));
  let values = pm25.map(d => d.avg);

  if (chart1) chart1.destroy();
  if (chart2) chart2.destroy();
  if (chart3) chart3.destroy();

  chart1 = new Chart(document.getElementById("chart1"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "AQI", data: values }]
    }
  });

  chart2 = new Chart(document.getElementById("chart2"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "PM2.5", data: values }]
    }
  });

  chart3 = new Chart(document.getElementById("chart3"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "Predicted AQI", data: values.map((v,i)=>v+i*5) }]
    }
  });
}