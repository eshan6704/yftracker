import { showSection, createTable, createTableFromArray } from './script-tables.js';
import { initIndicatorControls, plotDailyChart } from './script-charts.js';
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

async function main() {
  const app = await Client.connect("eshan6704/trackerbackend");
  window.gradioApp = app;
  console.log("Connected to trackerbackend");

  const form = document.getElementById("form");
  const statusEl = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const symbol = document.getElementById("symbol").value.trim();
    const exchange = document.getElementById("exchange").value.trim();
    if (!symbol || !exchange) {
      statusEl.textContent = "Please enter both Symbol and Exchange.";
      return;
    }
    statusEl.textContent = "Fetching data...";
    try {
      const result = await app.predict("/fetch_data", [symbol, exchange]);
      console.log("API response:", result);
      window.lastResponse = result.data;
      statusEl.textContent = "Data loaded successfully.";
      showSection("debug");
      plotDailyChart();
    } catch(err) {
      console.error(err);
      statusEl.textContent = "Error fetching data.";
    }
  });

  document.querySelectorAll(".tab-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showSection(btn.dataset.section);
    })
  );
}

window.addEventListener("DOMContentLoaded", ()=>{
  main();
  initIndicatorControls();
});