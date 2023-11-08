/* eslint-disable max-len */
function standardElement(tagName, id, className, content) {
  return `
    <${tagName} ${id ? `id='${id}'` : ''} ${className ? `class='${className}'` : ''}>
      ${content ? content : ''}
    </${tagName}>`;
}

async function fetchData(path, city) {
  const apiKey = '8b98d04b17cd432097e141056230305';
  const url = `${path}?key=${apiKey}&q=${city}&days=8`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      referrerPolicy: 'no-referrer',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data from Weather API:\n${error.message}`);
    return error.message;
  }
}

async function howIsTheWeather(city, isMetric) {
  try {
    const path = 'https://api.weatherapi.com/v1/forecast.json';
    const data = await fetchData(path, city);
    if (!data.location.name.toLowerCase().includes('airport')) {
      displayResult(data, isMetric);
      refreshBackground(data);
      document.getElementById('cityInput').value = `${data.location.name}, ${data.location.country}`;
    }
  } catch (error) {
    console.error(`Error fetching data from Weather API:\n${error.message}`);
  }
}

async function listCities(listID, value) {
  try {
    const path = 'https://api.weatherapi.com/v1/search.json';
    const data = await fetchData(path, value);
    const citiesList = document.getElementById(listID);
    citiesList.innerHTML = '';
    data.forEach((city) => {
      if (
        !city.name.toLowerCase().includes('airport') &&
        !citiesList.innerHTML.includes(`<option value="${city.name}, ${city.country}">`)
      ) {
        citiesList.insertAdjacentHTML('beforeend', `<option value="${city.name}, ${city.country}">`);
      }
    });
  } catch (error) {
    console.error(`Error fetching data from Search/Autocomplete API:\n${error.message}`);
  }
}

function displayResult(data, isMetric) {
  document.getElementById('contentSection').innerHTML = '';
  document.getElementById('contentMain').innerHTML = '';
  insertMainCellElement(data, isMetric);
  insertForecast(data, isMetric);
  insertCellElement(data, isMetric, [data.current.uv], 'uv', 'UV Index', '');
  insertCellElement(
    data,
    isMetric,
    isMetric ? Math.round(data.current.wind_kph) : Math.round(data.current.wind_mph),
    'wind',
    'Wind',
    isMetric ? ' km/h' : ' mph'
  );
  insertCellElement(
    data,
    isMetric,
    isMetric ? data.current.precip_mm : data.current.precip_in,
    'precip',
    'Precipitation',
    isMetric ? ' mm' : ' in'
  );
  insertCellElement(
    data,
    isMetric,
    isMetric ? Math.round(data.current.feelslike_c) : Math.round(data.current.feelslike_f),
    'feelslike',
    'Feels like',
    isMetric ? '°C' : '°F'
  );
  insertCellElement(data, isMetric, data.current.humidity, 'humidity', 'Humidity', '%');
  insertCellElement(
    data,
    isMetric,
    isMetric ? Math.round(data.current.vis_km) : Math.round(data.current.vis_miles),
    'visibility',
    'Visibility',
    isMetric ? ' km' : ' miles'
  );
  insertCellElement(
    data,
    isMetric,
    isMetric ? Math.round(data.current.pressure_mb) : Math.round(data.current.pressure_in),
    'pressure',
    'Pressure',
    isMetric ? ' mbar' : ' inHg'
  );
  document.querySelectorAll('.unit').forEach((element) => {
    element.addEventListener('click', () => {
      updateMeasurement(data, isMetric);
    });
  });
  console.clear();
}

function insertMainCellElement(data, isMetric) {
  const contentMain = document.getElementById('contentMain');
  contentMain.insertAdjacentHTML('beforeend', standardElement('div', 'mainCellEl'));
  const cellEl = document.getElementById('mainCellEl');
  cellEl.insertAdjacentHTML('beforeend', `<h1>${data.location.name.toString()}</h1>`);
  cellEl.insertAdjacentHTML('beforeend', `<img src='${data.current.condition.icon}'>`);
  cellEl.insertAdjacentHTML(
    'beforeend',
    `<h2 class="unit">${isMetric ? Math.round(data.current.temp_c).toString() : Math.round(data.current.temp_f).toString()
    }${isMetric ? '°C' : '°F'}</h2>`
  );
  cellEl.insertAdjacentHTML(
    'beforeend',
    `<h3 class="unit">${isMetric
      ? Math.round(data.forecast.forecastday[0].day.mintemp_c)
      : Math.round(data.forecast.forecastday[0].day.mintemp_f)
    }${isMetric ? '°C' : '°F'} - ${isMetric
      ? Math.round(data.forecast.forecastday[0].day.maxtemp_c)
      : Math.round(data.forecast.forecastday[0].day.maxtemp_f)
    }${isMetric ? '°C' : '°F'}</h3>`
  );
}

function insertForecast(data, isMetric) {
  const contentMain = document.getElementById('contentMain');
  contentMain.insertAdjacentHTML('beforeend', standardElement('div', 'forecastDiv'));
  const forecastDiv = document.getElementById('forecastDiv');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 1; i < data.forecast.forecastday.length; i++) {
    const currentDay = data.forecast.forecastday[i];
    const currentDate = new Date(currentDay.date);
    forecastDiv.insertAdjacentHTML('beforeend', standardElement('div', `forecast-${i}`, 'forecastCell'));
    const forecastCell = document.getElementById(`forecast-${i}`);
    forecastCell.insertAdjacentHTML('beforeend', `<h2>${days[currentDate.getDay()]}</h2>`);
    forecastCell.insertAdjacentHTML('beforeend', `<img src="${currentDay.day.condition.icon}">`);
    forecastCell.insertAdjacentHTML(
      'beforeend',
      `<h3 class="unit">${isMetric ? Math.round(currentDay.day.maxtemp_c) : Math.round(currentDay.day.maxtemp_f)}${isMetric ? '°C' : '°F'
      }</h3>`
    );
    forecastCell.insertAdjacentHTML(
      'beforeend',
      `<h3 class="unit">${isMetric ? Math.round(currentDay.day.mintemp_c) : Math.round(currentDay.day.mintemp_f)}${isMetric ? '°C' : '°F'
      }</h3>`
    );
  }
}

function insertCellElement(data, isMetric, cellProperty, cellID, cellLabel, unit) {
  const contentSection = document.getElementById('contentSection');
  contentSection.insertAdjacentHTML('beforeend', standardElement('div', cellID, 'cellEl'));
  const cellEl = document.getElementById(cellID);
  cellLabel && cellEl.insertAdjacentHTML('beforeend', `<p>${cellLabel}</p>`);
  cellEl.insertAdjacentHTML('beforeend', `<h2 class="unit">${cellProperty.toString()}${unit}</h2>`);
}

function updateMeasurement(data, isMetric) {
  isMetric = !isMetric;
  displayResult(data, isMetric);
  return isMetric;
}

function refreshBackground(data) {
  const videoElement = document.querySelector('#bgvid');
  if (data.current.is_day === 1 && !data.current.condition.text.includes('rain')) {
    videoElement.querySelector('source').src = './video/clear-day.mp4';
  }
  if (data.current.is_day === 1 && data.current.condition.text.includes('rain')) {
    videoElement.querySelector('source').src = './video/rainy-day.mp4';
  }
  if (data.current.is_day === 0 && !data.current.condition.text.includes('rain')) {
    videoElement.querySelector('source').src = './video/clear-night.mp4';
  }
  if (data.current.is_day === 0 && data.current.condition.text.includes('rain')) {
    videoElement.querySelector('source').src = './video/rainy-night.mp4';
  }
  videoElement.load();
}

function insertCityInput() {
  const header = document.querySelector('header');
  const inputID = 'cityInput';
  const listID = 'citiesList';
  header.insertAdjacentHTML('beforeend', standardElement('input', inputID));
  const cityInput = document.getElementById(inputID);
  cityInput.setAttribute('list', listID);
  cityInput.setAttribute('autocomplete', 'off');
  cityInput.setAttribute('type', 'search');
  cityInput.setAttribute('placeholder', 'Search cities');
  cityInput.insertAdjacentHTML('beforeend', standardElement('datalist', listID));
  cityInput.addEventListener('input', async (event) => {
    const sanitizedInput = event.target.value.replace(/[^a-zA-Z\u00C0-\u00FF\s-]/g, '').substring(0, 30);
    if (sanitizedInput.length >= 2) {
      await listCities(listID, sanitizedInput);
    }
  });

  const isMetric = true;
  cityInput.addEventListener('change', async (event) => {
    const sanitizedInput = event.target.value.replace(/[^a-zA-Z\u00C0-\u00FF\s-]/g, '').substring(0, 30);
    if (sanitizedInput.length >= 2) {
      await howIsTheWeather(sanitizedInput, isMetric);
      await listCities(listID, sanitizedInput);
    }
    cityInput.setAttribute('placeholder', `${event.target.value}`);
    event.target.value = '';
  });
}

function loadHeader(rootEl) {
  const header = document.createElement('header');
  rootEl.insertAdjacentElement('afterbegin', header);
}

function loadEvent() {
  const rootEl = document.getElementById('root');
  loadHeader(rootEl);
  rootEl.insertAdjacentHTML('beforeend', standardElement('section', 'contentMain'));
  rootEl.insertAdjacentHTML('beforeend', standardElement('section', 'contentSection'));
  insertCityInput();
}
window.addEventListener('load', loadEvent);
