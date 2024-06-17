const contents = document.querySelector(".contents");
const addBtn = document.querySelector(".addButton");
const day = document.querySelector(".day");
const subject = document.querySelector(".addSubject");
const room = document.querySelector(".room");
const instructor = document.querySelector(".instructor");
const option = document.querySelector(".option");

const toggleMenu = document.querySelector(".toggleMenu");
const menuBtn = document.querySelector(".menuBtn");
const menuIcon = document.querySelector(".menuIcon");

menuBtn.onclick = () => {
  toggleMenu.classList.toggle("toggle");
  toggleIcon();
}
    
function toggleIcon(){
  menuIcon.classList.toggle("fa-xmark");
  menuIcon.classList.toggle("fa-bars");
}

const SHours = document.querySelector(".SHours");
const SMinutes = document.querySelector(".SMinutes");

const EHours = document.querySelector(".EHours");
const EMinutes = document.querySelector(".EMinutes");
const popupBoxContainer = document.querySelector('.popupBoxContainer');
const popupBoxContainer2 = document.querySelector(".popupBoxContainer2");
const popupBoxInfo = document.querySelector('.popupBoxInfo');

const urlPath = window.location.href;
const labelName = urlPath.slice(urlPath.indexOf("/sched/") + 16, urlPath.indexOf("/depart"));
const url = urlPath.slice(0, urlPath.indexOf("/sched/"));
const department = urlPath.slice(urlPath.indexOf("depart") + 7);

document.querySelector('.h3LabelName').innerHTML = `${decodeURI(department)} Schedule <button class="deleteBtn"><i class="fa-solid fa-trash-can"></i></button>`;
document.querySelector(".homeLink").setAttribute("href", url);

let schedule = [];

