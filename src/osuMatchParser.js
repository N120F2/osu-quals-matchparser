const HTMLParser = require('node-html-parser');
const UserMatch = require('./userMatch');
class OsuMatchParser {

    mode;
    _mode_exemple = {//clear that
        strictMPool: true,//count only mappool listed maps
    }
    matchLinks;
    mPool;
    allScores = {};

    constructor(mode, mLinks, mPool) {
        this.mode = mode;
        this.matchLinks = mLinks;
        if (mode.strictMPool) {
            if (!mPool) throw new Error();
            this.mPool = mPool;
        } else {
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
                this.matchUsers = matchUsers;
                let matchEventsPlays = matchEvents.filter(function (event) {
                    return event.game !== undefined;
                });
                this.matchEventsPlays = matchEventsPlays;
                //console.log(matchEvents.length)
                //console.log(matchEventsPlays.length)                
                for (let user of matchUsers) {
                    //init obj
                    let userMatch;//= {};
                    let alreadyExisting = false;
                    //check for existing scoring
                    let existingUserMatch = userMatches.find(function (userMatch) {
                        return userMatch.user.id === user.id;
                    });
                    //for existing user match history replace userMatch for existing
                    if (existingUserMatch) {
                        userMatch = existingUserMatch;
                        alreadyExisting = true;                       
                    } else {
                        userMatch = new UserMatch({
                            id: user.id,
                            username: user.username,
                            avatar_url: user.avatar_url
                        });                        
                    };
                    for (let play of matchEventsPlays) {
                        let thisGame = play.game;
                        if (!this.checkBeatmap(thisGame.beatmap_id)) continue;
                        //creating user score
                        let score = {
                            beatmap_id: thisGame.beatmap_id,
                        };
                        let currentUserScore = thisGame.scores.find(function (score) {
                            return score.user_id === userMatch.user.id;
                        });
                        //if user not played this map
                        if (!currentUserScore) continue;
                        score.scoreValue = currentUserScore.score;
                        score.mods = currentUserScore.mods;
                        userMatch.scores.push(score);
                        //creating all scores map
                        if (this.allScores[`${thisGame.beatmap_id}`]) {
                            this.allScores[`${thisGame.beatmap_id}`].push({
                                user_id: user.id,
                                score: currentUserScore.score,
                                mods: score.mods
                            })
                        } else {
                            this.allScores[`${thisGame.beatmap_id}`] = [{
                                user_id: user.id,
                                score: currentUserScore.score,
                                mods: score.mods

                            }]
                        }
                    }
                    if (!alreadyExisting) {
                        userMatches.push(userMatch);
                    }
                }
            } catch (e) {
                console.error(e);
                userMatches = -1
            }
        }       
        return userMatches;
    }
    checkBeatmap(baetmapId) {
        if (this.mode.strictMPool) {
            return this.mPool.includes(baetmapId)
        } else {
            return true
        }
    }    
}
module.exports = OsuMatchParser;