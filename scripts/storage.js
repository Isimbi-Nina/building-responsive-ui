import { validateDescription, validateAmount, validateDate, validateCategory } from "./validators.js";

const RECORDS_KEY = "finance:records";
const SETTINGS_KEY= "finance:settings";

export const DEFAULT_SETTINGS = {
    baseCurrency: "FRW",
    rates: {FRW: 1, USD: 0.00069, EUR:0.00064 },
    displayCurrency : "FRW",
    cap: 500000,
    categories: ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"]
};

export function loadRecords(){
    const text = localStorage.getItem(RECORDS_KEY);
    if(text === null) {
        return null;
    }
    try{
        const list = JSON.parse(text);
        return Array.isArray(list) ? list : [];

    } catch {
        return [];
    }
}

export function saveRecords(list) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
}

export async function loadSeed() {
    try {
        const response = await fetch("seed.json");
        if(!response.ok) {
            return [];
        }
        const result = paarseImport(await response.text());
        return result.error? [] : result.records;
    } catch {
        return [];
    }
}

export function loadSettings() {
    const settings = {
        baseCurrency: DEFAULT_SETTINGS.baseCurrency,
        rates: {...DEFAULT_SETTINGS.rates},
        displayCurrency:DEFAULT_SETTINGS.displayCurrency,
        cap: DEFAULT_SETTINGS.cap,
        categories: [...DEFAULT_SETTINGS.categories]
    };
    let saved = null;
    try{
        saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    }catch {
        return settings;
    }
    if (saved === null || typeof saved !== "object"){
        return settings;
    }
    if(typeof saved.cap === "number" && saved.cap >=0) {
        settings.cap = saved.cap;
    }
    if(saved.rates && typeof saved.rates === "object") {
        for (const code in settings.rates) {
            if (code !== settings.baseCurrency && saved.rates[code] >0) {
                settings.rates[code] = Number(saved.rates[code]);
            }
        }
    }

    if(saved.displayCurrency in settings.rates) {
        settings.displayCurrency = saved.displayCurrency;
    }

    if (Array.isArray(saved.categories) && saved.categories.length > 0) {
        settings.categories = saved.categories.filter((name) => typeof name === "string");
    }
    return settings;
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportJson(list) {
    return JSON.stringify(list,null, 2);

}

export function downloadJSON(list) {
    const blob = new Blob([exportJson(list)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finance-records.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function checkRecord(record) {
    if (record === null || typeof record !== "object" || Array.isArray(record) ){
        return "is not an object.";
    }
    if (typeof record.id !== "string" || record.id === "" ){
        return "needs an id.";
    }
    if (typeof record.description !== "string"){
        return "needs a description.";
    }
    if (typeof record.amount !== "number" || !isFinite(record.amount) ){
        return "needs an amount that is a number.";
    }
    if (typeof record.category !== "string"){
        return "needs a category.";
    }
    if (typeof record.date !== "string"){
        return "needs a date.";
    }

    const problem = 
    validateDescription(record.description) ||
    validateAmount(String(record.amount)) ||
    validateCategory(record.category) ||
    validateDate(record.date);
    return problem;



}



export function parseImport(text) {
    let data;
    try{
        data= JSON.parse(text);
    } catch {
        return {error: "Invalid JSON: expected a list of records"};
    }
    if (!Array.isArray(data)) {
        return {error: "Invalid JSON: expected a list of records"};
    }
    const ids =  new Set();
    const now =  new Date().toISOString();
    const records = [];
    for (let i = 0; i < data.length; i++) {
        const problem = checkRecord(data[i]);
        if (problem) {
            return {error: "Invalid record " + (i + 1) + ": " + problem};
        }
        if(ids.has(data[i].id)) {
            return { error: "Invalid record" + (i + 1) + ": the id" + data[i].id + " is used twice."};
        }
        ids.add(data[i].id);
        records.push({
            id : data[i].id,
            description: data[i].description,
            amount: data[i].amount,
            category: data[i].category,
            date: data[i].date,
            createdAt: typeof data[i].createdAt === "string" ? data[i].createdAt : now,
            updatedAt: typeof data[i].updatedAt === "string" ? data[i].updatedAt : now

        });

    }
    return {records};
}