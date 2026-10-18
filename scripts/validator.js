export const PATTERNS = {
    description: /^\S(?:.*\S)?$/,
    doubleSpace: /\s{2,}/,
    repeatedWord: /\b(\w+)\s+\1\b/i,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    rate: /^(?:\d+\.?\d*|\.\d+)$/
};

export function validateRate(value) {
    if (value === "") {
        return "Enter a rate.";
    }
    if(!PATTERNS.rate.test(value) || Number(value) <=0) {
        return "Use a number above 0, for example 0.00069.";
    }
    return "";
}



export function validateDescription(value) {
    if (value === "") {
        return "Enter a description.";
    }
    if (!PATTERNS.description.test(value)) {
        return "Remove spaces at the start or end.";
    }
    if (PATTERNS.doubleSpace.test(value)) {
        return "Use one space between words.";
    }
    const repeat = value.match(PATTERNS.repeatedWord);
    if(repeat) {
        return 'The word "' + repeat[1] + '" is repeated. Remove one.';

    }
    return "";
}

export function validateAmount(value) {
    if(value === "" ) {
        return "Enter an amount.";
    }
    if (!PATTERNS.amount.test(value)) {
        return "Use digits with up to 2 decimals, for example 3500 or 12.50. No leading zero.";
    }
    return "";
}


function isRealDate(value) {
    const year = Number(value.slice(0,4));
    const month = Number(value.slice(5,7));
    const day = Number(value.slice(8,10));
    const d = new Date(Date.UTC(year, month -1, day));
    return (
        d.getUTCFullYear() === year && d.getUTCMonth() === month -1 && d.getUTCDate() === day 
    );
}

export function validateDate(value) {
    if(value === "") {
        return "Enter a date.";

    }

    if(!PATTERNS.date.test(value)) {
        return "Use the format YYY-MM-DD, for example 2026-10-14.";
    }
    if(!isRealDate(value)) {
        return "That day does not exist in the calendar.";
    }
    return "";
}

export function validateCategory(value) {
    if (value === "") {
        return "Choose a category.";
    }
    if (!PATTERNS.category.test(value)) {
        return "Use letters only, with single spaces or hyphens between words.";
    }
    return "";
}
