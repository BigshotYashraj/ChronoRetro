const events = [
{
year: "776 BC",
title: "First Olympic Games",
description: "The first recorded Olympic Games were held in ancient Greece."
},
{
year: "44 BC",
title: "Assassination of Julius Caesar",
description: "Julius Caesar was assassinated on the Ides of March."
},
{
year: "476 AD",
title: "Fall of Western Roman Empire",
description: "The Western Roman Empire collapsed, marking the end of ancient Rome."
},
{
year: "1492",
title: "Columbus Discovers America",
description: "Christopher Columbus reached the Americas."
},
{
year: "1776",
title: "American Independence",
description: "The United States declared independence from Britain."
},
{
year: "1914",
title: "Start of World War 1",
description: "World War 1 began after the assassination of Archduke Franz Ferdinand."
},
{
year: "1939",
title: "Start of World War 2",
description: "Germany invaded Poland, beginning World War 2."
},
{
year: "1969",
title: "Moon Landing",
description: "Neil Armstrong became the first human to step on the Moon."
},
{
year: "1991",
title: "Internet Becomes Public",
description: "The World Wide Web was made publicly available."
},
{
year: "2007",
title: "First iPhone Launch",
description: "Apple released the first iPhone, changing modern technology."
}
];

const list = document.getElementById("event-list");
const viewer = document.getElementById("event-viewer");

events.forEach((e, i) => {
const btn = document.createElement("button");
btn.innerText = `${e.year} - ${e.title}`;
btn.onclick = () => {
viewer.innerHTML = `       <h2>${e.year}</h2>       <h3>${e.title}</h3>       <p>${e.description}</p>
    `;
};
list.appendChild(btn);
});
