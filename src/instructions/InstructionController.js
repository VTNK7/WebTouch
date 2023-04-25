import InstructionScript from './InstructionScript.js'
import Constants from '../Constants.js';

export default class InstructionController {
    account;

    constructor({ account }) {
        this.account = account;
    }

    RunSpecific(specific, args){
        if  (specific === "script") {
            const script = new InstructionScript(this, args.path);
            script.Run();
        }
    }    

    async GetAssetWithId(id) {
        return "not implemented yet";
        var path = `/assets/${this.assetsVersion}/sprites/items/${id}.png`;
        if (fs.existsSync(path)) {
            return path;
        }

        if (!id.toString() in this.items) {
            return null;
        }

        // else download it
        var url = `https://dofustouch.cdn.ankama.com/assets/${this.assetsVersion}_a2hO001Gwuuedc*w00UazwmWzG(EAaNk/gfx/items/${id}.png`;
        // faudra trouver ce que c'est que _a2hO001Gwuuedc*w00UazwmWzG(EAaNk

        await fetch(url)
            .then(response => response.blob())
            .then(blob => {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var contents = event.target.result;
                    fs.writeFile(path, contents, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                };
                reader.readAsDataURL(blob);
            });

        return path;
    }

    GetItemNameWithId(id) {
        return Constants.items[id.toString()];
    }

    GetItemIdWithName(itemName) {
        const item = Object.keys(Constants.items).find(key => Constants.items[key] === itemName);
        if (item) {
            return item;
        }
        // best levenstein distance match
        let bestMatch = null;
        let bestDistance = 9999;

        for (const [key, value] of Object.entries(Constants.items)) {
            const distance = this.Levenstein(value, itemName);
            if (distance < bestDistance) {
                bestMatch = key;
                bestDistance = distance;
            }
        }
        return bestMatch;
    }

    Levenstein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        let matrix = [];

        // increment along the first column of each row
        let i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        let j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    }

}