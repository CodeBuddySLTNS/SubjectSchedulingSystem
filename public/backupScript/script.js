const contents = document.querySelector(".contents");
const addBtn = document.querySelector(".addBtn");
const saveBtn = document.querySelector(".saveBtn");
const day = document.querySelector(".day");
const subject = document.querySelector(".addSubject");
const room = document.querySelector(".room");
const instructor = document.querySelector(".instructor");
const option = document.querySelector(".option");

const SHours = document.querySelector(".SHours");
const SMinutes = document.querySelector(".SMinutes");

const EHours = document.querySelector(".EHours");
const EMinutes = document.querySelector(".EMinutes");

const urlPath = window.location.href;
const labelName = urlPath.slice(urlPath.indexOf("sched") + 15, urlPath.indexOf("/depart"));
const department = urlPath.slice(urlPath.indexOf("depart") + 7);
const url = urlPath.slice(0, urlPath.indexOf("sched") - 1);

document.querySelector('.h3LabelName').innerText = `${department} Schedule`;

let schedule = [];

// fetch and load all schedule data
window.onload = () => {
  fetch(`${url}/api/getScheduleData?label=${labelName}&department=${department}.json`)
  .then(res => res.json())
  .then(data => {
    try {
      schedule = JSON.parse(data.response);
    } catch (e) {schedule = [];}
    if (schedule.length > 0) {
      document.querySelector('.nodata').style.display = "none";
      for (let i = 0; i < schedule.length; i++) {
        contents.innerHTML += `
        <tr>
          <td>${schedule[i].subject}</td>
          <td>
            ${schedule[i].time.start[0]}:${schedule[i].time.start[1] > 0 ? schedule[i].time.start[1] : String(schedule[i].time.start[1]) + "0"} - ${schedule[i].time.end[0]}:${schedule[i].time.end[1] > 0 ? schedule[i].time.end[1] : String(schedule[i].time.end[1]) + "0"} ${schedule[i].timeStatus}
          </td>
          <td>${schedule[i].room}</td>
          <td>${schedule[i].day.slice(0, 3)}</td>
          <td>${schedule[i].instructor}</td>
        </tr>
      `;
    }
    }
    
  })
  .catch(e => {
    alert(`Error boss: ${e}`);
    console.log(e)
  })
}

// this is a callback function executed only when the addBtn is clicked
addBtn.onclick = () => {
  const input = document.querySelectorAll('input');
  const fillout = document.querySelector('.fillout');
  
  // creates an array loop, used to identify if all the input fields are filled.
  let inputStatus = [];
  
  if(day.value == ""){
    inputStatus.push(false);
  }
  
  for(let i = 0; i < input.length; i++){
    if(input[i].value !== ""){
      inputStatus.push(true);
    }else{
      inputStatus.push(false);
    }
  }
  
  
  // checks if all the inputs are filled
  if(!inputStatus.includes(false)){
    let sched = {
      subject: subject.value,
      time: {
        start: [Number(SHours.value), Number(SMinutes.value)],
        end: [Number(EHours.value), Number(EMinutes.value)]
      },
      timeStatus: option.value,
      day: day.value,
      room: room.value.trim(),
      instructor: instructor.value
    }
    
    // checks if end time is greater than start time
    if(sched.time.start[0] >= sched.time.end[0]){
      document.querySelector('.popupBoxContainer').style.display = "block";
      document.querySelector('.popupBoxInfo').innerHTML = `Closing time should be greater than Starting time.`;
      return;
    }
    
    // checks if there is a conflict schedule using isConflictSchedule function.
    if(schedule.length > 0){ 
      if(isConflictSchedule(sched)){
        return;
      }else{
        schedule.push(sched);
      }
    }else{
      schedule.push(sched);
    }
    
    document.querySelector('.nodata').style.display = "none";
    contents.innerHTML += `
      <tr>
        <td>${subject.value}</td>
        <td>
          ${SHours.value}:${SMinutes.value} - ${EHours.value}:${EMinutes.value} ${option.value}
        </td>
        <td>${room.value}</td>
        <td>${day.value.slice(0,3)}</td>
        <td>${instructor.value}</td>
      </tr>
    `;
    
    subject.value = "";
    instructor.value = "";
    room.value = "";
    SHours.value = "";
    SMinutes.value = "";
    EHours.value = "";
    EMinutes.value = "";
    fillout.style.display = "none";
  }else{
    fillout.style.display = "block";
    return;
  }
  console.log(schedule)
}

