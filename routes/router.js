const express = require("express"),
  fs = require("fs"),
  path = require("path"),
  staticSite = express.Router(),
  router = express.Router();

const {
  getAllScheduleLabels,
  createScheduleLabel,
  createDepartmentSched,
  getAllDepartmentSched,
  createSchedJSON,
  getScheduleData,
  getDepartmentSchedData,
  generateDocument,
  deleteSchedLabel,
  deleteDepartmentSched
} = require("../api/getSchedules");

staticSite.get('/data/:label', async (req, res) => {
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if(folders.includes(req.params.label)){
        res.sendFile(path.join(__dirname, "..", "views", "addDepartment.html"));
        return;
      }
      res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
    })
  } catch (e) {console.log(e)}
});

staticSite.get("/addsched/:label/depart/:department", async (req, res) => {
  let labelFolders, depFiles;
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if(folders.includes(req.params.label)){
        fs.readdir(path.join(__dirname, "..", "database", req.params.label), (err, files) => {
          if(files.includes(`${req.params.department}.json`)){
            res.sendFile(path.join(__dirname, "..", "views", "addSchedule.html"));
          }else{
            res.sendFile(path.join(__dirname, "..", "views", "404.html"));
          }
        })
      }else{
        res.sendFile(path.join(__dirname, "..", "views", "404.html"));
      }
    })
  } catch (e) {console.log(e)}
});

// api requests
router.get("/getAllSchedLabel", getAllScheduleLabels);

router.get("/createSchedLabel", createScheduleLabel);

router.get("/getAllDepartmentSched", getAllDepartmentSched);

router.get("/createDepartmentSched", createDepartmentSched);

router.get("/createSchedJSON", createSchedJSON);

router.get("/getScheduleData", getScheduleData);

router.get("/getDepartmentSchedData", getDepartmentSchedData);

router.get("/generateDocument", generateDocument);

router.get("/deleteSchedLabel", deleteSchedLabel);

router.get("/deleteDepartmentSched", deleteDepartmentSched);

module.exports = {
  router,
  staticSite
};