
import {validateAmount, validateCategory, validateDate, validateDescription} from "./validator.js";

//Connecting buttons and forms on the page to the rest of the app
const sectionButtons = document.querySelectorAll("nav [data-section]");
const sections = document.querySelectorAll("main > section");

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-section");
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
    const heading =document.getElementById(id).querySelector("h2");
    if (heading) {
        heading.focus();
    }
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

