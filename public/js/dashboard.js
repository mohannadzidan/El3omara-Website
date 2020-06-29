function roundCurrency(n) {
    var decimalPlaces = Math.round((n % 1) * 100);
    return Math.floor(n) + '.' + (decimalPlaces == 0 ? '00' : decimalPlaces);
}
function isArrayIdentical(a, b) {
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
function isWhiteSpace(str) {
    var matches = str.match(/\s+/gi);
    if (matches == null || matches.length != 1) return false;
    return matches[0].length == str.length;
}

class Generator {
    /**
     * @param {*} containerType 
     * @param {*} label 
     * @param {*} id 
     * @returns {HTMLElement}
     */
    static generateCheckbox(containerType, label, id, name) {
        var htmlTemplate = `
            <input id="${id}" type="checkbox" name="${name ? name : 'checkbox'}"/>
            <label for="${id}">${label}</label>
        `;
        var htmlElement = document.createElement(containerType);
        htmlElement.classList.add('inputGroup');
        htmlElement.innerHTML = htmlTemplate;
        return htmlElement;
    }

    /**
     * @param {*} containerType 
     * @param {*} label 
     * @param {*} id 
     * @returns {HTMLElement}
     */
    static generateRadiobutton(containerType, label, id, name) {
        var htmlTemplate = `
            <input id="${id}" type="radio" name="${name ? name : 'radiobutton'}"/>
            <label for="${id}">${label}</label>
        `;
        var htmlElement = document.createElement(containerType);
        htmlElement.classList.add('inputGroup');
        htmlElement.innerHTML = htmlTemplate;
        return htmlElement;
    }

    static generateWarningListItem(msg) {
        var htmlTemplate = `
            <i class="fas fa-exclamation-circle text-warning"></i>
            <a class="ml-1 font-weight-bold small">${msg}</a>
        `;
        var htmlElement = document.createElement('li');
        htmlElement.classList.add('li-separator', 'm-1');
        htmlElement.innerHTML = htmlTemplate;
        return htmlElement;
    }
    static generateErrorListItem(msg) {
        var htmlTemplate = `
            <i class="fas fa-exclamation-circle text-danger"></i>
            <a class="ml-1 font-weight-bold small">${msg}</a>
        `;
        var htmlElement = document.createElement('li');
        htmlElement.classList.add('li-separator', 'px-2', 'border-left-danger');
        htmlElement.innerHTML = htmlTemplate;
        return htmlElement;
    }

    static generateField(title, value = 0, tail) {
        var firstCol = document.createElement('div');
        firstCol.classList.add('col');
        var secondCol = document.createElement('div');
        secondCol.classList.add('col-auto', 'px-0');
        var input = document.createElement('input');
        input.type = 'number';
        input.classList.add('small', 'max-w-2');
        input.value = value;
        var label = document.createElement('a');
        label.classList.add('p-0', 'm-0', 'small');
        label.innerHTML = title;
        var percentage = document.createElement('a');
        percentage.classList.add('ml-1', 'small');
        percentage.innerHTML = tail;
        firstCol.appendChild(label);
        secondCol.appendChild(input);
        secondCol.appendChild(percentage);
        var row = document.createElement('div');
        row.classList.add('row');
        row.appendChild(firstCol);
        row.appendChild(secondCol);
        row.input = input;
        row.label = label;
        return row;
    }

}

class Owner {
    constructor(plainObject) {
        this.id = plainObject.id;
        this.name = plainObject.name;
        this.phoneNumber = plainObject.phoneNumber;
        this.flatNumber = plainObject.flatNumber;
    }
}

class Announcement {
    constructor(plainObject) {
        this.htmlElements = {
            totalCost: null,
            totalPayments: null,
            title: null,
            date: null,
            pendingPayments: null,
            body: null,
            paymentsList: null,
            pendingPaymentsList: null,
            dropdownDrop: null,
            dropdownSchedule: null,

        }
        this.update(plainObject);
    }

    update(plainObject) {
        if (plainObject) {
            this.id = plainObject.id;
            this.timestamp = plainObject.timestamp;
            this.title = plainObject.title;
            this.totalCost = plainObject.totalCost;
            this.costCenterId = plainObject.costCenterId;
            this.plainPayments = plainObject.payments;
        }
        this.payments = this.plainPayments ? this.toFullPayments(this.plainPayments) : [];
        this.totalPayments = 0;
        this.payments.forEach((p) => this.totalPayments += p.amount);
        let costCenter = Dashboard.findCostCenterById(this.costCenterId);
        this.pendingPayments = costCenter.owners.length - this.payments.length;
        // update html elements
        if (document.getElementById(this.id + '_body') == null) {
            this.appendToContainer();
        }
        this.findHTMLElements();
        this.htmlElements.title.innerHTML = this.title;
        this.htmlElements.totalCost.innerHTML = roundCurrency(this.totalCost);
        this.htmlElements.totalPayments.innerHTML = roundCurrency(this.totalPayments);
        this.htmlElements.pendingPayments.innerHTML = this.pendingPayments;
        this.htmlElements.date.innerHTML = Dashboard.formatDate(this.timestamp);
        this.htmlElements.paymentsList.innerHTML = this.allPaymentsToListElements();
        this.htmlElements.pendingPaymentsList.innerHTML = this.payersStatusToListElements();
        this.htmlElements.dropdownDrop.onclick = () => {
            if (this.payments.length >= Dashboard.findCostCenterById(this.costCenterId).owners.length) {
                firebase.database().ref('announcements/' + this.id).remove().then(() => this.removeFromContainer());
                logAction(ActionCode.DROP_ANNOUNCEMENT, {
                    id: this.id,
                    draft: {
                        title: this.title,
                        totalCost: this.totalCost
                    }
                });
            } else if (confirm("this announcment has pending payments, are you sure to delete it?")) {
                firebase.database().ref('announcements/' + this.id).remove().then(() => this.removeFromContainer()).then(() => {
                    logAction(ActionCode.DROP_ANNOUNCEMENT, {
                        id: this.id,
                        archivedVersion: {
                            payments: this.plainPayments,
                            title: this.title,
                            costCenterId: this.costCenterId,
                            totalCost: this.totalCost,
                        }
                    });
                });
            }
        };

    }
    allPaymentsToListElements() {
        var list = '';
        this.payments.forEach((p) => {
            var owner = Dashboard.allOwners.find((o) => o.id == p.ownerId);
            var element = `
            <li class="li-separator small">
            <a>${owner.name} - ${owner.flatNumber} - ${Dashboard.formatDate(p.timestamp)}</a>
            </li>
            `;
            list += element;
        });
        return list;
    }
    payersStatusToListElements() {
        var list = '';
        var owners = Dashboard.findCostCenterById(this.costCenterId).owners;
        owners.forEach((o) => {
            var payment = this.findPaymentByOwnerId(o.id);
            var element = `
            <li class="li-separator small">
                <a class="fas fa-${payment ? 'check' : 'ban'} text-${payment ? 'success' : 'danger'} p-0"></a>
                <a>${o.name} - ${o.flatNumber}</a>
            </li>
            `;
            list += element;
        });
        return list;
    }

    appendToContainer() {

        var htmlTemplate = `
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">
                <i class="fas fa-flag text-primary mr-3" ></i>
                <a id="${this.id}_title"></a>
                <a class="text-secondary small">-</a>
                <a class="text-secondary small" id="${this.id}_date"></a>
            </h6>
            <div class="dropdown no-arrow ${currentUserRole != 'admin' && currentUserRole != 'editor' ? 'hidden' : ''}">
                <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink" x-placement="bottom-end" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-142px, 18px, 0px);">
                    <div class="dropdown-header">Edit</div>
                    <a class="dropdown-item" disabled id="${this.id}_dropdownSchedule">Schedule</a>
                    <a class="dropdown-item text-danger" id="${this.id}_dropdownDrop">Drop</a>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="row no-gutters align-items-center">
                <div class="col mr-5 mb-1">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Cost</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                        <a id="${this.id}_totalCost"></a>
                        <a class="small">EGP</a>
                    </div>
                </div>
                <input  style="display: none;" type="checkbox" id="${this.id}_paymentsCheckbox" name="${this.id}_tabCheckbox" label-id="${this.id}_paymentsLabel" tab-id="${this.id}_paymentsList">
                <label class="col mr-5 mb-1" for="${this.id}_paymentsCheckbox" id="${this.id}_paymentsLabel" name="${this.id}_tabLabel">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Payments</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                        <a id="${this.id}_totalPayments"></a>
                        <a class="small">EGP</a>
                    </div>
                </label>
                <input style="display: none;" type="checkbox" id="${this.id}_pendingPaymentsCheckbox" name="${this.id}_tabCheckbox" label-id="${this.id}_pendingPaymentsLabel" tab-id="${this.id}_pendingPaymentsList">
                <label class="col mr-5 mb-1" for="${this.id}_pendingPaymentsCheckbox" id="${this.id}_pendingPaymentsLabel" name="${this.id}_tabLabel">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Pending</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800" id="${this.id}_pendingPayments"></div>
                </label>
                
            </div>
            <hr class="my-1">
            <div class= "max-h-2">
            <ul class="simple-list my-0 mx-1 px-1" id="${this.id}_paymentsList" style="display: none;">
            </ul>
            <ul class="simple-list my-0 mx-1 px-1" id="${this.id}_pendingPaymentsList" style="display: none;">
            </ul>
            </div>
           
        </div>
            `
        var body = document.createElement('div');
        body.classList.add('card', 'shadow', 'h-100', 'my-1', 'border-primary');
        body.id = this.id + '_body';
        body.innerHTML = htmlTemplate;
        let costCenter = Dashboard.findCostCenterById(this.costCenterId);
        costCenter.htmlElements.announcementsContainer.appendChild(body);


        var inputFunction = (checkbox, checkboxesGroup) => {
            checkboxesGroup.forEach((e) => {
                var tabId = e.getAttribute("tab-id");
                var labelId = e.getAttribute("label-id");
                var tab = document.getElementById(tabId);
                var label = document.getElementById(labelId);
                if (e.id == checkbox.id) {
                    if (e.checked) {
                        label.classList.add("border-bottom-primary");
                        tab.style.display = "block";
                    } else {
                        label.classList.remove("border-bottom-primary");
                        tab.style.display = "none";
                    }
                } else {
                    e.checked = false;
                    label.classList.remove("border-bottom-primary");
                    tab.style.display = "none";
                }
            });
        }

        var tabGroupCheckboxes = document.getElementsByName(this.id + '_tabCheckbox');
        tabGroupCheckboxes.forEach((cb) => {
            cb.oninput = () => inputFunction(cb, tabGroupCheckboxes);
        });

    }
    removeFromContainer() {
        if (this.htmlElements.body) this.htmlElements.body.remove();
        else {
            var find = document.getElementById(this.id + '_body');
            if (find) {
                find.remove();
            }
        };
    }

    toFullPayments(paymentsIds) {
        var costCenter = Dashboard.findCostCenterById(this.costCenterId);
        var payments = [];
        Object.keys(paymentsIds).forEach((key) => {
            let id = paymentsIds[key];
            var actPayment = costCenter.findPaymentById(id);
            if (actPayment) payments.push(actPayment);
        });
        return payments;
    }

    findPaymentById(id) {
        return this.payments.find((p) => p.id == id) != null;
    }
    findPaymentByOwnerId(ownerId) {
        return this.payments.find((p) => p.ownerId == ownerId);
    }

    findHTMLElements() {
        Object.keys(this.htmlElements).forEach((key) => {
            this.htmlElements[key] = document.getElementById(this.id + '_' + key);
        });
    }

    onCol_Payments() {

    }

    onCol_

    static createAnnouncement(costCenterId, title, totalCost) {
        var timestamp = new Date().getTime();
        var id = generateUUID();
        firebase.database().ref('announcements/' + id).set({
            timestamp: timestamp,
            costCenterId: costCenterId,
            title: title,
            totalCost: totalCost
        }).then(() => {
            logAction(ActionCode.ADD_ANNOUNCEMENT, { id: id });
        });
    }
}

class CostCenter {
    /**
     * 
     * @param {*} plainObject 
     * @param {HTMLElement} container 
     */
    constructor(plainObject, container) {
        this.container = container;
        this.htmlElements = {
            body: null,
            title: null,
            parentTitle: null,
            totalSavings: null,
            totalChildrenSavings: null,
            announcementsContainer: null,
            description: null,
            dropdownAddPayment: null,
            dropdownAddExpense: null,
            dropdownAddAnnouncement: null,
            dropdownEditDetails: null,
        };
        /**
         * @type {Announcement[]}
         */
        this.announcements = [];
        this.payments = [];
        this.announcementDatabaseRef = null;
        this.paymentsDatabaseRef = null;
        this.update(plainObject);
        this.connectAnnouncements();
        this.connectPayments();
        this.connectExpenses();

    }

    connectAnnouncements() {
        if (this.announcementDatabaseRef) return; // already connected
        this.announcementDatabaseRef = firebase.database().ref('announcements');
        this.announcementDatabaseRef.orderByChild('costCenterId')
            .equalTo(this.id).on('value', (snapshot) => {

                if (snapshot.exists()) {
                    let plainAnouncements = [];
                    snapshot.forEach((snapshotChild) => {
                        let plainAnouncement = snapshotChild.val();
                        plainAnouncement.id = snapshotChild.key;
                        plainAnouncements.push(plainAnouncement);
                        let announcement = this.announcements.find((a) => a.id == plainAnouncement.id);
                        if (announcement) {
                            announcement.update(plainAnouncement);
                        } else {
                            this.announcements.push(new Announcement(plainAnouncement));
                        }
                        // filter out announcements that don't exist in the snapshot
                        this.announcements = this.announcements.filter((a) => {
                            let match = plainAnouncements.find((po) => po.id == a.id);
                            if (match == null) {
                                a.removeFromContainer();
                                return false;
                            }
                            return true;
                        });
                    });
                } else {
                    var element = document.createElement('div');
                    element.style.textAlign = 'center';
                    element.innerHTML = `
                    <i class="small text-gray-500">No active announcements</i>
                    `;
                    element.classList.add('show-if-only-child');
                    this.htmlElements.announcementsContainer.innerHTML = '';
                    this.htmlElements.announcementsContainer.appendChild(element);
                }

            });
    }

    disconnectAnnouncements() {
        if (this.announcementDatabaseRef == null) return; // not connected
        announcementDatabaseRef.off('value');
        this.announcementDatabaseRef = null;
    }

    connectPayments() {
        if (this.paymentsDatabaseRef) return; // already connected
        this.paymentsDatabaseRef = firebase.database().ref('payments');
        this.paymentsDatabaseRef.orderByChild('costCenterId')
            .equalTo(this.id)
            .on('value', (snapshot) => {
                this.payments = [];
                snapshot.forEach((snapshotChild) => {
                    var payment = snapshotChild.val();
                    payment.id = snapshotChild.key;
                    this.payments.push(payment);
                });
                this.update();
                this.announcements.forEach((a) => a.update());
            });

    }
    connectExpenses() {
        if (this.expensesDatabaseRef) return; // already connected
        this.expensesDatabaseRef = firebase.database().ref('expenses');
        this.expensesDatabaseRef.orderByChild('costCenterId')
            .equalTo(this.id)
            .on('value', (snapshot) => {
                this.expenses = [];
                snapshot.forEach((snapshotChild) => {
                    var expense = snapshotChild.val();
                    expense.id = snapshotChild.key;
                    this.expenses.push(expense);
                });
                this.update();
            });
    }

    appendToContainer() {
        var htmlTemplate = `
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
    <div>
        <a class="m-0 font-weight-bold text-primary" id="${this.id}_title"></a>
        <a class="text-secondary small" id="${this.id}_parentTitle"></a>
    </div>
    <div class="dropdown no-arrow" ${currentUserRole != 'admin' && currentUserRole != 'editor' ? 'hidden' : ''}>
        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
        </a>
        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink"
            x-placement="bottom-end"
            style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(17px, 19px, 0px);">
            <div class="dropdown-header">Add</div>
            <a class="dropdown-item" href="#" data-toggle="modal" data-target="#announcementModal"
                id="${this.id}_dropdownAddAnnouncement">Announcement</a>
            <a class="dropdown-item" href="#costCenterId" data-toggle="modal" data-target="#paymentModal"
                id="${this.id}_dropdownAddPayment">Payment</a>
            <div class="dropdown-header">Edit</div>
            <a class="dropdown-item" href="#costCenterId" data-toggle="modal" data-target="#editCostCenterDetailsModal"
                id="${this.id}_dropdownEditDetails">Edit Details</a>
        </div>
    </div>
</div>
<!-- Card Body -->
<div class="card-body">
    <div class="card shadow-lg h-100 my-2">
        <div class="card-body">
            <div type="text" class="mb-3" id="${this.id}_description"></div>
            <div class="row no-gutters align-items-center my-2">
                    <div class="col-auto mr-2">
                        <div class="icon-circle bg-primary">
                            <i class="fas fa-donate text-white"></i>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Savings</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                            <a id="${this.id}_totalSavings"></a>
                            <a class="small">EGP</a>
                        </div>
                    </div>
                </div>
                <div class="row no-gutters align-items-center my-2">
                    <div class="col-auto mr-2">
                        <div class="icon-circle bg-warning">
                            <i class="fas fa-donate text-white"></i>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Children Savings</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                            <a id="${this.id}_totalChildrenSavings"></a>
                            <a class="small">EGP</a>
                        </div>
                    </div>
                </div>
        </div>
    </div>
    <div id="${this.id}_announcementsContainer">
        <div class="row px-2 align-items-center show-if-only-child">
            <div class="sk-chase col-auto">
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
                <div class="sk-chase-dot"></div>
            </div>
            <h6 class="col">Loading Announcements...</h6>
        </div>
    </div>
</div>
        `;
        var htmlElement = document.createElement('div');
        htmlElement.classList.add('card', 'shadow', 'mb-4');
        htmlElement.innerHTML = htmlTemplate;
        htmlElement.id = this.id + '_body';
        this.container.appendChild(htmlElement);
        Object.keys(this.htmlElements).forEach((key) => {
            this.htmlElements[key] = document.getElementById(this.id + '_' + key);
        });
        this.htmlElements.dropdownAddAnnouncement.onclick = () => this.onDropdown_AddAnnouncement();
        this.htmlElements.dropdownAddPayment.onclick = () => this.onDropdown_AddPayment();
        this.htmlElements.dropdownEditDetails.onclick = () => this.onDropdown_EditDetails();

    }
    removeFromContainer() {
        document.getElementById(this.htmlElements.body.id).remove();
    }

    destroy() {
        this.disconnectAnnouncements();

        removeFromContainer();
    }

    update(plainCostCenter) {
        if (plainCostCenter) {
            /**
             * @type {string}
             */
            this.id = plainCostCenter.id;
            /**
             * @type {string}
             */
            this.parentId = plainCostCenter.parentId;
            /**
             * @type {string}
             */
            this.title = plainCostCenter.title;
            /**
             * @type {string}
             */
            this.description = plainCostCenter.description;
            /**
             * @type {number}
             */
            this.timestamp = plainCostCenter.timestamp;
            /**
             * @type {Owner[]}
             */
            this.owners = [];
            if (plainCostCenter.owners) plainCostCenter.owners.forEach((ownerId) => this.owners.push(Dashboard.findOwnerById(ownerId)));
            this.expenses = [];
        }
        if (this.htmlElements.body == null) {
            this.appendToContainer();
        }
        this.htmlElements.title.innerHTML = this.title;
        if (this.parentId.length > 0) {
            var parent = Dashboard.findCostCenterById(this.parentId);
            if (parent) {
                this.htmlElements.parentTitle.innerHTML = '- ' + parent.title;
                this.htmlElements.parentTitle.href = "#" + parent.htmlElements.body.id;
                parent.update();
            }
        }
        var children = this.getChildren();
        if (children.length > 0) {
            var totalChildrenSavings = 0;
            children.forEach((c) => totalChildrenSavings += c.calculateTotalSavings());
            this.htmlElements.totalChildrenSavings.innerHTML = roundCurrency(totalChildrenSavings);
            this.htmlElements.totalChildrenSavings.parentElement.parentElement.parentElement.classList.remove('hidden');
        } else {
            this.htmlElements.totalChildrenSavings.parentElement.parentElement.parentElement.classList.add('hidden');
        }
        this.htmlElements.description.innerHTML = this.description;
        this.htmlElements.totalSavings.innerHTML = roundCurrency(this.calculateTotalSavings());

    }

    findPaymentById(id) {
        return this.payments.find((p) => p.id == id);
    }
    findOwnerById(id) {
        return this.owners.find((o) => o.id == id);
    }
    findAnnouncementById(id) {
        return this.announcements.find((a) => a.id == id);
    }

    getChildren() {
        var allChildren = [];
        var children = Dashboard.allCostCenters.filter((costCenter) => costCenter.parentId == this.id);
        allChildren = allChildren.concat(children);
        children.forEach((child) => {
            allChildren = allChildren.concat(child.getChildren());
        })
        return allChildren;
    }

    calculateTotalSavings() {
        var totalSavings = 0;
        this.payments.forEach((p) => totalSavings += p.amount);
        this.expenses.forEach(e => totalSavings -= e.amount)
        return totalSavings;
    }
    submitPayment(announcementId, ownerId, amount) {
        var owner = this.findOwnerById(ownerId);
        var announcement = this.findAnnouncementById(announcementId);
        if (announcement == null || owner == null || amount == null || amount <= 0) {
            throw "Invalid Payment!";
        }
        var paymentId = generateUUID();
        var timestamp = new Date().getTime();
        firebase.database().ref('payments/' + paymentId).set({
            costCenterId: this.id,
            ownerId: ownerId,
            amount: amount,
            reason: announcement.title,
            timestamp: timestamp
        }).then(() => {
            firebase.database().ref('announcements/' + announcementId + '/payments/').push().set(paymentId);
            logAction(ActionCode.SUBMIT_PAYMENT, {
                id: paymentId
            });
        });
    }

    submitExpense(reason, amount, attachmentId = '') {
        var timestamp = new Date().getTime();
        var expenseId = generateUUID();
        firebase.database().ref('expenses/' + expenseId).set({
            reason: reason,
            amount: amount,
            costCenterId: this.id,
            attachmentId: attachmentId,
            timestamp: timestamp
        }).then(() => logAction(ActionCode.SUBMIT_EXPENSE, {
            id: expenseId
        }));
    }

    onDropdown_AddPayment() {
        document.getElementById('paymentModalTitle').innerHTML = 'Payment - ' + this.title;
        document.getElementById('paymentModalTitle').innerHTML = 'Payment - ' + this.title;
        document.getElementById('paymentModalSubmitBtn').onclick = () => this.onSubmit_Payment();
        var modalOwnersList = document.getElementById('paymentModalOwnersList');
        var modalAannouncementsList = document.getElementById('paymentModalAnnouncementsList');
        var modalDetailsList = document.getElementById('paymentModalDetailsList');
        modalDetailsList.innerHTML = '';
        var modalTotalPayments = document.getElementById('paymentModalTotalPayments');
        modalTotalPayments.innerHTML = '0.00';
        // load owners list
        modalOwnersList.innerHTML = '';
        this.owners.forEach((o) => {
            var checkbox = Generator.generateCheckbox('li', o.name, o.id + '_paymentModalCheckbox');
            modalOwnersList.appendChild(checkbox);
            checkbox.oninput = () => this.paymentModal_ValidatePaymentSelections();
        });
        modalAannouncementsList.innerHTML = '';
        this.announcements.forEach((a) => {
            var checkbox = Generator.generateCheckbox('li', a.title, a.id + '_paymentModalCheckbox');
            modalAannouncementsList.appendChild(checkbox);
            checkbox.oninput = () => this.paymentModal_ValidatePaymentSelections();
        });

    }

    paymentModal_ValidatePaymentSelections() {
        var modalDetailsList = document.getElementById('paymentModalDetailsList');
        var modalTotalPayments = document.getElementById('paymentModalTotalPayments');

        modalDetailsList.innerHTML = '';
        var selections = this.paymentModal_getSelections();
        var validPayments = [];
        var totalPayments = 0;
        selections.checkedAnnouncements.forEach((announcement) => {
            const paymentPerOwner = announcement.totalCost / this.owners.length;
            selections.checkedOwners.forEach((owner) => {
                if (announcement.findPaymentByOwnerId(owner.id)) {
                    var msg = 'A payment form \'' + owner.name + '\' has been ignored, since this owner already paid for -' + announcement.title + '-';
                    modalDetailsList.appendChild(Generator.generateWarningListItem(msg));
                } else {
                    validPayments.push({
                        announcementId: announcement.id,
                        ownerId: owner.id,
                        amount: paymentPerOwner
                    });
                    totalPayments += paymentPerOwner;
                }
            });
        });
        modalTotalPayments.innerHTML = roundCurrency(totalPayments);
        return validPayments;
    }

    paymentModal_getSelections() {
        /**
         * @type {Owner[]}
         */
        var checkedOwners = [];
        /**
       * @type {Announcement[]}
       */
        var checkedAnnouncements = [];
        this.owners.forEach((o) => {
            var checkbox = document.getElementById(o.id + '_paymentModalCheckbox');
            if (checkbox.checked) checkedOwners.push(o);
        });

        this.announcements.forEach((a) => {
            var checkbox = document.getElementById(a.id + '_paymentModalCheckbox');
            if (checkbox.checked) checkedAnnouncements.push(a);
        });
        return { checkedOwners: checkedOwners, checkedAnnouncements: checkedAnnouncements };
    }

    onDropdown_AddAnnouncement() {
        document.getElementById('announcementModalTitle').innerHTML = 'Annoncement - ' + this.title;
        document.getElementById('announcementModal_Title').value = '';
        document.getElementById('announcementModal_TotalCost').value = 0;
        document.getElementById('announcementModal_SubmitBtn').onclick = () => this.onSubmit_Annouuncement();

    }

    onDropdown_EditDetails() {
        var modalOwnersList = document.getElementById('editCostCenterDetailsModal_OwnersList');
        var modalCostCentersList = document.getElementById('editCostCenterDetailsModal_CostCentersList');
        var modalSaveBtn = document.getElementById('editCostCenterDetailsModalSaveBtn');
        var modalHeader = document.getElementById('editCostCenterDetailsModalTitle');
        var modalTitle = document.getElementById('editCostCenterDetailsModal_Title');
        var modalDescription = document.getElementById('editCostCenterDetailsModal_Description');
        var modalDeleteBtn = document.getElementById('editCostCenterDetailsModalDeleteBtn');
        modalHeader.innerHTML = 'Edit - ' + this.title;
        modalTitle.value = this.title;
        modalDescription.value = this.description;
        modalCostCentersList.innerHTML = '';
        modalSaveBtn.disabled = true;
        var independentRadiobutton = Generator.generateRadiobutton('li', 'Independent', 'independent_editDetailsModalRadiobutton', 'EditDetailsModalOwnerRadiobutton');
        independentRadiobutton.classList.add('li-separator');
        independentRadiobutton.getElementsByTagName('input')[0].checked = this.parentId == '' ? true : false;
        independentRadiobutton.setAttribute('costCenter-id', 'independent');
        modalCostCentersList.appendChild(independentRadiobutton);
        var inputValidatuionFunction = () => {
            var isOk = true;
            var description = modalDescription.value;
            var title = modalTitle.value;
            isOk = description.length > 0 && !isWhiteSpace(description) && description.length < 30;
            isOk = isOk && title.length > 0 && !isWhiteSpace(title) && title.length < 30;
            var ownersCheckboxes = document.getElementsByName("EditDetailsModalOwnerCheckbox");
            var atleastOnwOwner = false;
            ownersCheckboxes.forEach(cb => {
                if (cb.checked) atleastOnwOwner = true;
            });
            isOk = isOk && atleastOnwOwner;
            modalSaveBtn.disabled = !isOk;
        };
        var submitFunction = () => {
            var ownerIds = [];
            var parentId = '';
            var ownersCheckboxes = document.getElementsByName("EditDetailsModalOwnerCheckbox");
            var costCenterRadiobuttons = document.getElementsByName("EditDetailsModalOwnerRadiobutton");
            ownersCheckboxes.forEach(cb => {
                if (cb.checked) ownerIds.push(cb.parentElement.getAttribute('owner-id'));
            });
            costCenterRadiobuttons.forEach((cb) => {
                if (cb.checked) {
                    var id = cb.parentElement.getAttribute('costCenter-id');
                    parentId = id == 'independent' ? '' : id;
                }
            });
            var title = modalTitle.value;
            var description = modalDescription.value;
            //collect edits
            let edits = {};
            let currentOwnerIds = this.owners.map(o => o.id);
            if (title != this.title) edits.title = { old: this.title, new: title };
            if (description != this.description) edits.description = { old: this.description, new: description };
            if (parentId != this.parentId) edits.parentId = { old: this.parentId, new: parentId };
            if (!isArrayIdentical(currentOwnerIds, ownerIds)) edits.owners = { old: currentOwnerIds, new: ownerIds };
            // log action
            firebase.database().ref('costCenters/' + this.id).update({
                owners: ownerIds,
                title: title,
                description: description,
                parentId: parentId
            }).then(() => {
                logAction(ActionCode.EDIT_COST_CENTER, {
                    id: this.id,
                    edits: edits
                }).then(() => window.location = 'index.html'); // then refresh page
            });
        };
        modalDeleteBtn.onclick = () => {
            if (confirm("Are you sure to delete -" + this.title + "- ? this cannot be undone!")) {

                firebase.database().ref('costCenters/' + this.id).remove().then(() => {
                    logAction(ActionCode.DELETE_COST_CENTER, {
                        id: this.id,
                        archivedVersion: {
                            title: this.title,
                            description: this.description,
                            announcemets: this.announcements.map(a => a.id),
                            owners: this.owners.map(o => o.id),
                            parentId: this.parentId
                        }
                    }).then(() => window.location = 'index.html');

                });
            }
        };
        independentRadiobutton.oninput = inputValidatuionFunction;
        modalTitle.oninput = inputValidatuionFunction;
        modalDescription.oninput = inputValidatuionFunction;
        modalOwnersList.innerHTML = '';
        modalSaveBtn.onclick = submitFunction;
        Dashboard.allOwners.forEach(owner => {
            var checkbox = Generator.generateCheckbox('li', owner.name + ' - ' + owner.flatNumber, owner.id + '_editDetailsModalCheckbox', 'EditDetailsModalOwnerCheckbox');
            checkbox.classList.add('li-separator');
            checkbox.getElementsByTagName('input')[0].checked = this.findOwnerById(owner.id) ? true : false;
            checkbox.setAttribute('owner-id', owner.id);
            checkbox.oninput = inputValidatuionFunction;
            modalOwnersList.appendChild(checkbox);
        });
        var thisChildren = this.getChildren();
        Dashboard.allCostCenters.forEach(costCenter => {
            // closed parent tree check
            if (thisChildren.includes(costCenter)) return;
            if (this.id != costCenter.id) {
                var radiobutton = Generator.generateRadiobutton('li', costCenter.title, costCenter.id + '_editDetailsModalRadiobutton', 'EditDetailsModalOwnerRadiobutton');
                radiobutton.classList.add('li-separator');
                radiobutton.getElementsByTagName('input')[0].checked = this.parentId == costCenter.id ? true : false;
                radiobutton.setAttribute('costCenter-id', costCenter.id);
                radiobutton.oninput = inputValidatuionFunction;
                modalCostCentersList.appendChild(radiobutton);
            }
        });

    }

    onSubmit_Annouuncement() {
        var title = document.getElementById('announcementModal_Title').value;
        var totalCost = document.getElementById('announcementModal_TotalCost').value;
        if (title == null || title.length == 0 || isWhiteSpace(title)) {
            alert("announcement title cannot be empty!");
            return;
        }
        if (title.length > 30) {
            alert("announcement title is very long!");
            return;
        }
        if (totalCost <= 0) {
            alert("announcement total cost is very small!");
            return;
        }
        Announcement.createAnnouncement(this.id, title, totalCost);

    }

    onSubmit_Payment() {
        var validPayments = this.paymentModal_ValidatePaymentSelections();
        validPayments.forEach((vp) => {
            this.submitPayment(vp.announcementId, vp.ownerId, vp.amount)
        });
    }



}

class Dashboard {
    /**
     * @type {CostCenter[]}
     */
    static allCostCenters;
    /**
     * @type {Owner[]}
     */
    static allOwners;

    /**
     * 
     * @param {HTMLElement} container 
     */
    static loadCostCenters(container) {
        Dashboard.allCostCenters = [];
        firebase.database().ref('costCenters')
            .limitToLast(20)
            .on('value', (snapshot) => {
                var plainCostCenters = [];
                snapshot.forEach((snapshotChild) => {
                    var plainCostCenter = snapshotChild.val();
                    plainCostCenter.id = snapshotChild.key;
                    plainCostCenters.push(plainCostCenter);
                    var costCenter = Dashboard.findCostCenterById(plainCostCenter.id);
                    if (costCenter) { // already exists
                        costCenter.update(plainCostCenter);
                    } else {
                        Dashboard.allCostCenters.push(new CostCenter(plainCostCenter, container));
                    }
                });
                // filter out deleted cost centers
                Dashboard.allCostCenters = Dashboard.allCostCenters.filter((cc) => {
                    var match = plainCostCenters.find((pcc) => pcc.id == cc.id);
                    if (match == null) {
                        cc.disconnectAnnouncements();
                        cc.removeFromContainer();
                        return false;
                    }
                    return true;
                });
                if (currentUserRole == 'admin' || currentUserRole == 'editor')
                    document.getElementById('addExpenseButton').classList.remove('hidden')

            });
    }

    static loadOwners() {
        return firebase.database().ref('owners')
            .on('value', (snapshot) => {
                Dashboard.allOwners = [];
                snapshot.forEach((cSnapshoot) => {
                    var plainOwner = cSnapshoot.val();
                    plainOwner.id = cSnapshoot.key;
                    Dashboard.allOwners.push(new Owner(plainOwner));
                });
            });
    }

    static formatDate(timestamp) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var date = new Date(timestamp);
        return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
    }
    /**
     * 
     * @param {string} id 
     * @returns {CostCenter} if found, else it returns null
     */
    static findCostCenterById(id) {
        return this.allCostCenters.find((cc) => cc.id == id);
    }

    static findOwnerById(id) {
        return this.allOwners.find((o) => o.id == id);
    }

    static onButton_AddExpense() {
        var modalCostCentersList = document.getElementById('expenseModal_CostCentersList');
        var modalDetailsList = document.getElementById('expenseModal_DetailsList');
        var modalTotalExpense = document.getElementById('expenseModal_TotalExpense');
        var modalTitle = document.getElementById('expenseModal_Title');
        var modalSubmitBtn = document.getElementById('expenseModal_SubmitBtn');
        var modalAttachmentInput = document.getElementById('expenseModal_AttachmentInput');
        var modalAttachmentPreview = document.getElementById('expenseModal_AttachmentPreview');
        var modalShareValuesContainer = document.getElementById('expenseModal_ShareValuesContainer');
        modalDetailsList.innerHTML = '';
        modalTotalExpense.value = '';
        modalTitle.value = '';
        modalAttachmentInput.value = null;
        modalAttachmentPreview.src = "img/no_image_available.jpg";
        var shares = [];
        // load cost-centers list
        const inputFunction = () => {
            var isOk = true;
            modalDetailsList.innerHTML = '';
            // check title
            var title = modalTitle.value;
            var totalExpense = modalTotalExpense.value;
            if (title.length == 0 || title.length > 30 || isWhiteSpace(title)) {
                isOk = false;
                modalDetailsList.appendChild(Generator.generateErrorListItem('expense title is invalid'));
            }
            if (totalExpense <= 0) {
                modalDetailsList.appendChild(Generator.generateErrorListItem('total expense is very small'));
            }
            var checkedCostCenters = [];
            var checkboxes = document.getElementsByName('ExpenseCostCenterCheckbox');
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                    var costCenterId = checkbox.parentElement.getAttribute('cost-center-id');
                    checkedCostCenters.push(Dashboard.findCostCenterById(costCenterId));
                }
            });
            if (checkedCostCenters.length == 0) isOk = false;
            const sumArray = (array, length) => {
                var s = 0;
                for (let i = 0; i < length; i++) {
                    const e = Number(array[i].input.value);
                    s += e;
                }
                return s;
            }
            if (shares.length != checkedCostCenters.length) {
                while (shares.length < checkedCostCenters.length) {
                    let e = Generator.generateField("", 0, 'EGP');
                    e.input.oninput = inputFunction;
                    shares.push(e);
                }
                while (shares.length > checkedCostCenters.length) shares.pop();
                modalShareValuesContainer.innerHTML = '';
                shares.forEach((e, i) => {
                    e.label.innerHTML = checkedCostCenters[i].title;
                    shares[i].input.disabled = false;
                    shares[i].setAttribute('cost-center-id', checkedCostCenters[i].id);
                    modalShareValuesContainer.appendChild(e);
                });
                shares[shares.length - 1].input.disabled = true;
                shares[shares.length - 1].input.value = 100 - sumArray(shares, shares.length - 1);
            }
            if (shares.length > 0) {
                var lastPercentageValue = totalExpense - sumArray(shares, shares.length - 1);
                if (lastPercentageValue < 0) {
                    isOk = false;
                    modalDetailsList.appendChild(Generator.generateErrorListItem('incorrect shares'));
                }
                shares[shares.length - 1].input.value = lastPercentageValue;
                checkedCostCenters.forEach((costCenter, i) => {
                    var share = Number(shares.find(p => p.getAttribute('cost-center-id') == costCenter.id).input.value);
                    var costCenterExpense = share[i];
                    if (costCenterExpense > costCenter.calculateTotalSavings()) {
                        isOk = false;
                        modalDetailsList.appendChild(Generator.generateErrorListItem(costCenter.title + ': savings do not cover the expense'));
                    }
                });
            }
            modalSubmitBtn.disabled = !isOk;
        }

        const submitFuntion = () => {
            var checkboxes = document.getElementsByName('ExpenseCostCenterCheckbox');
            var attachmentInput = document.getElementById('expenseModal_AttachmentInput');

            var checkedCostCenters = [];
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                    var costCenterId = checkbox.parentElement.getAttribute('cost-center-id');
                    checkedCostCenters.push(Dashboard.findCostCenterById(costCenterId));
                }
            });


            let file = attachmentInput.files[0];
            if (file) {
                const fileReader = new FileReader();
                const canvas = document.querySelector('canvas');
                var image = new Image();
                fileReader.onload = function (e) {
                    image.src = fileReader.result;
                }
                image.onload = () => {
                    compressImage(canvas, image, 0.5, (blob) => {
                        var attachmentId = generateUUID();
                        firebase.storage().ref('expenses-attachments/' + attachmentId + '.jpg').put(blob);
                        checkedCostCenters.forEach((costCenter, i) => {
                            var costCenterExpense = shares[i].input.value;
                            costCenter.submitExpense(modalTitle.value, costCenterExpense, attachmentId);
                        });
                    });
                }
                fileReader.readAsDataURL(file);
            } else {
                checkedCostCenters.forEach((costCenter, i) => {
                    var costCenterExpense = shares[i].input.value;
                    costCenter.submitExpense(modalTitle.value, costCenterExpense);
                });
            }
        }
        modalTotalExpense.oninput = inputFunction;
        modalTitle.oninput = inputFunction;
        modalCostCentersList.innerHTML = '';
        modalSubmitBtn.disabled = true;
        modalSubmitBtn.onclick = submitFuntion;
        Dashboard.allCostCenters.forEach((costCenter) => {
            var checkbox = Generator.generateCheckbox('li', costCenter.title, costCenter.id + '_expenseCostCenter', 'ExpenseCostCenterCheckbox');
            checkbox.setAttribute('cost-center-id', costCenter.id);
            checkbox.oninput = inputFunction;
            modalCostCentersList.appendChild(checkbox);

        });

    }

}
Dashboard.loadOwners();

let ownersLoadWaitTimes = 0;
let ownersLoadWaitInterval = setInterval(() => {
    if (Dashboard.allOwners) {
        Dashboard.loadCostCenters(document.getElementById('costCentersContainer'));
        clearInterval(ownersLoadWaitInterval);
        return;
    }
    if (ownersLoadWaitTimes++ >= 100) {
        console.error('owners load timeout');
        clearInterval(ownersLoadWaitInterval);
    }
}, 100);

