import { MA, EMA, WMA, RSI, ATR, BollingerBands, KeltnerChannel, SuperTrend } from './script-indicators.js';

export function initIndicatorControls() {
  const container = document.getElementById("indicatorControls");
  container.innerHTML = `
    <label><input type="checkbox" class="indicator-checkbox" value="MA"> MA</label>
    <label><input type="checkbox" class="indicator-checkbox" value="RSI"> RSI</label>
    <label><input type="checkbox" class="indicator-checkbox" value="ATR"> ATR</label>
    <label><input type="checkbox" class="indicator-checkbox" value="Bollinger"> Bollinger</label>
    <label><input type="checkbox" class="indicator-checkbox" value="Keltner"> Keltner</label>
    <label><input type="checkbox" class="indicator-checkbox" value="SuperTrend"> SuperTrend</label>
    <button id="applyIndicators">Apply</button>
    <button id="clearIndicators">Clear</button>
    <div id="indicatorOptions" style="margin-top:10px;"></div>
  `;

  const optionsDiv = document.getElementById("indicatorOptions");
  container.querySelectorAll(".indicator-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      optionsDiv.innerHTML = "";
      container.querySelectorAll(".indicator-checkbox:checked").forEach(chk => {
        if (chk.value === "MA") {
          const maSel = document.createElement("select");
          maSel.id = "maType";
          maSel.innerHTML = `<option value="MA">MA</option>
                             <option value="EMA">EMA</option>
                             <option value="WMA">WMA</option>`;
          const periodSel = document.createElement("select");
          periodSel.id = "maPeriod";
          periodSel.innerHTML = `<option value="5">5</option><option value="10">10</option><option value="21">21</option><option value="50">50</option><option value="200">200</option>`;
          const label = document.createElement("span");
          label.textContent = " MA Options: ";
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(maSel);
          optionsDiv.appendChild(periodSel);
        }
        if (chk.value === "RSI") {
          const periodSel = document.createElement("select");
          periodSel.id = "rsiPeriod";
          periodSel.innerHTML = `<option value="14">14</option><option value="21">21</option>`;
          const label = document.createElement("span");
          label.textContent = " RSI Period: ";
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(periodSel);
        }
        if (chk.value === "ATR") {
          const periodSel = document.createElement("select");
          periodSel.id = "atrPeriod";
          periodSel.innerHTML = `<option value="14">14</option><option value="21">21</option>`;
          const label = document.createElement("span");
          label.textContent = " ATR Period: ";
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(periodSel);
        }
        if (chk.value === "Bollinger") {
          const periodSel = document.createElement("select");
          periodSel.id = "bollPeriod";
          periodSel.innerHTML = `<option value="20">20</option><option value="50">50</option>`;
          const label = document.createElement("span");
          label.textContent = " Bollinger Period: ";
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(periodSel);
        }
        if (chk.value === "Keltner") {
          const periodSel = document.createElement("select");
          periodSel.id = "keltPeriod";
          periodSel.innerHTML = `<option value="20">20</option>`;
          const label = document.createElement("span");
          label.textContent = " Keltner Period: ";
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(periodSel);
        }
        if (chk.value === "SuperTrend") {
          const periodSel = document.createElement("select");
          periodSel.id = "superPeriod";
          periodSel.innerHTML = `<option value="10">10</option>`;
          const label = document.createElement("span");
          label.textContent = " SuperTrend Period: ";
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(periodSel);
        }
      });
    });
  });

  document.getElementById("applyIndicators").addEventListener("click", () => {
    plotDailyChart();
  });
  document.getElementById("clearIndicators").addEventListener("click", () => {
    container.querySelectorAll(".indicator-checkbox").forEach(cb => cb.checked = false);
    document.getElementById("indicatorOptions").innerHTML = "";
    plotDailyChart();
  });
}

