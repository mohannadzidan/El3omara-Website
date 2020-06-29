
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
const ActionCodesSynonyms = {
    0: 'Submitted expense',
    1: 'Submitted payment', 
    2: 'Created cost-center',
    3: 'Edited cost-center', 
    4: 'Deleted cost-center', 
    5: 'Added announcmenet',
    6: 'Dropped announcment', 
    7: 'Added owner', 
    8: 'Deleted owner', 
    9: 'Edited owner', 
}
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
