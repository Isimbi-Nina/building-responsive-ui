import {validateAmount, validateCategory, validateDate, validateDescription, validateRate} from "./validator.js";
import { compileRegex } from "./search.js";
import { records, sort, toggleSort, getVisibleRecords, getStats, getLastSevenDays, settings, addRecord, findRecord, updateRecord, deleteRecord, setRecords, setSettings } from "./state.js";
import { renderRecords, renderSort, showSearchError, renderDashboard, showStatus, fillSettingsForm, renderCategories,setFormMode } from "./ui.js";

import {loadRecords, saveRecords, loadSettings, saveSettings, loadSeed, downloadJson, parseImport} from "./storage.js";

function showDashboard(){
    renderDashboard(getStats(), getLastSevenDays());
}

//Connecting buttons 
const sectionButtons = document.querySelectorAll("nav [data-section]");
const sections = document.querySelectorAll("main > section");

function showSection(id) {
    if (id === "dashboard") {
        showDashboard();
    }

    sections.forEach((section) => {
    section.hidden = section.id !== id;
    });

    sectionButtons.forEach((item) => {
        if(item.getAttribute("data-section") === id) {
            item.setAttribute("aria-current", "page");
        }else {
            item.removeAttribute("aria-current");
        }
    });
    document.getElementById(id).querySelector("h2").focus();
}
sectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showSection(button.getAttribute("data-section"));
    });
});




document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}); 


//Form checks and errors
const recordFields = [
    {id: "description", validate: validateDescription },
    {id: "amount", validate: validateAmount},
    {id: "date", validate: validateDate },
    {id: "category", validate: validateCategory}

];

function checkField(field) {
    const input = document.getElementById(field.id);
    const error = field.validate(input.value);
    document.getElementById(field.id + "-error").textContent = error;
    input.setAttribute("aria-invalid", error === ""? "false" : "true");
    return error === "";
}

recordFields.forEach((field) =>{
    const input = document.getElementById(field.id);
    input.addEventListener("input", () => checkField(field));
    input.addEventListener("blur", () => checkField(field));

});

let editingId = null;
const recordForm = document.getElementById("record-form");

function resetRecordForm(){
    recordForm.reset();
    recordFields.forEach((field) => {
        document.getElementById(field.id + "-error").textContent = "";
        document.getElementById(field.id).setAttribute("aria-invalid", "false");

    });
    editingId = null;
    setFormMode(false);
}



recordForm.addEventListener("submit", () => {
    let firstBad = null;
    recordFields.forEach((field) => {
        if (!checkField(field) && !firstBad) {
            firstBad = document.getElementById(field.id);
        }
    });
    if (firstBad) {
        firstBad.focus();
        return;
    }
    const fields = {
        description: document.getElementById("description").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    const wasEditing = editingId !== null;
    if(wasEditing) {
        updateRecord(editingId, fields);
    }else {
        addRecord(fields);
    }
    saveRecords(records);
    resetRecordForm();
    refreshAll();
    showSection("records");
    showStatus(wasEditing ? "Updated" : "Saved");

});

document.getElementById("record-cancel").addEventListener("click", () => {
    resetRecordForm();
    showSection("records");
    showStatus("Edit cancelled");

});

document.getElementById("records").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if(!button) {
        return;
    }
    const record = findRecord(button.getAttribute("data-id"));
    if(!record) {
        return;
    }
    if(button.getAttribute("data-action") === "delete") {
        if(confirm("Delete this transaction?")) {
            deleteRecord(record.id);
            saveRecords(records);
            refreshAll();
            showStatus("Deleted");
        }
        return;
    }

    resetRecordForm();
    document.getElementById("description").value = record.description;
    document.getElementById("amount").value = String(record.amount);
    document.getElementById("date").value = record.date;
    const select = document.getElementById("category");
    select.value = record.category;
    if(select.value !== record.category) {
        select.add(new Option(record.category, record.category, true, true));
    }

    editingId = record.id;
    setFormMode(true);
    showSection("add-edit");
});


const searchInput = document.getElementById("record-search");
const ignoreCase = document.getElementById("search-ignore-case");

function showRecords() {
    let regex = null;
    if (searchInput.value !== "") {
        regex = compileRegex(searchInput.value, ignoreCase.checked);
        if (regex ===null) {
            showSearchError("Invalid pattern");
            return;
        }
    }
    showSearchError("");
    renderRecords(getVisibleRecords(regex), regex);
}


