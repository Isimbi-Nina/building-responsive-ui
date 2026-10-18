
import {validateAmount, validateCategory, validateDate, validateDescription} from "./validator.js";
import { compileRegex } from "./search.js";
import { records, sort, toggleSort, getVisibleRecords, getStats, getLastSevenDays } from "./state.js";
import { renderRecords, renderSort, showSearchError, renderDashboard } from "./ui.js";

function showDashboard(){
    renderDashboard(getStats(), getLastSevenDays());
}

//Connecting buttons 
const sectionButtons = document.querySelectorAll("nav [data-section]");
const sections = document.querySelectorAll("main > section");

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-section");
    if (id === "dashboard") {
        showDashboard();
    }
    sections.forEach((section) => {
        section.hidden = section.id !== id;
    });
    sectionButtons.forEach((item) => {
        if (item === button) {
            item.setAttribute("aria-current", "page");
        } else {
            item.removeAttribute("aria-current");
        }
    });
    document.getElementById(id).querySelector("h2").focus();
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

document.getElementById("record-form").addEventListener("submit", () => {
    let firstBad = null;
    recordFields.forEach((field) => {
        if (!checkField(field) && !firstBad) {
            firstBad = document.getElementById(field.id);
        }
    });
    if (firstBad) {
        firstBad.focus();
    }

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

renderSort(sort);
showRecords();
showDashboard();