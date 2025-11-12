export function createTable(obj){
  if(!obj || Object.keys(obj).length===0) return "<p>No data</p>";
  return `<table class="info-table"><tbody>${Object.entries(obj).map(([k,v])=>{
    if(typeof v==="number" && v>1000) v=(v/10000000).toFixed(2)+" Cr";
    return `<tr><td style="font-weight:600">${k}</td><td>${v}</td></tr>`;
  }).join("")}</tbody></table>`;
}

export function createTableFromArray(arr){
  if(!arr?.length) return "<p>No data</p>";
  const headers=Object.keys(arr[0]);
  const headerRow=headers.map(h=>`<th>${h}</th>`).join("");
  const bodyRows=arr.map(row=>`<tr>${headers.map(h=>{
    let v=row[h]??"";
    if(typeof v==="number" && v>1000) v=(v/10000000).toFixed(2)+" Cr";
    return `<td>${v}</td>`}).join("")}</tr>`).join("");
  return `<table class="data-table-inner"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

export function showSection(section){
  const container=document.getElementById("dataContainer");
  const data=(window.lastResponse && window.lastResponse[0])?window.lastResponse[0]:{};
  container.innerHTML="";
  if(section==="debug"){ container.innerHTML=`<pre>${JSON.stringify(data,null,2)}</pre>`; return;}
  if(section==="info"){ container.appendChild(document.createElement("div")).innerHTML=createTable(data.info||{}); return;}
  if(section==="intraday"){ container.appendChild(document.createElement("div")).innerHTML=createTableFromArray(data.intraday_5min||[]); return;}
  if(section==="daily"){ container.appendChild(document.createElement("div")).innerHTML=createTableFromArray(data.historical_daily||[]); return;}
  if(section==="results"){ container.appendChild(document.createElement("div")).innerHTML=createTableFromArray(data.financials?.quarterly||[])+createTableFromArray(data.financials?.yearly||[]); return;}
  if(section==="balance"){ container.appendChild(document.createElement("div")).innerHTML=createTableFromArray(data.balance_sheet?.quarterly||[])+createTableFromArray(data.balance_sheet?.yearly||[]); return;}
  if(section==="cashflow"){ container.appendChild(document.createElement("div")).innerHTML=createTableFromArray(data.cashflow?.quarterly||[])+createTableFromArray(data.cashflow?.yearly||[]); return;}
}