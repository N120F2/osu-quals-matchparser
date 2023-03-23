const OsuMatchParser = require('./src/osuMatchParser');
require('dotenv').config();

function main(){
    const matchLinks = JSON.parse(process.env.MATCH_LINKS); 
    const mappool = JSON.parse(process.env.MAPPOOL);   
    console.log("Math links: " + matchLinks);

    console.log("Program started");
    let osuMParser = new OsuMatchParser({strictMPool: true}, matchLinks, mappool);
    osuMParser.parse()
    .then((res)=>{
        //console.log(res[0].scores); 
        console.log(osuMParser.allScores);     
        console.log('Program endeded')
    });   
    

}
main();