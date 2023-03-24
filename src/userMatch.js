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
            let strMods = score.mods.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                ""
            );
            scoresByMods[`${strMods}`] += score.scoreValue;
        }
        return scoresByMods


    }
}
module.exports = UserMatch;