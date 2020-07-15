

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
        if (!LocaleStrings.isReady) throw "LocaleStrings isn't ready!"
        if (!LocaleStrings.phrases[key]) throw `The language pack doesn't define (${key})!.`;
        if (arguments.length > 1) {
            let args = Array.from(arguments);
            return LocaleStrings.phrases[key].inject(args.slice(1, args.length));
        }
        return LocaleStrings.phrases[key].value;
    },
    replaceLocaleNumbers: function (str) {
        if (!LocaleStrings.isReady) throw "LocaleStrings isn't ready!"

        for (let i = 0; i < 10; i++) {
            str = str.replace(new RegExp(i.toString(), 'g'), this.numbers[i]);
        }
        return str;
    },
    replaceLocaleStringMatches: (str) => {
        if (!LocaleStrings.isReady) throw "LocaleStrings isn't ready!"

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
        if (!LocaleStrings.isReady) throw "LocaleStrings isn't ready!"

        var date = new Date(timestamp);
        var a = `${LocaleStrings.monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
        return LocaleStrings.replaceLocaleNumbers(a);
    },
    formatTime: (timestamp) => {
        if (!LocaleStrings.isReady) throw "LocaleStrings isn't ready!"

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
        if (LocaleStrings.isReady) {
            callback();
        } else {
            if (!LocaleStrings.onReadyCallbacks) LocaleStrings.onReadyCallbacks = [];
            LocaleStrings.onReadyCallbacks.push(callback);
        }
    },
    addOnFinishListener: (callback) => {
        if (LocaleStrings.isFinished) {
            callback();
        } else {
            if (!LocaleStrings.onFinishCallbacks) LocaleStrings.onFinishCallbacks = [];
            LocaleStrings.onFinishCallbacks.push(callback);
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
        if(languagePack == null){
            console.warn("no language pack found at "+ 'locale/language/' + context + '/' + LocaleStrings.langCode + '.json');
            return;
        }
        Object.keys(languagePack).forEach(key => {
            let phrase = new Phrase(languagePack[key]);
            LocaleStrings.phrases[key] = phrase;
        });
        if (LocaleStrings.onReadyCallbacks) {
            LocaleStrings.isReady = true;
            LocaleStrings.onReadyCallbacks.forEach(callback => callback());
        }
        if (LocaleStrings.onFinishCallbacks) {
            LocaleStrings.isFinished = true;
            LocaleStrings.onFinishCallbacks.forEach(callback => callback());
        }
    };
    // transform document body on load
    let transformDocument = () => {
        // old method (stupid)
        /*
            let body = document.body;
            body.innerHTML = LocaleStrings.replaceLocaleStringMatches(body.innerHTML);
         */

        // new method
        document.querySelectorAll('[locale-inner]').forEach(e => {
            e.innerHTML = LocaleStrings.getLocaleString(e.getAttribute('locale-inner'));
        });
        document.querySelectorAll('[locale-before]').forEach(e => {
            e.insertAdjacentText('afterbegin', LocaleStrings.getLocaleString(e.getAttribute('locale-before')));
        });
        document.querySelectorAll('[locale-after]').forEach(e => {
            e.insertAdjacentText('beforeend', LocaleStrings.getLocaleString(e.getAttribute('locale-after')));
        });
        document.querySelectorAll('[locale-placeholder]').forEach(e => {
            e.placeholder = LocaleStrings.getLocaleString(e.getAttribute('locale-placeholder'));
        });
        document.querySelectorAll('[locale-value]').forEach(e => {
            e.value = LocaleStrings.getLocaleString(e.getAttribute('locale-value'));
        });
        document.querySelectorAll('[locale-class]').forEach(e => {
            e.classList.add(LocaleStrings.getLocaleString(e.getAttribute('locale-class')));
        });
    }
    try {
        // try to sync with js/shared-content.js
        SharedContent.addOnLoadListner(() => LocaleStrings.addOnReadyListener(transformDocument));
    } catch (e) {
        LocaleStrings.addOnReadyListener(transformDocument);
    }


    LocaleStrings.addOnReadyListener(() => {
        if (LocaleStrings.langCode == 'ar') {
            document.body.style.direction = 'rtl';
            document.body.style.textAlign = 'right';
        } else {
            document.body.style.direction = 'ltr';
            document.body.style.textAlign = 'left';
        }
    });

}