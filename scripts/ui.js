import { highlight, escapeHtml } from "./search.js";
import { settings } from "./state.js";

const cardList = document.getElementById("record-cards");
const tableBody = document.getElementById("record-rows");
const emptyMessage = document.getElementById("records-empty");

const sortLabels = {date: "Date", description: "Description", amount:"Amount"};

function formatAmount(amount) {
    const code = settings.displayCurrency;
    const rate = settings.rates[code] || 1;

    const decimals = code === settings.baseCurrency ? 0 : 2;
    return (amount * rate).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: 2
    }) + " " + code;
}

export function showStatus(message) {
    document.getElementById("status").textContent = message;
}

export function renderCategories(categories) {
    document.getElementById("category-list").innerHTML = categories.map((name) => {
        const safe =escapeHtml(name);
        return `<li>
        <span>${safe}</span>
        <button type="button" data-remove-category="${safe}">Remove ${safe}</button>
        </li>`;
    }).join("");

    const select = document.getElementById("category");
    const chosen = select.value;
    select.innerHTML = '<option value="">Choose a category</option>' + categories.map((name) => {
        const safe = escapeHtml(name);
        return `<option value="${safe}">${safe}</option>`;
    }).join("");
    select.value = chosen;
}

export function setFormMode(editing) {
    document.getElementById("add-edit-heading").textContent = editing ? "Edit entry" : "New entry";
    document.getElementById("record-submit").textContent = editing ? "Update transaction" : "Add transaction";
    document.getElementById("record-cancel").hidden = !editing;
}

export function fillSettingsForm(values){
    document.getElementById("spending-cap").value = values.cap;
    document.getElementById("rate-usd").value = values.rates.USD;
    document.getElementById("rate-eur").value = values.rates.EUR;
    document.getElementById("display-currency").value = values.displayCurrency;

}

function buttonsHtml(record) {
    const name = escapeHtml(record.description);
    return `<div class="button-row">
    <button type="button" data-action="edit" data-id="${record.id}" aria-label="Edit ${name}">Edit</button>
    <button type="button" data-action="delete" data-id="${record.id}" aria-label="Delete ${name}">Delete</button>
    </div>`;
}

function dateHtml(record) {
    return `<time datetime="${record.date}">${record.date}</time>`;
}

function cardHtml(record, regex) {
    return `<li class="record-card">
    <h3>${highlight(record.description, regex)}</h3>
    <p><span class="label">Amount</span> ${formatAmount(record.amount)}</p>
    <p><span class="label">Category</span> ${escapeHtml(record.category)}</p>
    <p><span class="label">Date</span> ${dateHtml(record)}</p>
    ${buttonsHtml(record)}
    </li>`;
}


function rowHtml(record, regex) {
    return `<tr> 
    <td>${highlight(record.description, regex)}</td>
    <td>${formatAmount(record.amount)}</td>
    <td>${escapeHtml(record.category)}</td>
    <td>${dateHtml(record)}</td>
    <td>${buttonsHtml(record)}</td>
    
    </tr>`;
}

export function renderRecords(list, regex) {
    cardList.innerHTML = list.map((record) => cardHtml(record, regex)).join("");
    tableBody.innerHTML = list.map((record) => rowHtml(record, regex)).join("");
    emptyMessage.hidden = list.length > 0;

}


export function renderSort(sort) {
    for (const key in sortLabels){
        const button = document.getElementById("sort-" + key);
        const active = key === sort.key;
        button.setAttribute("aria-pressed", active);
        button.textContent = active
        ? sortLabels[key] + " (" + (sort.direction === "asc" ? "ascending" : "descending") + ")"
        : sortLabels[key];
    }
}

export function showSearchError(message) {
    document.getElementById("search-error").textContent = message;
    document
    .getElementById("record-search")
    .setAttribute("aria-invalid", message !== "");
    
}

export function renderDashboard(stats, days) {
    document.getElementById("stat-count").textContent = stats.count;
    document.getElementById("stat-total").textContent = formatAmount(stats.total);
    document.getElementById("stat-top").textContent = stats.topCategory;

    let biggest= 0;
    for (const day of days) {
        biggest = Math.max(biggest, day.total);
    }
    document.querySelector(".chart").innerHTML = days.map((day) => {
        const fill = biggest === 0 ? 0 : day.total / biggest;
        const name = day.date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
        return `<li>
        <div class="bar-track">
        <div class="bar" style="--fill: ${fill}">
        <span class="visually-hidden">${name}, ${formatAmount(day.total)}</span>
        </div>
        </div>
        <span class="bar-label">${day.date.getDate()}</span>        
        </li>`;
    }).join("");

    const polite = document.getElementById("cap-polite");
    const assertive = document.getElementById("cap-assertive");
    if(stats.remaining >= 0) {
      polite.textContent = "You are under the cap. " + formatAmount(stats.remaining) + " remaining.";
      assertive.textContent = "";
    }else {
      assertive.textContent = "You are over the cap by " + formatAmount(-stats.remaining) + ".";
      polite.textContent= " ";
    }

}