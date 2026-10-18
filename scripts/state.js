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
        return regex ===null || record.decription.search(regex) !== -1;
    });
    return matching.sort(compare);
}


export const settings = {cap: 500000 };

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
        cap: settings.cap - total
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