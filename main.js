const OsuMatchParser = require('./src/osuMatchParser');
require('dotenv').config();

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
        console.log(JSON.stringify(res,function(key, value){
            if (typeof value === 'UserMatch') {
                return value.getStaticJson();
              }
              return value;
        }));
        console.log('Program endeded')
    });   
    

}
main();