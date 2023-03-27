const OsuMatchParser = require('./src/osuMatchParser');
require('dotenv').config();
const UserMatch = require('./src/userMatch');
const fs = require('fs');

function main(){
    const matchLinks = JSON.parse(process.env.MATCH_LINKS); 
    const mappool = JSON.parse(process.env.MAPPOOL);   
    console.log("Math links: " + matchLinks);

    console.log("Program started");
    let osuMParser = new OsuMatchParser({strictMPool: true, apiV1Key:false}, matchLinks, mappool);
    osuMParser.parse()
    .then((res)=>{
        console.log(res);       
        //getting json array of yser matches
        let writeContent = JSON.stringify(res,function(key, value){
           
            if (typeof value === 'object' && value instanceof UserMatch)  {               
                return value.getStaticJson();
              }
              return value;
        });
        console.log(writeContent); 
        fs.writeFile('qualsResults.json', writeContent, err => {
            if (err) {
              console.error(err);
            }            
          });
        console.log('Program endeded')
    });   
    

}
main();