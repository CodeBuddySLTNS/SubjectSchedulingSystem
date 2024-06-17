const fs = require("fs");
const path = require("path");
const { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  WidthType, 
  AlignmentType
} = require("docx");

const getAllScheduleLabels = async (req, res) => {
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if(err){
        res.json({response: "Error."})
      }else{
        res.json({response: folders})
      }
    })
  } catch (e) {console.log(e)}
}

const createScheduleLabel = async (req, res) => {
  try {
    await fs.mkdir(path.join(__dirname, "..", "database", req.query.label.trim()), err => {
      if(err){
        console.log(err);
        res.json({status: "failed"});
        return;
      }else{
        res.json({status: "success"})
      }
    });
  } catch (e) {console.log(e)}
}

const getAllDepartmentSched = async (req, res) => {
  fs.readdir(path.join(__dirname, "..", "database", req.query.label), (err, files) => {
    if(err){
      res.json({response: "Error."});
      return;
    }
    res.json({response: files})
  })
}

const createDepartmentSched = async (req, res) => {
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "database", req.query.label.trim(), `${req.query.department.trim()}.json`))) {
      await fs.writeFileSync(path.join(__dirname, "..", "database", req.query.label.trim(), `${req.query.department.trim()}.json`), "");
      res.json({status: "success"})
    } else {
      console.log("File already exist.")
      res.json({status: "failed"})
    }
  } catch (e) {console.log(e)}
}

const createSchedJSON = async (req, res) => {
  console.log("MY FUTURE LAWYER :)");
  if(!fs.existsSync(path.join(__dirname, "..", "database", req.query.label, req.query.department))){
    return res.json({status: "failed"});
  }
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if (err) {
              console.log("may Error boss", err)
              return;
            }
      for (let i = 0; i < folders.length; i++) {
        if(folders[i] == req.query.label){
          console.log("JOHANNEY")
          fs.readdir(path.join(__dirname, "..", "database",req.query.label), (err, files) => {
            if (err) {
              console.log("may Error boss", err)
              return;
            }
            for (let i = 0; i < files.length; i++) {
              if(files[i] == req.query.department){
                console.log("CRUSHYCAKESS HSHSHS")
                fs.writeFileSync(path.join(__dirname, "..", "database", req.query.label, req.query.department), req.query.schedjson);
                res.json({status: "success"});
              }
            }
          })
        }
      }
    })
  } catch (e) {console.log(`May Error boss hehe ${e}`)}
}

const getScheduleData = async (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "..", "database", req.query.label, req.query.department), "utf8");
    res.json({response: data})
  } catch (e) {console.log(e)}
}

const getDepartmentSchedData = async (req, res) => {
  let departmentData = [];
  try {
    fs.readdir(path.join(__dirname, "..", "database"), (err, folders) => {
      if(err){
        console.log(e);
        return;
      }
      for (let i = 0; i < folders.length; i++) {
        if (folders[i] == req.query.label) {
          fs.readdir(path.join(__dirname, "..", "database", req.query.label), (err, files) => {
            for (let i = 0; i < files.length; i++) {
              const file = fs.readFileSync(path.join(__dirname, "..", "database", req.query.label, files[i]), "utf8");
              if (file != "") {
                departmentData.push(JSON.parse(file));
              }
            }
            
            res.json({response: departmentData})
          })
        }
      }
    })
  } catch (e) {console.log(e);}
}

const generateDocument = async (req, res) => {
  try {
    const tableRow = [
      new TableRow({
              children: [
                  new TableCell({
                    width: {
                      size: 2600,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Subject",
                            bold: true,
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                    ],
                  }),
                  new TableCell({
                    width: {
                          size: 2100,
                          type: WidthType.DXA,
                      },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Time",
                            bold: true,
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                    ],
                  }),
                  new TableCell({
                    width: {
                        size: 1000,
                        type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Room",
                            bold: true,
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                    ],
                  }),
                  new TableCell({
                    width: {
                          size: 1300,
                          type: WidthType.DXA,
                      },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Day",
                            bold: true,
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                    ],
                  }),
                  new TableCell({
                    width: {
                          size: 2200,
                          type: WidthType.DXA,
                      },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Instructor",
                            bold: true,
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                    })
                    ],
                  }),
              ],
          }),
    ];
  
    const schedules = JSON.parse(req.query.scheduleData);
    schedules.map((schedule, index) => {
      const row = new TableRow({
        children: [
            new TableCell({
                width: {
                    size: 2600,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.subject,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 2100,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: `${schedule.time.start[0]}:${schedule.time.start[1] > 0 ? schedule.time.start[1] : String(schedule.time.start[1]) + "0"} - ${schedule.time.end[0]}:${schedule.time.end[1] > 0 ? schedule.time.end[1] : String(schedule.time.end[1]) + "0"} ${schedule.timeStatus}`,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 1000,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.room,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 1300,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.day.slice(0,3),
                        alignment: AlignmentType.CENTER,
                      })],
            }),
            new TableCell({
                width: {
                    size: 2200,
                    type: WidthType.DXA,
                },
                children: [new Paragraph({
                        text: schedule.instructor,
                        alignment: AlignmentType.CENTER,
                      })],
            }),
        ],
      });
      
      tableRow.push(row)
    });
  
    const table = new Table({
        rows: [...tableRow],
    });
  
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `CodeBuddy Solutions\n${req.query.department} Schedule\n`,
                bold: true,
              })
            ],
            alignment: AlignmentType.CENTER,
        }),
        table],
      }]
    });
  
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(path.join(__dirname, "..", "documents", `${req.query.department}.docx`), buffer);
        console.log("success");
        res.sendFile(path.join(__dirname, "..", "documents", `${req.query.department}.docx`), (err) => {
          if (err) {
            console.log(err);
          }
          console.log("File sent!");
        })
    });
  } catch (e) {console.log(e)}
}

const deleteSchedLabel = async (req, res) => {
  if(!fs.existsSync(path.join(__dirname, "..", "database", req.query.label))){
    return res.json({success: false})
  }
  try {
    fs.rmSync(path.join(__dirname, "..", "database", req.query.label), { recursive: true, force: true }, (err) => {});
    console.log(`${req.query.label} is  deleted!`);
    res.json({success: true})
  } catch (e) {
    console.log(`${req.query.label} is not deleted!`);
  }
}
const deleteDepartmentSched = async (req, res) => {
  if(!fs.existsSync(path.join(__dirname, "..", "database", req.query.label, `${req.query.department}.json`))){
    return res.json({success: false})
  }
  
  try {
    fs.unlinkSync(path.join(__dirname, "..", "database", req.query.label, `${req.query.department}.json`))
    return res.json({success: true})
  } catch (e) {console.log(e)}
}

module.exports = {
  getAllScheduleLabels,
  createScheduleLabel,
  getAllDepartmentSched,
  createDepartmentSched,
  createSchedJSON,
  getScheduleData,
  getDepartmentSchedData,
  generateDocument,
  deleteSchedLabel,
  deleteDepartmentSched
};
