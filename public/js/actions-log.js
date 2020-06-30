
const ActionCode = {
    SUBMIT_EXPENSE: 0, //
    SUBMIT_PAYMENT: 1, //
    CREATE_COST_CENTER: 2,
    EDIT_COST_CENTER: 3, //
    DELETE_COST_CENTER: 4, //
    ADD_ANNOUNCEMENT: 5, // 
    DROP_ANNOUNCEMENT: 6, //
    ADD_OWNER: 7, //
    DELETE_OWNER: 8, //
    EDIT_OWNER: 9, //
}
var ActionCodesSynonyms = {};
LocaleStrings.addOnReadyListener(() => {
    if (LocaleStrings.context == 'actions') {
        ActionCodesSynonyms = {
            0: LocaleStrings.getLocaleString('submitted_expense'),
            1: LocaleStrings.getLocaleString('submitted_payment'),
            2: LocaleStrings.getLocaleString('created_cost_center'),
            3: LocaleStrings.getLocaleString('edited_cost_center'),
            4: LocaleStrings.getLocaleString('deleted_cost_center'),
            5: LocaleStrings.getLocaleString('added_announcement'),
            6: LocaleStrings.getLocaleString('dropped_announcement'),
            7: LocaleStrings.getLocaleString('added_owner'),
            8: LocaleStrings.getLocaleString('deleted_owner'),
            9: LocaleStrings.getLocaleString('edited_owner'),
        }
    }
});

function logAction(actionCode, args) {

        var timestamp = new Date().getTime();
        var actionId = generateUUID();
        var userId = firebase.auth().currentUser.uid;
        return firebase.database().ref('actions/' + actionId).set({
            code: actionCode,
            timestamp: timestamp,
            userId: userId,
            args: args
        });
    }
