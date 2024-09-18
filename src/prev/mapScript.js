let scatterChart;

async function fetchAndParseCSV() {
   const csvFilePath = 'newData.csv';
   const response = await fetch(csvFilePath);
   const text = await response.text();
   const rows = text.trim().split('\n');
   const headers = rows[0].split(',');
   const data = [];
   for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
         obj[headers[j].trim()] = isNaN(values[j]) ? values[j].trim() : parseFloat(values[j]);
      }
      data.push(obj);
   }
   return data;
}

// async function loadData(lap, param) { //this is for forza
async function loadData() {
   try {
      const data = await fetchAndParseCSV();
      return data;
      // const filteredData = data.filter(item => item[param] == lap); // for laps, configured for forza
      // return filteredData;
   } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
   }
}

function getPlasmaColor(value, min, max) {
   let plasmaColors = [
      "#0d0887", "#22088e", "#320597", "#44039c", "#5601a4", "#6a00a8",
      "#7d00a8", "#91009b", "#a7008c", "#ba0177", "#c82f64", "#d8474b",
      "#e8603a", "#f18232", "#f7972f", "#fbb832", "#fdd83b", "#fcf224", "#f0f921"
   ];
   // plasmaColors.reverse();
   const index = Math.round((value - min) / (max - min) * (plasmaColors.length - 1));
   return plasmaColors[index];
}

function timeToMilliseconds(time) {
   const [minutes, seconds, milliseconds] = time.split(':').map(Number);
   return (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
}

function darkenHexColor(hex, percent) {
   // Remove the '#' if it's there
   hex = hex.replace(/^#/, '');

   // Parse the hex color
   let r = parseInt(hex.substring(0, 2), 16);
   let g = parseInt(hex.substring(2, 4), 16);
   let b = parseInt(hex.substring(4, 6), 16);

   r = Math.max(0, Math.min(255, r - Math.round(r * percent / 100)));
   g = Math.max(0, Math.min(255, g - Math.round(g * percent / 100)));
   b = Math.max(0, Math.min(255, b - Math.round(b * percent / 100)));

   return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function createLegend(min, max, colorProperty) {
   const mid1 = min + (max - min) / 3;
   const mid2 = min + 2 * (max - min) / 3;

   document.getElementById('min-value').innerText = min.toFixed(2);
   document.getElementById('mid-value1').innerText = mid1.toFixed(2);
   document.getElementById('mid-value2').innerText = mid2.toFixed(2);
   document.getElementById('max-value').innerText = max.toFixed(2);
   document.getElementById('legend-label').innerText = colorProperty;
}

async function highlight(time, colorProperty) {
   const hoverPoints = 100;
   const darkenPercent = 45;

   const data = await loadData();
   const values = data.map(item => item[colorProperty]);
   const min = Math.min(...values);
   const max = Math.max(...values);
   let initial = data.map(item => getPlasmaColor(item[colorProperty], min, max));
   let final = [];
   let radii = [];
   for (let i = 0; i < initial.length; i++) {
      if (data[i].currentTime == time) {
         let j = i - hoverPoints / 2;
         if (j < 0) j = 0;
         for (j; j < i + hoverPoints / 2 + 1; j++)
            final.push(initial[i]);
            radii.push(10);
      }
      final.push(darkenHexColor(initial[i], darkenPercent));
      radii.push(3);
   }
   createScatterPlot(data, 'coordinatesX', 'coordinatesZ', final, radii);
}

function createScatterPlot(data, xAxis, yAxis, colorProperty, pointRadii) {
   if (pointRadii == undefined) {
      pointRadii = [];
      for (let i = 0; i < data.length; i++)
         pointRadii.push(3);
   }
   const ctx = document.getElementById('scatterChart').getContext('2d');
   const scatterData = data.map(item => ({ x: item[xAxis], y: item[yAxis] }));
   const values = data.map(item => item[colorProperty]);
   const min = Math.min(...values);
   const max = Math.max(...values);
   let pointColors = colorProperty;
   if (typeof (colorProperty) == 'string') {
      pointColors = data.map(item => getPlasmaColor(item[colorProperty], min, max));
      createLegend(min, max, colorProperty);
   }

   if (scatterChart) {
      scatterChart.data.datasets[0].data = scatterData;
      scatterChart.data.datasets[0].pointBackgroundColor = pointColors;
      scatterChart.update();
   } else {
      scatterChart = new Chart(ctx, {
         type: 'scatter',
         data: {
            datasets: [{
               label: '',
               data: scatterData,
               // borderColor: pointColors, // u can take this out to increase performance
               backgroundColor: 'rgba(75, 192, 192, 0.2)',
               pointBackgroundColor: pointColors,
               pointRadius: pointRadii,
               fill: false
            }]
         },
         options: {
            scales: {
               x: { display: false },
               y: { display: false }
            }
         },
      });
   }
}

async function updateChart(xAxis, yAxis, colorProperty) {
   const data = await loadData();
   if (data && data.length > 0) {
      createScatterPlot(data, xAxis, yAxis, colorProperty);
   } else {
      console.log('No data found for the specified lap and parameter.');
   }
}

//to start graph, the interval starts after the interval time
loadData(0, 'raceLap').then(arr => {
   if (arr && arr.length > 0) {
      // createScatterPlot(arr, 'carPositionX', 'carPositionZ', 'carSpeed'); // for forza
      createScatterPlot(arr, 'coordinatesX', 'coordinatesZ', 'speedKMH');
      setTimeout(() => { //set timeout for testing purposes, you dont need it
         highlight('0:11:676', 'speedKMH');
      }, 2000);

   } else {
      console.log('No data found for the specified lap and parameter.');
   }
});

// setInterval(() => {
//    updateChart('coordinatesX', 'coordinatesZ', 'speedKMH');
// }, 100); 