export function plotDailyChart() {
  if (!window.lastResponse || !window.lastResponse[0] || !window.lastResponse[0].historical_daily) return;

  const data = window.lastResponse[0].historical_daily;
  const x = data.map(d => d.Date);
  const close = data.map(d => d.Close);
  const open = data.map(d => d.Open);
  const high = data.map(d => d.High);
  const low = data.map(d => d.Low);
  const volume = data.map(d => d.Volume);

  const closeMax = Math.max(...close);
  const closeMin = Math.min(...close);
  const pricePadding = (closeMax - closeMin) * 0.02 || closeMax * 0.02 || 1;
  const yMax = closeMax + pricePadding;
  const volBase = closeMin - (closeMax - closeMin) * 0.2;
  const maxVol = Math.max(...volume) || 1;
  const volumeScaled = volume.map(v => volBase + (v / maxVol) * (closeMin - volBase));

  const traces = [];

  // Main OHLC chart
  traces.push({
    x, open, high, low, close,
    type: "candlestick",
    name: "Price",
    increasing: { line: { color: "green" } },
    decreasing: { line: { color: "red" } }
  });

  // Volume underlay
  traces.push({
    x, y: volumeScaled,
    type: "bar",
    name: "Volume (scaled)",
    marker: { color: "rgba(33,150,243,0.25)" },
    yaxis: "y"
  });

  // Indicators
  const indicators = document.querySelectorAll(".indicator-checkbox:checked");
  indicators.forEach(ind => {
    if (ind.value === "MA") {
      const type = document.getElementById("maType").value;
      const period = parseInt(document.getElementById("maPeriod").value);
      let vals;
      if (type === "MA") vals = MA(data, period);
      if (type === "EMA") vals = EMA(data, period);
      if (type === "WMA") vals = WMA(data, period);
      traces.push({ x, y: vals, type: "scatter", mode: "lines", name: `${type} (${period})`, line: { width: 2 } });
    }
    if (ind.value === "RSI") {
      const period = parseInt(document.getElementById("rsiPeriod").value);
      const vals = RSI(data, period);
      traces.push({ x, y: vals, type: "scatter", mode: "lines", name: `RSI (${period})`, yaxis: "y2" });
    }
    if (ind.value === "ATR") {
      const period = parseInt(document.getElementById("atrPeriod").value);
      const vals = ATR(data, period);
      traces.push({ x, y: vals, type: "scatter", mode: "lines", name: `ATR (${period})`, yaxis: "y3" });
    }
    if (ind.value === "Bollinger") {
      const period = parseInt(document.getElementById("bollPeriod").value);
      const { mid, upper, lower } = BollingerBands(data, period);
      traces.push({ x, y: upper, type: "scatter", mode: "lines", name: `BB Upper (${period})`, line: { dash: "dot" } });
      traces.push({ x, y: mid, type: "scatter", mode: "lines", name: `BB Mid (${period})` });
      traces.push({ x, y: lower, type: "scatter", mode: "lines", name: `BB Lower (${period})`, line: { dash: "dot" } });
    }
    if (ind.value === "Keltner") {
      const period = parseInt(document.getElementById("keltPeriod").value);
      const { upper, lower } = KeltnerChannel(data, period);
      traces.push({ x, y: upper, type: "scatter", mode: "lines", name: `Keltner Upper (${period})`, line: { dash: "dot" } });
      traces.push({ x, y: lower, type: "scatter", mode: "lines", name: `Keltner Lower (${period})`, line: { dash: "dot" } });
    }
    if (ind.value === "SuperTrend") {
      const period = parseInt(document.getElementById("superPeriod").value);
      const { upper, lower, trend } = SuperTrend(data, period);
      traces.push({ x, y: upper, type: "scatter", mode: "lines", name: `ST Upper (${period})`, line: { dash: "dot" } });
      traces.push({ x, y: lower, type: "scatter", mode: "lines", name: `ST Lower (${period})`, line: { dash: "dot" } });
    }
  });

  const layout = {
    title: "Daily Chart",
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    xaxis: { showgrid: true },
    yaxis: { title: "Price + Volume" },
    yaxis2: { domain: [0, 0.15], title: "RSI", overlaying: "y", anchor: "x" },
    yaxis3: { domain: [0.15, 0.3], title: "ATR", overlaying: "y", anchor: "x" },
    height: 600,
    showlegend: true,
    margin: { t: 50, b: 50 }
  };

  const container = document.getElementById("daily-chart-container");
  Plotly.newPlot(container, traces, layout, { responsive: true });
}