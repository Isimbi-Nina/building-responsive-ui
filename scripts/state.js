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