let jsonData = [];

window.onload = function() {
  loadJSON();
  renderTable();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  console.log(file.type);
  if (file.type === "text/plain") {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        jsonData = JSON.parse(event.target.result);
        alert("File loaded successfully!");
        renderTable();
      } catch (error) {
        alert("Error parsing JSON file!");
      }
    };
    reader.readAsText(file);
  } else {
    alert("Please select a Text file!");
  }
}

function saveJSON() {
  if (jsonData) {
    localStorage.setItem("jsonData", JSON.stringify(jsonData));
    alert("JSON data saved to LocalStorage!");
  } else {
    alert("Please select a JSON file and parse it first!");
  }
}

function loadJSON() {
  const storedData = localStorage.getItem("jsonData");
  if (storedData) {
    jsonData = JSON.parse(storedData);
    alert("JSON data loaded from LocalStorage!");
    renderTable();
  } else {
    alert("No JSON data found in LocalStorage!");
  }
}

function clearLocalStorage() {
  localStorage.clear();
  jsonData = [];
  renderTable();
}

function renderTable() {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";
  
    const table = document.createElement("table");
    table.className = "table table-bordered";
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    const th1 = document.createElement("th");
    const th2 = document.createElement("th");
    const th3 = document.createElement("th");
    th1.innerText = "Key";
    th2.innerText = "Value";
    th3.innerText = "Description";
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    if (jsonData) {
    for (const person of jsonData) {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      const td3 = document.createElement("td");
      const input1 = document.createElement("input");
      const input2 = document.createElement("input");
      const input3 = document.createElement("input");
      input1.type = "text";
      input1.value = person.key;
      input1.addEventListener("input", (event) => {
        person.key = event.target.value;
      });
      input2.type = "text";
      input2.value = person.value;
      input2.addEventListener("input", (event) => {
        person.value = parseInt(event.target.value);
      });
      input3.type = "text";
      input3.value = person.description;
      input3.addEventListener("input", (event) => {
        person.description = event.target.value;
      });
      td1.appendChild(input1);
      td2.appendChild(input2);
      td3.appendChild(input3);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  }
}

function addNewRecord() {
  jsonData.push({ key: '', value: '', description: '' });
  renderTable();
}
