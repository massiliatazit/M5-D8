const { writeJson, readJson } = require("fs-extra");
const { join } = require("path");
const attendeesPath = join(__dirname, "./services/attandees/attendees.json");

const readDB = async (filePath) => {
  try {
    const FileJson = await readJson(filePath);
    return FileJson;
  } catch (err) {
    console.log(err);
  }
};
 const writeDB = async(filePath,filecontent) =>{

    try{
        const writeonJson = await writeJson(filePath,filecontent)
        return writeonJson


    }catch(err){
        console.log(err)
    }
 }
 module.exports={
     getattendees : async (filePath)=>readDB(filePath),
     writeattendees : async (filePath,filecontent)=>writeDB(filePath,filecontent)
 }