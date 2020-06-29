class Phrase{
    /**
     * 
     * @param {String} value 
     */
    constructor(value){
        this.value = value;
    }
    inject(replacments){
        let injected = phrase;
        for (let i = 0; i < replacments.length; i++) {
            const arg = replacments[i];
            injected = injected.replace('{'+i+'}', arg);
        }
        return injected;
    }
}
class LanguagePack{
    constructor(phrases = {}){
        this.phrases = phrases;
    }
}
