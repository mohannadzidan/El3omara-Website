String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
let allUsers = [];
let allOwners = [];
let allCostCenters = [];
let allPayments = [];
let allExpenses = [];
let allAnnouncements = [];
let allActions = [];
let allPromises = [];

allPromises.push(firebase.database().ref('announcements').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var announcement = spc.val();
        announcement.id = spc.key;
        allAnnouncements.push(announcement);
    });
}));
allPromises.push(firebase.database().ref('actions').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var action = spc.val();
        action.id = spc.key;
        allActions.push(action);
    });
}));
allPromises.push(firebase.database().ref('users').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var user = spc.val();
        user.id = spc.key;
        allUsers.push(user);
    });
}));
allPromises.push(firebase.database().ref('costCenters').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var costCenter = spc.val();
        costCenter.id = spc.key;
        allCostCenters.push(costCenter);
    });
}));
allPromises.push(firebase.database().ref('expenses').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var expense = spc.val();
        expense.id = spc.key;
        allExpenses.push(expense);
    });
}));
allPromises.push(firebase.database().ref('payments').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var payment = spc.val();
        payment.id = spc.key;
        allPayments.push(payment);
    });
}));
allPromises.push(firebase.database().ref('owners').once('value', (snapshot) => {
    snapshot.forEach(spc => {
        var owner = spc.val();
        owner.id = spc.key;
        allOwners.push(owner);
    });
}));
function searchActions(query) {
    let actionsTable_filter = document.getElementById('actionsTable_filter');
    let searchBox = actionsTable_filter.querySelector('input');
    searchBox.value = query;
    searchBox.focus();
}
function camelCaseToSpaced(str) {
    const isUpperCase = (s) => {
        return s === s.toUpperCase();
    }
    normal = '';
    word = '';
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        console.log(isUpperCase('a'));
        if (word.length > 0 && isUpperCase(char)) {
            word = word.replaceAt(0, word.charAt(0).toUpperCase());
            normal += word + ' ';
            word = '';
        }
        word += char;
    }
    word = word.replaceAt(0, word.charAt(0).toUpperCase());
    normal += word;

    return normal;
}
var DetailsListGenerator = {
    generateNoDetails: function (metadata) {
        let a = document.createElement('a');
        a.setAttribute('href', '#');
        a.classList.add('text-danger');
        a.innerHTML = 'Details not found';
        if (metadata) a.setAttribute('onclick', 'searchActions("' + metadata + '")');
        return a;
    },
    generatePaymentDetails: function (action) {
        let payment = allPayments.find(p => p.id == action.args.id);
        if (payment) {
            let owner = allOwners.find(o => o.id == payment.ownerId);
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${LocaleStrings.getLocaleString('amount')}: ${LocaleStrings.replaceLocaleNumbers(Number(payment.amount).toFixed(2))}</li>
            <li>${LocaleStrings.getLocaleString('owner')}: ${owner ? owner.name + ' - ' + owner.flatNumber : this.generateNoDetails('id: ' + payment.ownerId).outerHTML}</li>
            <li>${LocaleStrings.getLocaleString('reason')}: ${payment.reason}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateExpenseDetails: function (action) {
        let expense = allExpenses.find(p => p.id == action.args.id);
        if (expense) {
            let costCenter = allCostCenters.find(o => o.id == expense.costCenterId);
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${LocaleStrings.getLocaleString('amount')}: ${LocaleStrings.replaceLocaleNumbers(Number(expense.amount).toFixed(2))}</li>
            <li>${LocaleStrings.getLocaleString('cost_center')}: ${costCenter ? costCenter.title : this.generateNoDetails('id: ' + expense.costCenterId).outerHTML}</li>
            <li>${LocaleStrings.getLocaleString('reason')}: ${expense.reason}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateAddAnnouncementDetails: function (action) {
        let announcement = allAnnouncements.find(p => p.id == action.args.id);
        if (announcement) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${LocaleStrings.getLocaleString('title')}: ${announcement.title}</li>
            <li>${LocaleStrings.getLocaleString('total_cost')}: ${LocaleStrings.replaceLocaleNumbers(Number(announcement.totalCost).toFixed(2))}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateDropAnnouncementDetails: function (action) {
        let announcement = action.args.archivedVersion ? action.args.archivedVersion : action.args.draft;
        if (announcement) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${LocaleStrings.getLocaleString('title')}: ${announcement.title}</li>
            <li>Id: ${action.args.id}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateCreateCostCenterDetails: function (action) {
        let costCenter = allCostCenters.find(p => p.id == action.args.id);
        if (costCenter) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${LocaleStrings.getLocaleString('title')}: ${costCenter.title}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateDeleteCostCenterDetails: function (action) {
        let costCenter = action.args.arichivedVersion;
        if (costCenter) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${LocaleStrings.getLocaleString('title')}: ${costCenter.title}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateEditCostCenterDetails: function (action) {
        if (action.args.edits) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';


            Object.keys(action.args.edits).forEach((key) => {
                if (key == 'owners') {
                    let ownersChanges = action.args.edits.owners;
                    let removed = ownersChanges.old.filter(o => !ownersChanges.new.includes(o));
                    let added = ownersChanges.new.filter(o => !ownersChanges.old.includes(o));
                    let htmlContent = '';
                    removed.forEach(id => {
                        let owner = allOwners.find(o => o.id == id);
                        if (owner) {
                            htmlContent += `
                            <div class="text-danger">
                                <i class="fas fa-user-minus"></i>
                                <a>${owner.name} - ${owner.flatNumber}</a>
                            </div>`;
                        } else {
                            htmlContent += `<div class="text-warning">${LocaleStrings.getLocaleString('unkown_owner')}</div>`;
                        }
                    });
                    added.forEach(id => {
                        let owner = allOwners.find(o => o.id == id);
                        if (owner) {
                            htmlContent += `
                            <div class="text-success">
                                <i class="fas fa-user-plus"></i>
                                <a>${owner.name} - ${owner.flatNumber}</a>
                            </div>`;
                        } else {
                            htmlContent += `<div class="text-warning">${LocaleStrings.getLocaleString('unkown_owner')}</div>`;
                        }
                    });
                    ul.innerHTML += `
                    <li>${htmlContent}</li>
                    `;
                } else if (key == 'parentId') {
                    let oldParent = allCostCenters.find(cc => cc.id == action.args.edits[key].old);
                    let newParent = allCostCenters.find(cc => caches.id == action.args.edits[key].new);

                    ul.innerHTML += `
                    <li>
                    <a class="font-weight-bold">${LocaleStrings.getLocaleString('parent')}: </a><a>${oldParent ? oldParent.title : LocaleStrings.getLocaleString('independent')} </a><i class="fas fa-long-arrow-alt-right></i><a> ${newParent ? newParent.title : LocaleStrings.getLocaleString('independent')}</a>
                    </li>
                    `;
                } else {
                    ul.innerHTML += `
                    <li>
                    <a class="font-weight-bold">${camelCaseToSpaced(key)}: </a><a>${action.args.edits[key].old} </a><i class="fas fa-long-arrow-alt-right"></i><a> ${action.args.edits[key].new}</a>
                    </li>
                    `;
                }

            });

            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateDeleteOwnerDetails: function (action) {
        let owner = action.args.archivedVersion;
        if (owner) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${owner.name} - ${owner.flatNumber}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateAddOwnerDetails: function (action) {
        let owner = allOwners.find(o => o.id == action.args.id);
        if (owner) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `
            <li>${owner.name} - ${owner.flatNumber}</li>
            `;
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateEditOwnerDetails: function (action) {
        let owner = allOwners.find(o => o.id == action.args.id);
        if (owner && action.args.edits) {
            let ul = document.createElement('ul');
            ul.style.textAlign = 'left';
            ul.innerHTML = `<div class="font-weight-light text-center">${owner.name}</div>`
            Object.keys(action.args.edits).forEach(key => {
                ul.innerHTML += `
                <li>
                <a class="font-weight-bold">${camelCaseToSpaced(key)}: </a><a>${action.args.edits[key].old} </a><i class="fas fa-long-arrow-alt-right"></i><a> ${action.args.edits[key].new}</a>
                </li>
                `;
            });
            return ul;
        } else {
            return this.generateNoDetails('id: ' + action.args.id);
        }
    },
    generateDetails: function (action) {
        switch (action.code) {
            case ActionCode.SUBMIT_EXPENSE:
                return this.generateExpenseDetails(action);
            case ActionCode.SUBMIT_PAYMENT:
                return this.generatePaymentDetails(action);
            case ActionCode.CREATE_COST_CENTER:
                return this.generateCreateCostCenterDetails(action);
            case ActionCode.DELETE_COST_CENTER:
                return this.generateDeleteCostCenterDetails(action);
            case ActionCode.EDIT_COST_CENTER:
                return this.generateEditCostCenterDetails(action);
            case ActionCode.DROP_ANNOUNCEMENT:
                return this.generateDropAnnouncementDetails(action);
            case ActionCode.ADD_ANNOUNCEMENT:
                return this.generateAddAnnouncementDetails(action);
            case ActionCode.ADD_OWNER:
                return this.generateAddOwnerDetails(action);
            case ActionCode.DELETE_OWNER:
                return this.generateDeleteOwnerDetails(action);
            case ActionCode.EDIT_OWNER:
                return this.generateEditOwnerDetails(action);
            default: return 'unknown action';
        }
    }
};
LocaleStrings.addOnReadyListener(() => {
    Promise.all(allPromises).then(() => {
        let logs = [];
        allActions.forEach(action => {
            user = allUsers.find(u => u.id == action.userId);
            logs.push({
                timestamp: LocaleStrings.formatDate(action.timestamp) + ' | ' + LocaleStrings.formatTime(action.timestamp),
                user: user ? user.displayName : 'user not found',
                actionCodeSynonym: ActionCodesSynonyms[action.code],
                details: DetailsListGenerator.generateDetails(action),
            });
        });
        $('#actionsTable').DataTable({
            destroy: true,
            data: logs,
            columns: [
                { data: 'timestamp' },
                { data: 'user' },
                { data: 'actionCodeSynonym' },
                {
                    "mData": 'details',
                    "bSortable": false,
                    "mRender": function (data, type, row) {
                        return data.outerHTML ? data.outerHTML : '<a class="text-warning">' + data + '</a>';
                    }
                }
            ]
        });
    });

});




