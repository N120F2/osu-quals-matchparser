const OsuMatchParser = require('./src/osuMatchParser');

function main(){
    const matchLinks = [];
    console.log("Program started");
    let osuMParser = new OsuMatchParser([], matchLinks);
    osuMParser.parse().then((res)=>{
        console.log('endeded')
    });

}
main();