export const records = [];

export const sort = {key: "date", direction: "desc"}

export function toggleSort(key) {
    if(sort.key ===key) {
        sort.direction = sort.direction === "asc" ? "desc" : "asc";
    } else {
        sort.key = key;
        sort.direction = "asc";
    }
}

function compare(a, b) {
    let result;
    if(sort.key === "amount") {
        result = a.amount - b.amount;

    }else if (sort.key == "description") {
        result = a.description.localeCompare(b.description);
    }else {
        result = a.date.localeCompare(b.date);
    }
    return sort.direction === "asc" ? result : -result;
}

export function getVisibleRecords(regex) {
    const matching = records.filter((record) => {
        return regex === null || record.description.search(regex) !== -1;
    });
    return matching.sort(compare);
}


function nextId() {
    let highest = 0;
    for (const record of records) {
        const match = record.id.match(/^txn_(\d+)$/);
        if (match){
            highest =  Math.max(highest, Number(match[1]));
        }
    }
    return "txn_" + String(highest+1).padStart(4, "0");

}

export function addRecord(fields) {
    const now = new Date().toISOString();
    const record = {
        id: nextId(),
        description: fields.description,
        amount: fields.amount,
        category: fields.category,
        date: fields.date,
        createdAt: now,
        updatedAt: now
    };
    records.push(record);
    return record;
}

export function findRecord(id){
    return records.find((record) => record.id === id);
}

export function updateRecord(id, fields){
    const record =  findRecord(id);
    if(!record) {
        return;
    }
    record.description = fields.description;
    record.amount= fields.amount;
    record.category = fields.category;
    record.date = fields.date;
    record.updatedAt = new Date().toISOString();
}

export function deleteRecord(id) {
    const index = records.findIndex((record) => record.id === id);
    if (index !== -1) {
        records.splice(index, 1);
    }
}

export function setRecords(list) {
    records.length = 0;
    records.push(...list);
}

export const settings = {
    baseCurrency: "FRW",
    rates: {FRW: 1},
    displayCurrency: "FRW",
    cap: 500000,
    categories: []
};

export function setSettings(newSettings) {
    Object.assign(settings, newSettings);
}

function sumAmounts(list) {
    let total = 0;
    for (const record of list) {
        total += record.amount;
    }
    return total;
}

function datekey(date) {
    const month =  String(date.getMonth() + 1).padStart(2,"0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
}

export function getStats() {
    const totals ={};
    for (const record of records) {
        totals[record.category] = (totals[record.category] || 0) + record.amount;
    }
    let topCategory = "None";
    let topSum = 0;
    for (const category in totals) {
        if (totals[category] > topSum) {
            topCategory = category;
            topSum = totals[category];
        }
    }

    const total =  sumAmounts(records);
    return {
        count : records.length,
        total,
        topCategory,
        cap: settings.cap,
        remaining: settings.cap - total
    };
}

export function getLastSevenDays() {
    const days = [];
    for (let back=6; back >=0; back--) {
        const date = new Date();
        date.setDate(date.getDate() - back);
        const key = datekey(date);
        const total = sumAmounts(records.filter((record) => record.date ===key));
        days.push({date, key, total});
    }
    return days;
}