/**
 * The Configurations or Key/Value Pairs holder
 */
let jsonData = [];
/**
 * User PassPhrase which is supposed to entered by User
 */
let passPhrase = '';
/**
 * LOCAL_STORAGE_KEY_FOR_JSON_DATA
 */
const LOCAL_STORAGE_KEY_FOR_JSON_DATA = 'ENCRYPT_JS_DATA_OBJECT';
/**
 * On load of the Page call necessary Functions
 */
window.onload = function() {
  loadJSON();
  renderTable();
  // tempFunc();
  const userPassPhraseElement = document.getElementById("userPassPhrase");
  const userPassPhraseSubmitButton = document.getElementById("userPassPhraseSubmitButton");
  if (userPassPhraseElement) {
    userPassPhraseElement.addEventListener("input", (event) => {
      passPhrase = event.target.value;
      if (userPassPhraseSubmitButton && passPhrase) {
        userPassPhraseSubmitButton.disabled = false;
      }
    });
  }
}

function addNewRecord() {
  jsonData.push({ key: '', value: '', description: '' });
  renderTable();
}

function clearLocalStorage() {
  localStorage.clear();
  jsonData = [];
  renderTable();
}
/**
 * Downloads Data into a Text file
 */
async function downLoadData() {
  if (jsonData && Array.isArray(jsonData)) {
    for await (const keyPair of jsonData) {
      if (keyPair.keyEncrypted && keyPair.valueEncrypted) {
        continue;
      } else {
        await (async () => {
          if (!keyPair.keyEncrypted && keyPair.key) {
            keyPair.key = await encryptWithPassphrase(passPhrase, keyPair.key);
          }
          if (!keyPair.valueEncrypted && keyPair.value) {
            keyPair.value = await encryptWithPassphrase(passPhrase, keyPair.value);
          }
        })();
      }
    }
    await updateJSON();
    const serializedString  = localStorage.getItem(LOCAL_STORAGE_KEY_FOR_JSON_DATA);
    await downloadAsTextFile(serializedString);
    showAlert(false, "Downloaded encrypted data as a Text file");
  } else {
    showErrorAlert("No Records to download");
  }
}
/**
 * writes the serializedJSONString into text file
 */
async function downloadAsTextFile(serializedString) {
  const blob = new Blob([serializedString], { type: 'text/plain' });
  // Create a temporary anchor element
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  
  // Set the file name  
  downloadLink.download = "EncryptJS_Data_" + new Date().toString() + ".txt";

  // Simulate a click on the download link
  downloadLink.click();

  // Clean up
  URL.revokeObjectURL(downloadLink.href);
  downloadLink.hidden = true;
}
/**
 * Does basic Decoding of Input String
 */
function decryptText() {
  const inputField = document.getElementById("encDecTextField");
  const encDecTextFieldOut = document.getElementById("encDecTextFieldOut");
  const textValue = inputField.value;
  if (textValue) {
    // alert(textValue);
    try {
      const decryptedStr = atob(atob(textValue));
      encDecTextFieldOut.innerHTML = decryptedStr;
    } catch (e) {
      console.log(e);
      showErrorAlert('Error in Decrypting input');
    }
  }
}
/**
 * Does basic Encoding of Input String
 */
function encryptText() {
  const inputField = document.getElementById("encDecTextField");
  const encDecTextFieldOut = document.getElementById("encDecTextFieldOut");
  const textValue = inputField.value;
  if (textValue) {
    // alert(textValue);
    try {
      const encryptedStr = btoa(btoa(textValue));
      encDecTextFieldOut.innerHTML = encryptedStr;
    } catch (e) {
      console.log(e);
      showErrorAlert('Error in encrypting input');
    }
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  console.log(file.type);
  if (file.type === "text/plain") {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        jsonData = JSON.parse(event.target.result);
        updateJSON();
        showAlert(false, "File loaded successfully!");
        renderTable();
      } catch (error) {
        showErrorAlert("Error parsing JSON file!");
      }
    };
    reader.readAsText(file);
  } else {
    showErrorAlert("Please select a Text file!");
  }
}

function loadJSON() {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY_FOR_JSON_DATA);
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    if (parsedData && Array.isArray(parsedData)) {
      jsonData = parsedData;
      showAlert(false, "JSON data loaded from LocalStorage!");
      renderTable();
    } else {
      showErrorAlert("Could not parse the data from LocalStorage");
    }
  } else {
    showAlert(false, "No JSON data found in LocalStorage!");
  }
}

