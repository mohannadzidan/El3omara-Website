function roundCurrency(n) {
    return LocaleStrings.replaceLocaleNumbers(Number(n).toFixed(2).toString());
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
    static radiobuttonsCounter = 0;
    static checkboxesCounter = 0;
    /**
     * @param {*} containerType 
     * @param {*} label 
     * @param {*} id 
     * @returns {HTMLElement}
     */
    static generateCheckbox(containerType, label, name) {
        var n = this.checkboxesCounter++;
        var htmlTemplate = `
            <input id="checkbox${n}" type="checkbox" ${name ? 'name="' + name + '"' : ''}/>
            <label for="checkbox${n}">${label}</label>
        `;
        var htmlElement = document.createElement(containerType);
        htmlElement.classList.add('custom-checkbox');
        htmlElement.innerHTML = htmlTemplate;
        htmlElement.setAttribute('name', name);
        return htmlElement;
    }

    /**
     * @param {*} containerType 
     * @param {*} label 
     * @param {*} id 
     * @returns {HTMLElement}
     */
    static generateRadiobutton(containerType, label, name) {
        let n = this.radiobuttonsCounter++;
        var htmlTemplate = `
            <input id="radio${n}" type="radio" name="${name}"/>
            <label for="radio${n}">${label}</label>
        `;
        var htmlElement = document.createElement(containerType);
        htmlElement.classList.add('custom-checkbox');
        htmlElement.innerHTML = htmlTemplate;
        htmlElement.setAttribute('name', name);
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
    static generateShareInput(containerType, title, totalAmount) {
        let htmlTemplate = ` 
            <a name="costCenterName">${title}</a>
            <div class="shares-input-group">
            <input class="w-50" name="shareAmount" type="number" min="0" step="0.01" required>
            <label class="mx-1 my-0">${LocaleStrings.getLocaleString('egp')}</label>
            <input class="w-50" name="sharePercentage" type="number" min="0" max="100" step="0.1" required>
            <label class="mx-1 my-0">%</label>
            </div>
         `;
        const shareInput = function (element) {
            if (element.name === 'shareAmount') {
                let sharePercentage = element.parentNode.querySelector('[name="sharePercentage"]')
                sharePercentage.value = (element.value / totalAmount * 100).toFixed(1);
            } else { // sharePercentage
                let shareAmount = element.parentNode.querySelector('[name="shareAmount"]')
                shareAmount.value = (element.value / 100 * totalAmount).toFixed(2);
            }
        };
        let htmlElement = document.createElement(containerType);
        htmlElement.classList.add('d-flex', 'justify-content-between', 'p-2');
        htmlElement.innerHTML = htmlTemplate;
        // set oninput callbacks
        let inputs = htmlElement.querySelectorAll('input');
        inputs.forEach(input => {
            input.oninput = () => shareInput(input);
        });
        return htmlElement;
    }
    static generateAmountInput(containerType, title, amount) {
        let htmlTemplate = ` 
            <a name="ownerName">${title}</a>
            <div class="amounts-input-group">
            <i name="deviation" data-toggle="tooltip" class="text-warning fas fa-exclamation-triangle" data-placement="top" hidden></i>
            <input name="amount" type="number" step="0.01" required>
            <label class="mx-1 my-0">${LocaleStrings.getLocaleString('egp')}</label>
            </div>
            `;
        let htmlElement = document.createElement(containerType);
        htmlElement.classList.add('d-flex', 'justify-content-between', 'p-2');
        htmlElement.innerHTML = htmlTemplate;
        var input = htmlElement.querySelector('input');
        var deviation = htmlElement.querySelector('[name="deviation"]');
        input.value = amount;
        input.oninput = () => {
            var val = input.value;
            var dev = val - amount;
            if (dev == 0) {
                deviation.hidden = true;
            } else if (dev > 0) {
                deviation.hidden = false;
                $(deviation).tooltip('dispose');
                $(deviation).tooltip({ title: LocaleStrings.getLocaleString('above_amount_warning', roundCurrency(dev)) });
            }
            else {
                deviation.hidden = false;
                $(deviation).tooltip('dispose');
                $(deviation).tooltip({ title: LocaleStrings.getLocaleString('below_amount_warning', roundCurrency(-dev)) });

            }
        };
        deviation.onclick = () => $(deviation).tooltip('toggle');
        return htmlElement;
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
        this.payments.forEach((p) => this.totalPayments += Number(Number(p.amount)));
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
        this.htmlElements.pendingPayments.innerHTML = LocaleStrings.replaceLocaleNumbers(this.pendingPayments.toString());
        this.htmlElements.date.innerHTML = LocaleStrings.formatDate(this.timestamp);
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
            } else if (confirm(LocaleStrings.getLocaleString('pending_payments_msg'))) {
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
            <a>${owner.name} - ${owner.flatNumber} - ${LocaleStrings.formatDate(p.timestamp)}</a>
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
                <i class="fas fa-flag text-primary" ></i>
                <a id="${this.id}_title"></a>
                <a class="text-secondary small">-</a>
                <a class="text-secondary small" id="${this.id}_date"></a>
            </h6>
            <div class="dropdown no-arrow ${currentUserRole != 'admin' && currentUserRole != 'editor' ? 'hidden' : ''}">
                <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink" x-placement="bottom-end" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-142px, 18px, 0px);">
                    <div class="dropdown-header">${LocaleStrings.getLocaleString('edit')}</div>
                    <a class="dropdown-item" disabled id="${this.id}_dropdownSchedule">${LocaleStrings.getLocaleString('schedule')}</a>
                    <a class="dropdown-item text-danger" id="${this.id}_dropdownDrop">${LocaleStrings.getLocaleString('drop')}</a>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="row no-gutters align-items-center">
                <div class="col-sm mb-1">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">${LocaleStrings.getLocaleString('total_cost')}</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                        <a id="${this.id}_totalCost"></a>
                        <a class="small">${LocaleStrings.getLocaleString('egp')}</a>
                    </div>
                </div>
                <input  style="display: none;" type="checkbox" id="${this.id}_paymentsCheckbox" name="${this.id}_tabCheckbox" label-id="${this.id}_paymentsLabel" tab-id="${this.id}_paymentsList">
                <label class="col-sm mb-1" for="${this.id}_paymentsCheckbox" id="${this.id}_paymentsLabel" name="${this.id}_tabLabel">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">${LocaleStrings.getLocaleString('payments')}</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                        <a id="${this.id}_totalPayments"></a>
                        <a class="small">${LocaleStrings.getLocaleString('egp')}</a>
                    </div>
                </label>
                <input style="display: none;" type="checkbox" id="${this.id}_pendingPaymentsCheckbox" name="${this.id}_tabCheckbox" label-id="${this.id}_pendingPaymentsLabel" tab-id="${this.id}_pendingPaymentsList">
                <label class="col-sm mb-1" for="${this.id}_pendingPaymentsCheckbox" id="${this.id}_pendingPaymentsLabel" name="${this.id}_tabLabel">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">${LocaleStrings.getLocaleString('pending')}</div>
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
        body.classList.add('card', 'shadow', 'my-1', 'border-primary');
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
    static rowContainer = null;
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
                <div class="dropdown-header">${LocaleStrings.getLocaleString('add')}</div>
                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#announcementModal"
                    id="${this.id}_dropdownAddAnnouncement">${LocaleStrings.getLocaleString('announcement')}</a>
                <a class="dropdown-item" href="#costCenterId" data-toggle="modal" data-target="#paymentModal"
                    id="${this.id}_dropdownAddPayment">${LocaleStrings.getLocaleString('payment')}</a>
                <div class="dropdown-header">${LocaleStrings.getLocaleString('edit')}</div>
                <a class="dropdown-item" href="#costCenterId" data-toggle="modal" data-target="#editCostCenterDetailsModal"
                    id="${this.id}_dropdownEditDetails">${LocaleStrings.getLocaleString('edit_details')}</a>
            </div>
        </div>
    </div>
    <!-- Card Body -->
    <div class="card-body shadow my-2">
        <div type=" text" class="mb-3" id="${this.id}_description"></div>
        <div class="row no-gutters align-items-center my-2">
            <div class="col-sm">
                <div class="row no-gutters align-items-center my-2">
                    <div class="col-auto mx-2">
                        <div class="icon-circle bg-primary">
                            <i class="fas fa-donate text-white"></i>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                            ${LocaleStrings.getLocaleString('savings')}</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                            <a id="${this.id}_totalSavings"></a>
                            <a class="small">${LocaleStrings.getLocaleString('egp')}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm">
                <div class="row no-gutters align-items-center my-2">
                    <div class="col-auto mx-2">
                        <div class="icon-circle bg-warning">
                            <i class="fas fa-donate text-white"></i>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                            ${LocaleStrings.getLocaleString('children_savings')}</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                            <a id="${this.id}_totalChildrenSavings"></a>
                            <a class="small">${LocaleStrings.getLocaleString('egp')}</a>
                        </div>
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
        `;
        var htmlElement = document.createElement('div');
        htmlElement.classList.add('col-lg-5', 'h-100', 'card', 'shadow', 'm-2', 'p-3');
        htmlElement.innerHTML = htmlTemplate;
        htmlElement.id = this.id + '_body';
        if (CostCenter.rowContainer == null) {
            CostCenter.rowContainer = document.createElement('div');
            CostCenter.rowContainer.classList.add('row', 'justify-content-center');
            CostCenter.rowContainer.appendChild(htmlElement);
            this.container.appendChild(CostCenter.rowContainer);
        } else {
            CostCenter.rowContainer.appendChild(htmlElement);
            CostCenter.rowContainer = null;
        }
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
        this.payments.forEach((p) => totalSavings += Number(p.amount));
        this.expenses.forEach(e => totalSavings -= Number(e.amount))
        return totalSavings;
    }
    submitPayment(announcementId, ownerId, amount, timestamp = new Date().getTime()) {
        var owner = this.findOwnerById(ownerId);
        var announcement = this.findAnnouncementById(announcementId);
        if (announcement == null || owner == null || amount == null || amount <= 0) {
            throw `Invalid Payment! args-> ${announcementId}=${announcement} ${ownerId}=${owner} ${amount}`;
        }
        var paymentId = generateUUID();
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

    submitExpense(reason, amount, attachmentUrl = '', timestamp = new Date().getTime()) {
        var expenseId = generateUUID();
        firebase.database().ref('expenses/' + expenseId).set({
            reason: reason,
            amount: amount,
            costCenterId: this.id,
            attachmentUrl: attachmentUrl,
            timestamp: timestamp
        }).then(() => logAction(ActionCode.SUBMIT_EXPENSE, {
            id: expenseId
        }));
    }

    onDropdown_AddPayment() {
        document.getElementById('paymentModalTitle').innerHTML = 'Payment - ' + this.title;
        var modalOwnersList = document.getElementById('paymentModalOwnersList');
        var modalAnnouncementsList = document.getElementById('paymentModalAnnouncementsList');
        var modalAmountsList = document.getElementById('paymentAmountsList');
        // reset all forms
        Fragments.selectFragment('paymentAnnouncementsFragment', 'paymentFragments');
        StepsProgressBar.select('paymentProgressBar', 0);
        document.querySelectorAll('[fragment-group="paymentFragments"]').forEach(f => f.reset());

        // load announcement of cost-center
        modalAnnouncementsList.innerHTML = '';
        this.announcements.forEach((a) => {
            var checkbox = Generator.generateRadiobutton('li', a.title, "paymentAnnouncementRadio");
            checkbox.querySelector('input').setAttribute('announcement-id', a.id);
            modalAnnouncementsList.appendChild(checkbox);
        });
        var announcementsFragment = document.getElementById('paymentAnnouncementsFragment');
        var ownersFragment = document.getElementById('paymentOwnersFragment');
        var amountsFragment = document.getElementById('paymentAmountsFragment');
        var announcement = null;
        // form submittion events
        announcementsFragment.onsubmit = () => {
            // get selected announcement
            var announcementId = announcementsFragment.querySelector('[name="paymentAnnouncementRadio"] input:checked').getAttribute('announcement-id');
            announcement = this.announcements.find(a => a.id == announcementId);
            // get owners who didn't pay yet
            var payers = this.owners.filter(o => announcement.payments.find(p => p.ownerId == o.id) == null)
            // construct owners list
            // load owners list
            modalOwnersList.innerHTML = '';
            payers.forEach((o) => {
                var checkbox = Generator.generateCheckbox('li', o.name, 'paymentOwnerCheckbox');
                modalOwnersList.appendChild(checkbox);
                checkbox.querySelector('input').setAttribute('owner-id', o.id);
            });
            // move to next fragment
            Fragments.selectFragment('paymentOwnersFragment', 'paymentFragments');
            StepsProgressBar.select('paymentProgressBar', 1);
        }
        ownersFragment.onsubmit = () => {
            var checkedOwnersIds = Array.from(ownersFragment.querySelectorAll('[name="paymentOwnerCheckbox"] input:checked')).map(a => a.getAttribute('owner-id'));
            // get checked owners
            var owners = this.owners.filter(o => checkedOwnersIds.includes(o.id));
            // generate amounts fields
            modalAmountsList.innerHTML = '';
            var paymentPerOwner = announcement.totalCost / this.owners.length;
            owners.forEach(o => {
                var field = Generator.generateAmountInput('li', o.name, paymentPerOwner);
                field.querySelector('input').setAttribute('owner-id', o.id);
                modalAmountsList.appendChild(field);
            });
            // move to next fragment
            Fragments.selectFragment('paymentAmountsFragment', 'paymentFragments');
            StepsProgressBar.select('paymentProgressBar', 2);
        }
        amountsFragment.onsubmit = () => {
            var announcementId = announcementsFragment.querySelector('[name="paymentAnnouncementRadio"] input:checked').getAttribute('announcement-id');
            var amounts = amountsFragment.querySelectorAll('input[name="amount"]');
            var timestamp = document.getElementById('paymentDateAndTime').valueAsNumber;
            // submit payments
            amounts.forEach(a => {
                this.submitPayment(announcementId, a.getAttribute('owner-id'), a.value, timestamp);
            });
            $('#paymentModal').modal('hide');
        }
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
        var independentRadiobutton = Generator.generateRadiobutton('li', LocaleStrings.getLocaleString('independent'), 'independent_editDetailsModalRadiobutton', 'EditDetailsModalOwnerRadiobutton');
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
            var checkbox = Generator.generateCheckbox('li', owner.name + ' - ' + owner.flatNumber, 'EditDetailsModalOwnerCheckbox');
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
        //reset all forms
        let modal = document.getElementById('expenseModal');
        let forms = modal.querySelectorAll('form');
        forms.forEach(f => f.reset());
        // go to first fragment
        Fragments.selectFragment('expenseDetailsFragment');
        StepsProgressBar.select('expenseProgressBar', 0);
        // generate and add cost-centers checkboxes
        let costCentersList = document.getElementById('expenseCostCentersList');
        costCentersList.innerHTML = '';
        Dashboard.allCostCenters.forEach((cc, i) => {
            let checkbox = Generator.generateCheckbox('li', cc.title, 'expenseCostCenterCheckbox')
            checkbox.classList.add('li-separator');
            checkbox.querySelector('input').setAttribute('cost-center-id', cc.id);
            costCentersList.appendChild(checkbox);
        });
        // set events of shares modal
        let expenseCostCentersFragment = document.getElementById('expenseCostCentersFragment');
        expenseCostCentersFragment.onsubmit = () => {
            Fragments.selectFragment('expenseSharesFragment');
            StepsProgressBar.select('expenseProgressBar', 2);
            // prepare shares list
            let sharesList = document.getElementById('expenseSharesList');
            let checkedBoxes = expenseCostCentersFragment.querySelectorAll('.custom-checkbox input:checked');
            let totalAmount = document.getElementById('expenseTotalAmount').value;
            sharesList.innerHTML = '';
            checkedBoxes.forEach(cb => {
                // fetch cost center
                let costCenterId = cb.getAttribute('cost-center-id');
                let costCenter = Dashboard.findCostCenterById(costCenterId);
                //generate element
                let shareElement = Generator.generateShareInput('li', costCenter.title, totalAmount);
                shareElement.classList.add('li-separator');
                // put cost center id attribute for inputs
                let inputs = shareElement.querySelectorAll('input');
                inputs.forEach(i => i.setAttribute('cost-center-id', costCenterId));
                // finally append the share element into the list
                sharesList.appendChild(shareElement);
            });
        }

    }

    static submitExpenseFromModal() {
        let expenseCostCentersFragment = document.getElementById('expenseCostCentersFragment');
        let expenseSharesFragment = document.getElementById('expenseSharesFragment');
        // get expense details
        let reason = document.getElementById("expenseReason").value;
        var timestamp = document.getElementById("expenseDateAndTime").valueAsNumber;
        let attachment = document.getElementById('expenseAttachmentInput').files[0];

        // get checked cost centers
        let costCenters = Array.from(expenseCostCentersFragment.querySelectorAll('.custom-checkbox input:checked'))
            .map(e => Dashboard.findCostCenterById(e.getAttribute('cost-center-id')));
        // get share amounts
        let shareAmounts = Array.from(expenseSharesFragment.querySelectorAll('[name="shareAmount"]')).map(e => e.value);

        // submit expenses
        if (attachment) {
            const fileReader = new FileReader();
            var image = new Image();
            const canvas = document.querySelector('canvas');
            fileReader.onload = function (e) {
                image.src = fileReader.result;
            }
            image.onload = () => {
                // compress image
                compressImage(canvas, image, 0.5, (blob) => {
                    firebase.storage().ref('expenses-attachments/' + generateUUID() + '.jpg')
                        .put(blob).then((res) => res.ref.getDownloadURL().then((url) => {
                            costCenters.forEach((cc, i) => {
                                cc.submitExpense(reason, shareAmounts[i], url, timestamp);
                            });
                            $("#expenseModal").modal('hide');
                        }));
                });
            }
            fileReader.readAsDataURL(attachment);
        } else {
            costCenters.forEach((cc, i) => {
                cc.submitExpense(reason, shareAmounts[i], '', timestamp);
            });
            $("#expenseModal").modal('hide');
        }

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

