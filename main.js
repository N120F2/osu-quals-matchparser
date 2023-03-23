const OsuMatchParser = require('./src/osuMatchParser');
require('dotenv').config();

function main(){
    const matchLinks = JSON.parse(process.env.MATCH_LINKS);
    console.log("Math links: " + matchLinks);
    
    console.log("Program started");
    let osuMParser = new OsuMatchParser([], matchLinks);
    osuMParser.parse()
    .then((res)=>{
        console.log(res);
        console.log('Program endeded')
    });

}
main();