const urlPath = "http://localhost:3500/sched/data/CodeBuddy%201st%20Semester";
const labelName = urlPath.slice(urlPath.indexOf("/sched/") + 12);

const url = urlPath.slice(0, urlPath.indexOf("/sched/"));
// const department = urlPath.slice(urlPath.indexOf("depart") + 7);

console.log(url);
console.log(labelName);
// console.log(department);