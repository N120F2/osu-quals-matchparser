const HTMLParser = require('node-html-parser');

class OsuMatchParser {

    mode;
    _mode_exemple = {//clear that
        strictMPool: true,//count only mappool listed maps
    }
    matchLinks;
    mPool;

    constructor(mode, mLinks, mPool) {
        this.mode = mode;
        this.matchLinks = mLinks;
        if(mode.strictMPool){
            if(!mPool) throw new Error();
            this.mPool = mPool;
        }else{
            this.mPool = undefined
        }
    }
    async parse() {
        let userMatches = [];
        for (let link of this.matchLinks) {
            try {
                const response = await fetch(link, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/html;charset=utf-8'
                    },
                });
                if (!response.ok) {
                    throw new Error("HTTP status " + response.status);
                }
                const result = await response.text();
                //parse match page 
                var root = HTMLParser.parse(result);
                let matchData = JSON.parse(root.querySelector('#json-events').rawText);
                const matchEvents = matchData.events;//array
                const matchUsers = matchData.users;//array

                let matchEventsPlays = matchEvents.filter(function (event) {
                    return event.game !== undefined;
                });
                //console.log(matchEvents.length)
                //console.log(matchEventsPlays.length)                
                for (let user of matchUsers) { 
                    //init obj
                    let userMatch = {};  
                    let alreadyExisting=false;                   
                    //check for existing scoring
                    let existingUserMatch = userMatches.find(function (userMatch) {
                        return userMatch.user.id === user.id;
                    });                    
                    //for existing user match history replace userMatch for existing
                    if(existingUserMatch){
                        userMatch = existingUserMatch;
                        alreadyExisting = true;
                        console.log("existing user")
                    }else{
                        userMatch = {
                            user: {},
                            scores: []
                        };
                        userMatch.user = {
                            id: user.id,
                            username: user.username,
                            avatar_url: user.avatar_url
                        }
                    };
                    for (let play of matchEventsPlays) {
                        let thisGame = play.game;                        
                        if (!this.checkBeatmap(thisGame.beatmap_id)) continue;
                        let score = {
                            beatmap_id: thisGame.beatmap_id,
                        };
                        let currentUserScore = thisGame.scores.filter(function (score) {
                            return score.user_id === userMatch.user.id;
                        })[0];
                        score.scoreValue = currentUserScore.score;
                        score.mods = currentUserScore.mods;
                        userMatch.scores.push(score);
                    }
                    if(!alreadyExisting){                       
                        userMatches.push(userMatch);
                    }                    
                }
                //console.log(userMatches[0].scores);

            } catch (e) {
                console.error(e);
                userMatches = -1
            }  
        }        
        return userMatches
    }
    checkBeatmap(baetmapId){
        if(this.mode.strictMPool ){
            return this.mPool.includes(baetmapId)         
        }else{
            return true
        }
    }
    utils = {

    }



}
module.exports = OsuMatchParser;