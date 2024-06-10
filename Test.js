const urlPath = "https://subject-scheduling-system.onrender.com/sched/data/2nd%20semester%20-%20PAC%20Salug%20Campus/depart/BSCS1";

const labelName = urlPath.slice(urlPath.indexOf("sched", urlPath.indexOf("sched") + 1) + 15, urlPath.indexOf("/depart"));
const url = urlPath.slice(0, urlPath.indexOf("sched", urlPath.indexOf("sched") + 1) - 1);
const department = urlPath.slice(urlPath.indexOf("depart") + 7);

console.log(url);