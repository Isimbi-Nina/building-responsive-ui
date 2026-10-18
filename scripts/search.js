export function compileRgex(input, ignoreCase) {
    try{
        return new RegExp(input, ignoreCase ? "gi" : "g");
    }catch {
        return null;
    }
}

export function escapeHtml(text){
    return text
    .replace(/&/g, "&amp")
    .replace(/</g, "&lt")
    .replace(/>/g, "&gt")
    .replace(/"/g, "&quot");
}

export function highlight(text, regex) {
    if(regex === null) {
        return escapeHtml(text);
    }

    const marked = text.replace(regex, "\u0001$&\u0002");
    return escapeHtml(marked)
    .replaceAll("\u0001", "<mark>")
    .replaceAll("\u0002", "</mark>")
}