// this is a callback function executed everytime the site loads
window.onload = () => {
  // fetch and load all schedule data
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
        </tr>`;
      }
    }
    
  })
  .catch(e => {
    alert(`Error boss: ${e}`);
    console.log(e)
  })
}

document.querySelector(".deleteBtn").onclick = async () => {
      document.querySelector(".popupBoxInfo2").innerHTML = `Are you sure you want to delete <span style="color:red">${decodeURI(department)} schedule</span>?`
      popupBoxContainer2.style.display = "block"
    }

function canceldelete(){
  popupBoxContainer2.style.display = "none";
}

async function deleteDepartment(){
  const res = await fetch(`${url}/api/deleteDepartmentSched?label=${labelName}&department=${department}`);
  const data = await res.json();
  
  if(data.success){
    alert(`${decodeURI(department)} is successfully deleted!`)
    window.location.href = `${url}/sched/data/${labelName}`;
  }else{
    alert(`${decodeURI(department)} schedule already deleted!`)
  }
  
  popupBoxContainer2.style.display = "none";
}


// this is a callback function executed only when the addBtn is clicked
addBtn.onclick = async function(){
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
      department: department,
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
      let bwesetSigegERROR = await isConflictSchedule(sched);
      if(bwesetSigegERROR){
        return;
      }else{
        schedule.push(sched);
      }
    }else{
      const isConflict = await isAllSchedConflict(sched);
      if(isConflict){return}
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
    saveScheduleToDatabase(url, labelName, department, schedule);
  }else{
    fillout.style.display = "block";
    return;
  }
  console.log(schedule)
}

// close the popupBoxContainer when click
document.querySelector('.popupButton').onclick = () => {
  document.querySelector('.popupBoxContainer').style.display = "none";
}

// function that checks if the new subject's time and room already exist in the current department schedule.
async function isConflictSchedule(SCHED){
  
  let status = false;
  
  // checks if there's a conflict with the current schedule
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
        SCHED.time.end[0] == 12 && 
        SCHED.time.start[0] >= schedule[i].time.start[0] && 
        SCHED.time.start[0] < schedule[i].time.end[0] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day 
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
    }else if(
        SCHED.time.end[0] == 12 && 
        SCHED.time.start[0] == schedule[i].time.end[0] && 
        SCHED.time.start[1] < schedule[i].time.end[1] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day
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
        schedule[i].time.end[0] == 12 && 
        SCHED.time.end[0] > schedule[i].time.start[0] && 
        SCHED.time.end[0] < schedule[i].time.end[0] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day
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
      
      
    }else if(
        schedule[i].time.end[0] == 12 && 
        SCHED.time.end[0] == schedule[i].time.start[0] && 
        SCHED.time.end[1] > schedule[i].time.start[1] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day 
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
    }else if(
        SCHED.time.end[0] == 12 && 
        schedule[i].time.start[0] > SCHED.time.start[0] && 
        schedule[i].time.start[0] < SCHED.time.end[0] && 
        SCHED.room === schedule[i].room &&
        SCHED.day === schedule[i].day
      ){
      popupBoxContainer.style.display = "block";
      popupBoxInfo.innerHTML = `Conflict Time Range with ${schedule[i].subject} in room ${schedule[i].room} on ${schedule[i].day}`;
      status = true;
      break;
      
      
    }else{
      status = false;
    }
  }
  
  // checks if there's a conflict with all department schedules
  if(!status){
    status = await isAllSchedConflict(SCHED);
  }
    
  return status;
}

// function to send and save the data to the server
async function saveScheduleToDatabase(url, labelName, department, schedule){
  const response = await fetch(`${url}/api/createSchedJSON?label=${labelName}&department=${department}.json&schedjson=${JSON.stringify(schedule)}`);
  const data = await response.json();
  if(data.status == "success"){
    console.log(`Schedule added to the database successfully.`);
  }else{
    alert(`Error: ${decodeURI(department)} Schedule does not exist in the database! Please create a new department schedule and close this one :)`)
  }
}


// function that checks if the new subject's time and room already exist in all department schedules.
async function isAllSchedConflict(SCHED){
  let partialStatus;
  try {
    const response = await fetch(`${url}/api/getDepartmentSchedData?label=${labelName}`);
    const data = await response.json();
    const schedData = data.response;
    
    for (let i = 0; i < schedData.length; i++) {
      for (let x = 0; x < schedData[i].length; x++) {
        // checks if STARTING time and room has conflict 
        if(
            SCHED.time.start[0] >= schedData[i][x].time.start[0] && 
            SCHED.time.start[0] < schedData[i][x].time.end[0] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day &&
            SCHED.timeStatus === schedData[i][x].timeStatus
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
        }else if(
            SCHED.time.end[0] == 12 &&
            SCHED.time.start[0] >= schedData[i][x].time.start[0] && 
            SCHED.time.start[0] < schedData[i][x].time.end[0] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day 
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
          
        }else if(
            SCHED.time.start[0] == schedData[i][x].time.end[0] && 
            SCHED.time.start[1] < schedData[i][x].time.end[1] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day &&
            SCHED.timeStatus === schedData[i][x].timeStatus
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
        
        }else if(
            SCHED.time.end[0] == 12 && 
            SCHED.time.start[0] == schedData[i][x].time.end[0] && 
            SCHED.time.start[1] < schedData[i][x].time.end[1] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Starting time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true; 
          
        // checks if CLOSING time and room has conflict 
        }else if(
            SCHED.time.end[0] > schedData[i][x].time.start[0] && 
            SCHED.time.end[0] < schedData[i][x].time.end[0] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day &&
            SCHED.timeStatus === schedData[i][x].timeStatus
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
        }else if(
            schedData[i][x].time.end[0] = 12 && 
            SCHED.time.end[0] > schedData[i][x].time.start[0] && 
            SCHED.time.end[0] < schedData[i][x].time.end[0] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day 
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
          
        }else if(
            SCHED.time.end[0] == schedData[i][x].time.start[0] && 
            SCHED.time.end[1] > schedData[i][x].time.start[1] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day &&
            SCHED.timeStatus === schedData[i][x].timeStatus
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
          
        }else if(
            schedData[i][x].time.end[0] = 12 && 
            SCHED.time.end[0] == schedData[i][x].time.start[0] && 
            SCHED.time.end[1] > schedData[i][x].time.start[1] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day 
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Closing time with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
          
        // checks if time RANGE and room has conflict 
        }else if(
            schedData[i][x].time.start[0] > SCHED.time.start[0] && 
            schedData[i][x].time.start[0] < SCHED.time.end[0] && 
            SCHED.room === schedData[i][x].room &&
            SCHED.day === schedData[i][x].day &&
            SCHED.timeStatus === schedData[i][x].timeStatus
          ){
          popupBoxContainer.style.display = "block";
          popupBoxInfo.innerHTML = `Conflict Time Range with ${schedData[i][x].subject} in room ${schedData[i][x].room} on ${schedData[i][x].day} in ${schedData[i][x].department} Schedule.`;
          return true;
          
        }else{
          partialStatus = false;
        } 
      }
    }
  } catch (e) {console.log(e)}
  return partialStatus;
}

// download the document file
async function ExportAsDoc(){
  const response = await fetch(`${url}/api/generateDocument?scheduleData=${JSON.stringify(schedule)}&department=${department}`);
  const data = await response.blob();
  console.log(data);
  const link = await window.URL.createObjectURL(new Blob([data]));
  const a = await document.createElement('a');
  a.href = link;
  a.download = `${decodeURI(department)}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