searchInput.addEventListener("input", showRecords);
ignoreCase.addEventListener("change", showRecords);

document.querySelectorAll("[data-pattern]").forEach((button) => {
    button.addEventListener("click", () => {
        searchInput.value = button.getAttribute("data-pattern");
        showRecords();
    });
});

["date", "description", "amount"].forEach((key) => {
    document.getElementById("sort-" + key).addEventListener("click", () => {
        toggleSort(key);
        renderSort(sort);
        showRecords();
    });
});

const settingsFields = [
    {id:"spending-cap", validate: validateAmount },
    {id: "rate-usd", validate: validateRate},
    {id: "rate-eur", validate:validateRate }
];

settingsFields.forEach((field) => {
    const input = document.getElementById(field.id);
    input.addEventListener("input", () => checkField(field));
    input.addEventListener("blur", () => checkField(field));
});

function refreshAll(){
    showRecords();
    showDashboard();
}

document.getElementById("settings-form").addEventListener("submit", () => {
    const active = document.activeElement.id;
    if (active === "new-category" || active === "add-category") {
        addCategory();
        return;
    }

    let firstBad = null;
    settingsFields.forEach((field) => {
        if (!checkField(field) && !firstBad ) {
            firstBad =document.getElementById(field.id);
        }
    });

    if (firstBad) {
        firstBad.focus();
        showStatus("Settings not saved. Fix errors first");
        return;
    }

    setSettings({
        cap: Number(document.getElementById("spending-cap").value),
        rates: {
            FRW: 1,
            USD: Number(document.getElementById("rate-usd").value),
            EUR: Number(document.getElementById("rate-eur").value)
        },
        displayCurrency: document.getElementById("display-currency").value
    });
    saveSettings(settings);
    refreshAll();
    showStatus("Settings saved");

});

const newCategory = document.getElementById("new-category");

function showCategoryError(message) {
    document.getElementById("new-category-error").textContent = message;
    newCategory.setAttribute("aria-invalid", message === "" ? "false" : "true");
}

newCategory.addEventListener("input", () => {
    showCategoryError(newCategory.value === "" ? "" : validateCategory(newCategory.value));
});

function addCategory() {
    const name = newCategory.value;
    let error = validateCategory(name);
    if(error === "Choose a category."){
        error = "Enter a category name.";
    }

    const exists = settings.categories.some((item) => item.toLowerCase() === name.toLowerCase() );
    if(error === "" && exists) {
        error = "That category already exists."
    }
    showCategoryError(error);
    if(error !== "") {
        newCategory.focus();
        return;
    }
    settings.categories.push(name);
    saveSettings(settings);
    renderCategories(settings.categories);
    newCategory.value = "";
    newCategory.focus();
    showStatus("Added category " + name);
}

document.getElementById("category-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-category]");
  if (!button) {
    return;
  }
  const name = button.getAttribute("data-remove-category");
  const used = records.filter((record) => record.category === name).length;
  if (used > 0) {
    showStatus("Cannot remove " + name + ". " + used + " transactions use it.");
    return;
  }
  if (settings.categories.length === 1){
    showStatus("Keep at least one category");
    return;
  }
  settings.categories = settings.categories.filter((item) => item !== name);
  saveSettings(settings);
  renderCategories(settings.categories);
  document.getElementById("new-category").focus();
  showStatus("Removed Category " + name);
});

document.getElementById("export-records").addEventListener("click", () => {
  downloadJson(records);
  showStatus("Exported " + records.length + " records");
});

document.getElementById("import-file").addEventListener("change", async (event) => {
    const input = event.target;
    const file = input.files[0];
    if(!file) {
        return;

    }
    const result = parseImport(await file.text());
    if(result.error) {
        showStatus(result.error);
    } else {
        setRecords(result.records);
        saveRecords(records);

        for (const record of records) {
            if (!settings.categories.includes(record.category)) {
                settings.categories.push(record.category);
            }
        }
        saveSettings(settings);
        renderCategories(settings.categories);
        refreshAll();
        showStatus("Imported " + result.records.length + " records");
    }
    input.value = "";
});

async function start() {
    setSettings(loadSettings());
    fillSettingsForm(settings);
    renderCategories(settings.categories);

    let saved = loadRecords();
    if (saved === null) {
    saved = await loadSeed();
    saveRecords(saved);
    }
    setRecords(saved);

    renderSort(sort);
    refreshAll();
}

start();