const HTMLParser  = require('node-html-parser');

class OsuMatchParser {

    mode;
    matchLinks;

    constructor(mode, mLinks) {
        this.mode = mode;
        this.matchLinks = mLinks;
    }
    async parse() {
        let users = [];
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
                //console.log(result);    
                var root = HTMLParser.parse(result);
                console.log(root.querySelectorAll(".js-react--mp-history"));                


                //getting users of the match
                /*let json = JSON.parse(root.querySelector('#json-events').rawText);
                users = json.users;*/
                
            } catch (e) {
                console.error(e);
            }

        }

    }


}
module.exports = OsuMatchParser;