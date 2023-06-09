class UserMatch {
    user
    scores = []

    constructor(user) {
        this.user = {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url
        }
    }
    getScoresByMods() {
        let scoresByMods = {
            "NF": 0,
            "NFHD": 0,
            "NFHR": 0,
            "NFDT": 0,
        }
        for (let score of this.scores) {
            let strMods;
            if (typeof score.mods === "string") {
                strMods = +score.mods == 1 ? "NF" : +score.mods == 9 ? "NFHD" : +score.mods == 17 ? "NFHR" : +score.mods == 65 ? "NFDT" : ""
            } else {
                strMods = score.mods.reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    ""
                );
            }

            scoresByMods[`${strMods}`] += +score.scoreValue;
        }
        return scoresByMods


    }
    getStaticJson(){
        let tempObj = {};
        tempObj.scoresByMods = this.getScoresByMods();
        tempObj.overalScore = this.scores.reduce(
            (accumulator, score) => accumulator + score.scoreValue,
            0
          );
        for (let key in this) {
            tempObj[key] = this[key];
          }
          return JSON.stringify(tempObj);
    }
}
module.exports = UserMatch;