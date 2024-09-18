// const prefs = { hour: '2-digit', minute: '2-digit' };
// let dateContainer = document.querySelector('.local__date');
// let timeContainer = document.querySelector('.local__time');
// const update = () => {
//    const raw = new Date();
//    const date = `${raw.getMonth() + 1}/${raw.getDate()}/${raw.getFullYear()}`;
//    const time = raw.toLocaleTimeString('en-US', prefs).replace(/^0+/, '');
//    dateContainer.innerHTML = date;
//    timeContainer.innerHTML = time;
// }
// update();
// setInterval(update, 1000);


function rotateSteeringWheel(angle) {
   const steeringWheel = document.querySelector('.steering');
   steeringWheel.style.transform = `rotate(${angle * 180}deg)`;
}

// const updateClutch = val => {
//    const clutchContainer = document.querySelector('.clutch__fill');
//    clutchContainer.style.height = `${(1-val)*100}%`;
// }

const updatePedals = (c, b, t, ffb) => {
   const clutchContainer = document.querySelector('.clutch__fill');
   const brakeContainer = document.querySelector('.brake__fill');
   const throttleContainer = document.querySelector('.throttle__fill');
   // const ffbContainer = document.querySelector('.ffb__fill');

   clutchContainer.style.height = `${(1-c)*100}%`;
   brakeContainer.style.height = `${b*100}%`;
   throttleContainer.style.height = `${t*100}%`;
   // ffbContainer.style.height = `${ffb*100}%`;
}

const populateRenderer = data => {
   rotateSteeringWheel(data.steeringAngle);
   updatePedals(data.clutch, data.brake, data.throttle)

   // updateClutch(data.clutch);
}

module.exports = populateRenderer;