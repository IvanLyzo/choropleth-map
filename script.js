let noColor = "#ff0000";
let fullColor = "#00ff00";

const maxGDP = 63577;
const countries = ["us", "cn", "gb", "de", "fr", "ru", "jp", "ca", "au", "br"];

let jsonData;
let year = 4;

window.onload = function init()
{
    fetch('./data.json')
        .then((response) => response.json())
        .then((json) =>
        {
            jsonData = json;

            for (let i = 0; i < countries.length; i++)
            {
                let country = document.getElementById(countries[i]);

                country.classList.add("chosen_countries");
                country.onmouseenter = () => { showDetails(country); };
                country.onmouseleave = () => { hideDetails(); };
            }

            updateCountries(year);
            document.getElementById("yearRange").oninput = function ()
            {
                year = this.value;
                updateCountries();
            }

            document.body.onmousemove = function ()
            {
                let menu = document.getElementById("info_panel");
                menu.style.top = event.clientY + "px";
                menu.style.left = (event.clientX + 20) + "px";
            }

            setColor();
            setTables();
        });
}

function updateCountries()
{
    for (let i = 0; i < countries.length; i++)
    {
        let gdp = getGDP(i, year);
        let color = interpolate(noColor, fullColor, Math.max(0, gdp / maxGDP));

        let country = document.getElementById(countries[i]);
        country.style.fill = color;
    }
}

function setColor()
{
    noColor = document.getElementById("noColor").value;
    fullColor = document.getElementById("fullColor").value;

    for (let i = 1; i <= 4; i++)
    {
        let color = document.getElementById("color-" + i);
        let percent = i * 0.2;

        color.value = interpolate(noColor, fullColor, percent);
    }

    updateCountries();
}

function setTables()
{
    let popBody = document.getElementById("pop-body");
    popBody.replaceChildren();

    for (let country = 0; country < countries.length; country++)
    {
        let tr = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.textContent = getName(country);
        tr.appendChild(nameCell);

        for (let yIndex = 0; yIndex < 5; yIndex++)
        {
            let td = document.createElement("td");
            let curr = getPop(country, yIndex);

            td.textContent = curr.toLocaleString("en-US");
            td.style.backgroundColor = fullColor;

            if (yIndex > 0)
            {
                let last = getPop(country, yIndex - 1);
                if (curr < last) td.style.backgroundColor = noColor;
            }

            tr.appendChild(td);
        }

        popBody.appendChild(tr);
    }

    let gdpBody = document.getElementById("gdp-body");
    gdpBody.replaceChildren();

    for (let country = 0; country < countries.length; country++)
    {
        let tr = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.textContent = getName(country);
        tr.appendChild(nameCell);

        for (let yIndex = 0; yIndex < 5; yIndex++)
        {
            let td = document.createElement("td");
            let curr = getGDP(country, yIndex);

            td.textContent = "$" + curr.toLocaleString("en-US");
            td.style.backgroundColor = fullColor;

            if (yIndex > 0)
            {
                let last = getGDP(country, yIndex - 1);
                if (curr < last) td.style.backgroundColor = noColor;
            }

            tr.appendChild(td);
        }

        gdpBody.appendChild(tr);
    }
}

function showDetails(country)
{
    let pop = getPop(countries.indexOf(country.id), year);
    let gdp = getGDP(countries.indexOf(country.id), year);

    let deltaPop = Math.round((pop / getPop(countries.indexOf(country.id), year - 1) - 1) * 100) / 100;
    let deltaGDP = Math.round((gdp / getGDP(countries.indexOf(country.id), year - 1) - 1) * 100) / 100;
    if (year == 0)
    {
        deltaPop = 0;
        deltaGDP = 0;
    };

    if (deltaPop > 0) deltaPop = "+" + deltaPop;
    if (deltaGDP > 0) deltaGDP = "+" + deltaGDP;

    document.getElementById("pop").innerHTML = "Population: " + pop.toLocaleString("en-US") + " ( " + deltaPop + "%)";
    document.getElementById("gdp").innerHTML = "GDP (PPP) per capita: $" + gdp.toLocaleString("en-US") + " (" + deltaGDP + "%)";
    document.getElementById("name").innerHTML = getName(countries.indexOf(country.id));

    let menu = document.getElementById("info_panel");
    menu.style.display = "block";
}

function hideDetails()
{
    document.getElementById("info_panel").style.display = "none";
}

function getPop(index, yIndex)
{
    let data = jsonData.countries[index].pop[yIndex];
    return data;
}

function getGDP(index, yIndex)
{
    let data = jsonData.countries[index].gdp[yIndex];
    return data;
}

function getName(index)
{
    let data = jsonData.countries[index].name;
    return data;
}

function interpolate(color1, color2, percent)
{
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}