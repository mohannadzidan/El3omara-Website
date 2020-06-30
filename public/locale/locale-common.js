

class Phrase {
    /**
     * 
     * @param {String} value 
     */
    constructor(value) {
        this.value = value;
    }
    inject(replacments) {
        let injected = this.value;
        for (let i = 0; i < replacments.length; i++) {
            const arg = replacments[i];
            injected = injected.replace(new RegExp(`\\{${i}\\}`, 'g'), arg);
        }
        return injected;
    }
}
var LocaleStrings = {
    langCode: 'en',
    /**
     * @type {Phrase[]}
     */
    phrases: [],
    monthNames: [],
    numbers: [],
    abbreviations: {},
    getLocaleString: function (key) {
        if (!LocaleStrings.phrases[key]) throw `The language pack doesn't define (${key})!.`;
        if (arguments.length > 1) {
            let args = Array.from(arguments);
            return LocaleStrings.phrases[key].inject(args.slice(1, args.length));
        }
        return LocaleStrings.phrases[key].value;
    },
    replaceLocaleNumbers: function (str) {

        for (let i = 0; i < 10; i++) {
            str = str.replace(new RegExp(i.toString(), 'g'), this.numbers[i]);
        }
        return str;
    },
    replaceLocaleStringMatches: (str) => {
        let matches = str.matchAll(/\$localeString{(?<target>[aA1-zZ9\s,]+)}/g);
        for (const match of matches) {
            let target = match.groups.target.replace(/\s+/g, '');
            let args = target.split(',');
            str = str.replace(match[0], LocaleStrings.getLocaleString.apply(this, args));
        }
        return str;
    },
    setLanguage: (langCode) => {
        window.localStorage.setItem('lang-code', langCode);
        window.location = window.location;
    },
    formatDate: (timestamp) => {
        var date = new Date(timestamp);
        var a = `${LocaleStrings.monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
        return LocaleStrings.replaceLocaleNumbers(a);
    },
    formatTime: (timestamp) => {
        var date = new Date(timestamp);
        var hours = date.getUTCHours();
        var minutes = date.getUTCMinutes().toString();
        if (minutes.length == 1) minutes = '0' + minutes;
        var PMoAM = hours % 12 == 0 ? LocaleStrings.abbreviations.am : LocaleStrings.abbreviations.pm;
        hours = (hours % 12).toString();
        if (hours.length == 1) hours = '0' + hours;
        let time = `${hours}:${minutes}${PMoAM}`;
        return LocaleStrings.replaceLocaleNumbers(time);
    },
    addOnReadyListener: (callback) => {
        if (LocaleStrings.ready) {
            callback();
        } else {
            if (!LocaleStrings.onReadyCallbacks) LocaleStrings.onReadyCallbacks = [];
            LocaleStrings.onReadyCallbacks.push(callback);
        }
    }
}
// read language code
{
    let langCode = window.localStorage.getItem('lang-code');
    if (langCode) {
        LocaleStrings.langCode = langCode;
    } else {
        window.localStorage.setItem('lang-code', 'en');
        LocaleStrings.langCode = 'en';
    }
}

{
    let thisScriptElement = document.currentScript;
    let context = thisScriptElement.getAttribute('context');
    LocaleStrings.context = context;
    if (!context) throw "locale context is not defined!";
    let commonPackRequest = new XMLHttpRequest();
    let languagePackRequest = new XMLHttpRequest();
    commonPackRequest.open('GET', 'locale/language/common/' + LocaleStrings.langCode + '.json');
    commonPackRequest.responseType = 'json';
    commonPackRequest.onload = function () {
        let commonPack = commonPackRequest.response;
        LocaleStrings.numbers = commonPack.numbers;
        LocaleStrings.monthNames = commonPack.monthNames;
        LocaleStrings.abbreviations = commonPack.abbreviations
        languagePackRequest.send();
    };
    commonPackRequest.send();

    languagePackRequest.open('GET', 'locale/language/' + context + '/' + LocaleStrings.langCode + '.json');
    languagePackRequest.responseType = 'json';
    languagePackRequest.onload = function () {
        let languagePack = languagePackRequest.response;
        Object.keys(languagePack).forEach(key => {
            let phrase = new Phrase(languagePack[key]);
            LocaleStrings.phrases[key] = phrase;
        });
        if (LocaleStrings.onReadyCallbacks) {
            LocaleStrings.onReadyCallbacks.forEach(callback => callback());
            LocaleStrings.ready = true;
        }
    };
    // transform document body on load
    try{
        SharedContent.addOnLoadListner(() => LocaleStrings.addOnReadyListener(() => {
            let body = document.body;
            body.innerHTML = LocaleStrings.replaceLocaleStringMatches(body.innerHTML);
        }));
    } catch (e) {
        LocaleStrings.addOnReadyListener(() => {
            let body = document.body;
            body.innerHTML = LocaleStrings.replaceLocaleStringMatches(body.innerHTML);
        });
    }
   

}