// this is a callback function executed only when the saveBtn is clicked
saveBtn.onclick = () => {
  saveScheduleToDatabase(url, labelName, department, schedule);
}

// close the popupBoxContainer when click
document.querySelector('.popupButton').onclick = () => {
  document.querySelector('.popupBoxContainer').style.display = "none";
}

// function that checks if the new subject's time and room already exist.
function isConflictSchedule(SCHED){
  const popupBoxContainer = document.querySelector('.popupBoxContainer');
  const popupBoxInfo = document.querySelector('.popupBoxInfo');
  
  let status = null;
  
  for(let i = 0; i < schedule.length;i++){
    // checks if STARTING time and room has conflict 
    if(
        SCHED.time.start[0] >= schedule[i].time.start[0] && 
        SCHED.time.start[0] < schedule[i].time.end[0] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day &&
        SCHED.timeStatus === schedule[i].timeStatus
      ){
      popupBoxContainer.style.display = "block";
      popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day}`;
      status = true;
      break;
    }else if(
        SCHED.time.start[0] == schedule[i].time.end[0] && 
        SCHED.time.start[1] < schedule[i].time.end[1] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day &&
        SCHED.timeStatus === schedule[i].timeStatus
      ){
      popupBoxContainer.style.display = "block";
      popupBoxInfo.innerHTML = `Conflict Starting time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day}`;
      status = true;
      break;
      
      
    // checks if CLOSING time and room has conflict 
    }else if(
        SCHED.time.end[0] > schedule[i].time.start[0] && 
        SCHED.time.end[0] < schedule[i].time.end[0] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day &&
        SCHED.timeStatus === schedule[i].timeStatus
      ){
      popupBoxContainer.style.display = "block";
      popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day}`;
      status = true;
      break;
    }else if(
        SCHED.time.end[0] == schedule[i].time.start[0] && 
        SCHED.time.end[1] > schedule[i].time.start[1] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day &&
        SCHED.timeStatus === schedule[i].timeStatus
      ){
      popupBoxContainer.style.display = "block";
      popupBoxInfo.innerHTML = `Conflict Closing time with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day}`;
      status = true;
      break;
      
    // checks if time RANGE and room has conflict 
    }else if(
        schedule[i].time.start[0] > SCHED.time.start[0] && 
        schedule[i].time.start[0] < SCHED.time.end[0] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day &&
        SCHED.timeStatus === schedule[i].timeStatus
      ){
      popupBoxContainer.style.display = "block";
      popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day}`;
      status = true;
      break;
      
      
    }else{
      status = false;
    }
  }
  
  return status;
}


// function to send and save the data to the server
function saveScheduleToDatabase(url, labelName, department, schedule){
  fetch(`${url}/api/createSchedJSON?label=${labelName}&department=${department}.json&schedjson=${JSON.stringify(schedule)}`)
  .then(res => res.json())
  .then(d => alert(d.status))
  .catch(e => alert(e))
}

// function to check if there's a conflict with all schedules
function isConflictAllSchedule(){
  fetch(`${url}/api/getDepartmentSchedData?label=${labelName}`)
    .then(res => res.json())
    .then(data => {
      const schedData = data.response;
      for (let i = 0; i < schedData.length; i++) {
        for (let x = 0; x < schedData[i].length; x++) {
          document.querySelector('.demo').innerHTML += `<h3>${schedData[i][x].subject}\t ${schedData[i][x].time.start[0]} - ${schedData[i][x].time.start[1]} : ${schedData[i][x].time.end[0]} - ${schedData[i][x].time.end[1]} Room ${schedData[i][x].room} Day ${schedData[i][x].day}</h3>`;
        }
      }
    })
    .catch(e => alert(`Error bosssss ${e}`))
}
isConflictAllSchedule()