async function updateJSON() {
  if (jsonData && Array.isArray(jsonData)) {
    localStorage.setItem(LOCAL_STORAGE_KEY_FOR_JSON_DATA, JSON.stringify(jsonData));
  } else {
    showErrorAlert("Something wrong, please clear the Data and re-add the records");
  }
}

/**
 * Once the Passphrase is keyed In, do the processing which is necessary
 */
function processPassPhrase() {
  if (validatePassphrase(passPhrase)) {
    showAlert(false, 'Processed the Input PassPhrase ');
  } else {
    showErrorAlert(' Pass Phrase must be more than 8 characters');
  }
}

function validatePassphrase(passphrase) {
  const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.]).{8,}$/;
  return passRegex.test(passphrase);
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
  const th4 = document.createElement("th");

  th1.innerText = "Key";
  th2.innerText = "Secret";
  th3.innerText = "Description";
  th4.innerText = "Actions";

  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  tr.appendChild(th4);

  thead.appendChild(tr);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  if (jsonData) {
    let i = 0;
    for (const keyPair of jsonData) {
      const tr = document.createElement("tr");

      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      const td3 = document.createElement("td");
      const keyFieldInput = document.createElement("input");
      const valueFieldInput = document.createElement("input");
      const descFieldInput = document.createElement("input");
      // const descFieldInput = document.createElement("input");
      keyFieldInput.type = "password";
      keyFieldInput.id = "configKey-" + i;
      keyFieldInput.name = "configKey-" + i;
      keyFieldInput.value = keyPair.key;
      const curIndex = i;
      keyFieldInput.addEventListener("input", (event) => {
        if (event.target.value != keyPair.key) {// means there is a change
          const saveButtonElement = document.getElementById("saveButton-" + curIndex);
          if (saveButtonElement) {
            saveButtonElement.disabled = false;
          }
          keyPair.encrypted = false;
          keyPair.keyEncrypted = false;
          keyPair.key = event.target.value;
        }
      });
      valueFieldInput.type = "password";
      valueFieldInput.value = keyPair.value;
      valueFieldInput.id = "configValue-" + i;
      valueFieldInput.name = "configValue-" + i;
      valueFieldInput.addEventListener("input", (event) => {
        if (event.target.value != keyPair.value) {// means there is a change
          const saveButtonElement = document.getElementById("saveButton-" + curIndex);
          if (saveButtonElement) {
            saveButtonElement.disabled = false;
          }
          keyPair.encrypted = false;
          keyPair.valueEncrypted = false;
          keyPair.value = event.target.value;
        }
      });
      descFieldInput.type = "text";
      descFieldInput.value = keyPair.description;
      descFieldInput.id = "configDescription-" + i;
      descFieldInput.name = "configDescription-" + i;
      descFieldInput.addEventListener("input", (event) => {
        keyPair.description = event.target.value;
      });

      const copyIconKey = document.createElement("span");
      copyIconKey.classList = "encrypt-js-copy-icon";
      copyIconKey.id = "copyIconKey-" + i;
      copyIconKey.name = "copyIconKey-" + i;
      // SVG element for the Icon
      var svgElement = document.createElement('div');
      svgElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>';
      
      copyIconKey.appendChild(svgElement);
      copyIconKey.addEventListener("click", async (event) => {
        const decryptedText = await decryptWithPassphrase(passPhrase, keyPair.key);
        console.log(decryptedText);
        // Copy the decrypted value to the clipboard
        navigator.clipboard.writeText(decryptedText)
          .then(() => {
            showAlert(false, 'Decrypted value copied to clipboard');
          })
          .catch((error) => {
            showErrorAlert('Failed to copy: ', error);
          });
      });

      const copyIconValue = document.createElement("span");
      copyIconValue.classList = "encrypt-js-copy-icon";
      copyIconValue.id = "copyIconValue-" + i;
      copyIconValue.name = "copyIconValue-" + i;

      var svgElement2 = document.createElement('div');
      svgElement2.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>';

      copyIconValue.appendChild(svgElement2);
      copyIconValue.addEventListener("click", async (event) => {
        const decryptedText = await decryptWithPassphrase(passPhrase, keyPair.value);
        console.log(decryptedText);
        // Copy the decrypted value to the clipboard
        navigator.clipboard.writeText(decryptedText)
          .then(() => {
            showAlert(false, 'Decrypted value copied to clipboard');
          })
          .catch((error) => {
            showErrorAlert('Failed to copy: ', error);
          });
      });

      td1.appendChild(keyFieldInput);
      td1.appendChild(copyIconKey);
      td2.appendChild(valueFieldInput);
      td2.appendChild(copyIconValue);
      td3.appendChild(descFieldInput);

      const td4 = document.createElement("td");
      const saveButton = document.createElement("input");
      saveButton.type = "button";
      // saveButton.classList
      saveButton.classList = "btn btn-success";
      saveButton.value = "Save";
      saveButton.id = "saveButton-" + i;
      saveButton.name = "saveButton-" + i;
      saveButton.disabled = true;
      if(keyPair.encrypted) {
        saveButton.disabled = true;
      }
      saveButton.addEventListener("click", async (event) => {
        if (!passPhrase || passPhrase.length < 8) {
          showErrorAlert('Pass Phrase is not Entered, please input and re-submit');
        } else {
          if (keyPair && !keyPair.encrypted) {
            if (keyPair.value && !keyPair.valueEncrypted) {
              keyPair.value = await encryptWithPassphrase(passPhrase, keyPair.value);
              keyPair.valueEncrypted = true;
              if (keyPair.keyEncrypted) {
                keyPair.encrypted = true;
                console.log(jsonData);
              }
            }
            if (keyPair.key && !keyPair.keyEncrypted) {
              keyPair.key = await encryptWithPassphrase(passPhrase, keyPair.key);
              keyPair.keyEncrypted = true;
              if (keyPair.valueEncrypted) {
                keyPair.encrypted = true;
              }
              console.log(jsonData);
            }
            if (keyPair.valueEncrypted && keyPair.keyEncrypted) {
              updateJSON();
            }
          }
        }
        showAlert(false, 'Encrypted the Input Key and/or Value');
      });

      td4.appendChild(saveButton);

      const deleteButton = document.createElement("input");
      deleteButton.type = "button";
      deleteButton.classList = "btn btn-danger";
      deleteButton.value = "Delete";
      deleteButton.id = "deleteButton-" + i;
      deleteButton.name = "deleteButton-" + i;
      deleteButton.addEventListener("click", (event) => {
        // jsonData TODO:
        showErrorAlert('Delete Button Click worked..!!');
      });
      td4.appendChild(deleteButton);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);

      tbody.appendChild(tr);
      i++;
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  }
}

