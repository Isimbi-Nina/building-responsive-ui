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