const HTMLParser = require('node-html-parser');
const UserMatch = require('./userMatch');
class OsuMatchParser {

    mode;
    _mode_exemple = {//clear that
        strictMPool: true,//count only mappool listed maps
        apiV1Key: "some_key"
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

        if (this.mode.apiV1Key) {
            console.log("API MODE")
            return await this.parseWithApi();
        } else {
            console.log("LINK MODE")
            return await this.parseDefault();
        }
    }
    async parseDefault() {
        let userMatches = [];
        for (let link of this.matchLinks) {
            try {
                const response = await fetch(link, {
                    method: 'GET',
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
    async parseWithApi() {
        let userMatches = [];
        for (let link of this.matchLinks) {
            let matchID = link.split("/")[5]
            try {
                const response = await fetch(`https://osu.ppy.sh/api/get_match?k=${this.mode.apiV1Key}&mp=${matchID}`, {
                    method: 'GET',
                });
                if (!response.ok) {
                    throw new Error("HTTP status " + response.status);
                }
                const result = await response.json();
                let matchGames = result.games;
                for (let game of matchGames) {                  
                    if (!this.checkBeatmap(+game.beatmap_id)) continue;
                    for (let score1 of game.scores) {                     
                        let score = {
                            beatmap_id: game.beatmap_id,
                            mods: game.mods,
                            scoreValue: score1.score
                        };
                        //console.log(score)
                        let user = userMatches.find(function (match) {                        
                            return match.user.id === score1.user_id;
                        })
                        //console.log(user)
                        if (user) {                        
                            //existing user
                            user.scores.push(score);
                        } else {                          
                            user = new UserMatch({
                                id: score1.user_id,
                                username: undefined,
                                avatar_url: undefined,                               
                            });
                            user.scores.push(score);
                            userMatches.push(user);
                        }
                        //creating all scores map
                        if (this.allScores[`${game.beatmap_id}`]) {
                            this.allScores[`${game.beatmap_id}`].push({
                                user_id: score1.user_id,
                                score: score1.score,
                                mods: game.mods
                            })
                        } else {
                            this.allScores[`${game.beatmap_id}`] = [{
                                user_id: score1.user_id,
                                score: score1.score,
                                mods: game.mods

                            }]
                        }
                        

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