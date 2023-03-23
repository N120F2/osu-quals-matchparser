const HTMLParser = require('node-html-parser');

class OsuMatchParser {

    mode;
    matchLinks;

    constructor(mode, mLinks) {
        this.mode = mode;
        this.matchLinks = mLinks;
    }
    async parse() {
        for (let link of this.matchLinks) {
            let userMatches = -1;
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
                userMatches = []
                for (let user of matchUsers) {
                    let userMatch = {
                        user: {},
                        scores: []
                    };
                    userMatch.user = {
                        id: user.id,
                        username: user.username,
                        avatar_url: user.avatar_url
                    }
                    for (let play of matchEventsPlays) {
                        let thisGame = play.game;
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
                    userMatches.push(userMatch);
                }
                //console.log(userMatches[0].scores);

            } catch (e) {
                console.error(e);
            }
            return userMatches

        }

    }


}
module.exports = OsuMatchParser;