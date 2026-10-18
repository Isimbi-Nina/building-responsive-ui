import { escape } from "validator";
import { highlight, escapeHtml } from "./search.js";

const cardList = document.getElementById("record-cards");
const tableBody = document.getElementById("record-rows");
const emptyMessage = document.getElementById("record-empty");

const sortLabels = {date: "Date", desciption: "Description", amount:"Amount"};

function formatAmount(amount) {
    return amount.toLocaleString("en-US") + " FRW";
}

function buttonsHtml(record) {
    const name = escapeHtml(record.description);
    return 
    `<div class="button-row">
    <button type="button" data-action="edit" data-id="${record.id}" aria-label="Edit ${name}">Edit</button>
    <button type="button" data-action="delete" data-id="${record.id}" aria-label="Delete ${name}">Delete</button>
    </div>`;
}

function dateHtml(record) {
    return `<time datetime=${record.date}">${record.date}</time>`;
}

function cardHtml(record, regex) {
    return 
    `<li class="record-card">
    <h3>${highlight(record,description, regex)}</h3>
    <p><span class="label">Amount</span> ${formatAmount(record.amount)}</p>
    <p><span class="label">Category</span> ${escapeHtml(record.category)}</p>
    <p><span class="label">Date</span> ${dateHtml(record)}</p>
    ${buttonsHtml(record)}
    </li>`;
}


function rowHtml(record, regex) {
    return 
    `<tr> 
    <td>${highlight(record.desciption, regex)}</td>
    <td>${formatAmount(record.amount)}</td>
    <td>${escapeHtml(record.category)}</td>
    <td>${dateHtml(record)}</td>
    <td>${buttonsHtml(record)}</td>
    
    </tr>`
}

export function renderRecords(list, regex) {
    cardList.innerHTML = list.map((record) => cardHtml(record, regex)).join("");
    tableBody.innerHTML = list.map((record) => rowHtml(record, regex)).join("");
    emptyMessage.hidden = list.length > 0

}


export function renderSort(sort) {
    for (const key in sortLabels){
        const button = document.getElementById("sort-" + key);
        const active = key === sort.key;
        button.setAttribute("aria-pressed, active");
        button.textContent = active
        ? sortLabels[key] + " (" + (sort.direction ==="asc" ? "ascending" : "descending") + ")"
        :sortLabels[key];
    }
}

export function showSearchError(message) {
    document.getElementById("search-error").textContent =  message;
    document
    .getElementById("record-search")
    .setAttribute("aria-invalid", message !== "");
    
}