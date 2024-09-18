const possibleParameters = ['throttle', 'brake', 'clutch', 'steeringAngle', 'RPM', 'gear'];

async function fetchCSV(file) {
   try {
      const response = await fetch(file);
      if (!response.ok) {
         throw new Error('Network response was not ok ' + response.statusText);
      }
      const csvText = await response.text();
      return csvText;
   } catch (error) {
      console.error('Fetch error: ', error);
      return null;
   }
}

function parseCSV(csvText) {
   const lines = csvText.split('\n');
   const headers = lines[0].split(',');

   const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
         obj[header.trim()] = values[index] ? values[index].trim() : null;
      });
      return obj;
   });
   return data;
}

async function convertCSVToJS(file = 'newData.csv') {
   const csvText = await fetchCSV(file);
   if (!csvText) return [];

   const dataArray = parseCSV(csvText);
   return dataArray;
}

async function getData(xAttr, yAttrs) {
   const dataPoints = await convertCSVToJS();
   if (!dataPoints.length) return [];

   let graph = [];

   dataPoints.forEach(point => {
      let dataPoint = [point[xAttr]];
      yAttrs.forEach(yAttr => {
         dataPoint.push(parseFloat(point[yAttr]) || 0);
      });
      graph.push(dataPoint);
   });

   return graph;
}

let charts = [];
let dataSets = [];

async function plotGraph(yAttrs, chartIndex) {
   const xAttr = 'sessionTime';
   const colors = ['#f49595', '#f9eb97', '#a8d9f6', '#e2bbfd', '#95f5a8', '#f5a895', '#a895f5', '#95f5f5'];

   const data = await getData(xAttr, yAttrs);
   if (!data.length) return;

   const dataSet = anychart.data.set(data);
   dataSets[chartIndex] = dataSet;

   yAttrs.forEach((yAttr, index) => {
      let seriesData = dataSet.mapAs({ x: 0, value: index + 1 });
      let series = charts[chartIndex].line(seriesData);
      series
         .stroke(`3 ${colors[index % colors.length]}`)
         .tooltip()
         .format(`${yAttr} : {%value}`);
   });

}

function createCheckboxes(containerId, chartIndex) {
   const checkboxContainer = document.getElementById(`checkboxContainer${chartIndex + 1}`);
   possibleParameters.forEach(param => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = param;
      checkbox.id = `${param}-${chartIndex}`;

      checkbox.addEventListener('change', () => handleUpdate(chartIndex));

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(param));
      checkboxContainer.appendChild(label);
   });
}

async function handleUpdate(chartIndex) {
   const selectedParams = [];
   possibleParameters.forEach(param => {
      const checkbox = document.getElementById(`${param}-${chartIndex}`);
      if (checkbox.checked) {
         selectedParams.push(param);
      }
   });

   charts[chartIndex].removeAllSeries();

   charts[chartIndex].xZoom().setToPointsCount(1000, false, null);
   await plotGraph(selectedParams, chartIndex);
}

anychart.onDocumentReady(async function () {
   anychart.theme('darkTurquoise');
   const containers = ['container1', 'container2', 'container3', 'container4', 'container5', 'container6', 'container7', 'container8'];
   containers.forEach((containerId, index) => {
      const chart = anychart.line();

      chart.yAxis().title('');
      chart.crosshair().enabled(true).yLabel(false).yStroke(null);
      chart.legend(false);

      if (index === 3 || index === 7) {
         // chart.xScroller(true);
         chart.xAxis().enabled(true);
      } else {
         chart.xAxis().enabled(true); // change to false after testing
      }

      charts.push(chart);
      createCheckboxes(containerId, index);
      chart.container(containerId);
      chart.draw();
   });

   // await plotGraph(['throttle', 'brake'], 0); //plot onload
});

document.addEventListener('DOMContentLoaded', function () {
   const containers = ['container5', 'container6'];
   let scrollTimeout = null;
   let pointsCount = 1000;

   containers.forEach((containerId, index) => {
      const container = document.getElementById(containerId);
      console.log(container);
      container.addEventListener('scroll', function () {
         clearTimeout(scrollTimeout);
         scrollTimeout = setTimeout(() => {
            const scrollLeft = container.scrollLeft;
            containers.forEach((otherContainerId) => {
               if (containerId !== otherContainerId) {
                  document.getElementById(otherContainerId).scrollLeft = scrollLeft;
               }
            });
         }, 10);
      });
   });

   window.addEventListener('wheel', function (event) {
      if (event.deltaY !== 0) {
         pointsCount += event.deltaY > 0 ? -100 : 100;
         if (pointsCount < 100) pointsCount = 100;

         charts.forEach((chart, index) => {
            chart.xZoom().setToPointsCount(pointsCount, false, null);
         });
      }
   });

   // window.addEventListener('wheel', function(event) {
   //    if (event.deltaX !== 0) {
   //      pointsCount += event.deltaX > 0 ? -100 : 100;
   //      if (pointsCount < 100) pointsCount = 100;
    
   //      charts.forEach((chart, index) => {
   //        chart.xZoom().setToPointsCount(pointsCount, false, null);
   //      });
   //    }
   //  });
});