function saveJSON() {
  if (jsonData) {
    localStorage.setItem("jsonData", JSON.stringify(jsonData));
    showErrorAlert("JSON data saved to LocalStorage!");
  } else {
    showErrorAlert("Please select a JSON file and parse it first!");
  }
}

function showAlert(isError, message) {
  const successMessageBox = document.getElementById("successMessageBox");
  const errorMessagBox = document.getElementById("errorMessagBox");
  let elementTarget = (isError)? errorMessagBox: successMessageBox;
  if (elementTarget) {
    elementTarget.hidden = false;
    elementTarget.innerHTML = message? message: elementTarget.innerHTML;
    setTimeout(function(){
      elementTarget.hidden = true;
    }, 3000);
  }
}

function showErrorAlert(message) {
  showAlert(true, message);
}

/**
 * Function to decrypt data with a passphrase
 * @param {*} passphrase 
 * @param {*} data 
 * @returns 
 */
async function decryptWithPassphrase(passphrase, data) {
  try {
    const decryptedString = CryptoJS.AES.decrypt(data, passphrase).toString(CryptoJS.enc.Utf8);
    return decryptedString;
  } catch (error) {
    showErrorAlert("Error in Decrypting");
    console.log(error);
    return '';
  }
}

/**
 * Function to encrypt data with a passphrase
 * @param {*} passphrase 
 * @param {*} data 
 * @returns 
 */
async function encryptWithPassphrase(passphrase, data) {
  try {
    const encryptedString = CryptoJS.AES.encrypt(data, passphrase).toString();
    return encryptedString;
  } catch (error) {
    showErrorAlert("Error in Encrypting");
    console.log(error);
    return '';
  }
}
