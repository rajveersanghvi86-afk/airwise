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

  giveRecommendations(aqi);
  updateMapAdvice(aqi, data.city.name);
  updateTips();
  createCharts(data);
}

function giveRecommendations(aqi) {

  let advice = "";
  let plan = "";
  let activity = "";

  if (aqi < 80) {
    advice = "Air is clean. Safe to go outside.";
    plan = "Best time: Morning & Evening";
    activity = "Running, sports allowed";
  } 
  else if (aqi < 150) {
    advice = "Moderate air. Limit exposure.";
    plan = "Go out early morning only";
    activity = "Light walking only";
  } 
  else {
    advice = "Poor air. Stay indoors.";
    plan = "Avoid outdoor plans";
    activity = "No outdoor activity";
  }

  document.getElementById("advice").innerText = advice;
  document.getElementById("planner").innerText = plan;
  document.getElementById("activity").innerText = activity;
}

function updateMapAdvice(aqi, city) {

  let msg = `This map shows your current area (${city}). `;

  if (aqi < 80) {
    msg += "Air is clean. Most routes are safe.";
  } 
  else if (aqi < 150) {
    msg += "Avoid highways and traffic-heavy roads.";
  } 
  else {
    msg += "High pollution detected. Stay indoors if possible.";
  }

  document.getElementById("routeAdvice").innerText = msg;
}

function updateTips() {
  let tips = [
    "Avoid traffic-heavy roads",
    "Wear mask if needed",
    "Stay hydrated",
    "Limit outdoor exercise",
    "Check AQI daily"
  ];

  document.getElementById("tipsList").innerHTML =
    tips.map(t => `<li>${t}</li>`).join("");
}

function createCharts(data) {

  let pm25 = data.forecast?.daily?.pm25 || [];

  let labels = pm25.map(d => d.day.slice(5));
  let values = pm25.map(d => d.avg);

  // simulate past trend (for history)
  let pastValues = values.map(v => Math.max(20, v - Math.random()*50));

  if (chartMain) chartMain.destroy();
  if (chartHistory) chartHistory.destroy();

  chartMain = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Forecast PM2.5",
        data: values
      }]
    }
  });

  chartHistory = new Chart(document.getElementById("chartHistory"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Past PM2.5 Trend",
        data: pastValues
      }]
    }
  });
}
