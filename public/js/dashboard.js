class DashboardHTML {
    static generateExpenseCard(expenseId, title, totalCost, totalPayments, pendingPayments, onPaymentCallback) {
        var htmlTemplate = `
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">${title}</h6>
            <div class="dropdown no-arrow">
                <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in"
                    aria-labelledby="dropdownMenuLink" x-placement="bottom-end"
                    style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(-142px, 19px, 0px);">
                    <div class="dropdown-header">Payments</div>
                    <a class="dropdown-item" href="#" onclick="${onPaymentCallback}">Add Payment(s)</a>
                    <div class="dropdown-header">Edit</div>
                    <a class="dropdown-item" href="#">Schedule</a><a class="dropdown-item" onclick="Dashboard.dropExpense('${expenseId}')">Drop</a>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="row no-gutters align-items-center">
                <div class="col mr-4">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Cost</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">${totalCost}LE</div>
                </div>
    
                <div class="col mr-4">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Payments</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">${totalPayments}LE</div>
                </div>
                <div class="col mr-4">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Pending Payments</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">${pendingPayments}</div>
                </div>
                <div class="col-auto">
                    <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
                </div>
            </div>
        </div>
        `;
        var htmlElement = document.createElement('div');
        htmlElement.classList.add('card', 'shadow', 'h-100', 'my-1', pendingPayments>0?'border-left-danger' : 'border-left-success');
        htmlElement.innerHTML = htmlTemplate;
        return htmlElement;
    }
    static generateCostCenterCard(title, description, containerId, costCenterId) {
        var htmlTemplate = `
        <!-- Card Header - Dropdown -->
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 class="m-0 font-weight-bold text-primary">${title}</h6>
            <div class="dropdown no-arrow">
                <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink"
                    x-placement="bottom-end"
                    style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(17px, 19px, 0px);">
                    <div class="dropdown-header">Expenses</div>
                    <a class="dropdown-item" href="#" data-toggle="modal" data-target="#addExpenseModal" onclick="DashboardHTML.onDropDownAddExpense('${costCenterId}')">Add Expense</a>
                    <div class="dropdown-header">Owner</div>
                    <a class="dropdown-item" href="#">Add Multi-Payment</a>
                    <div class="dropdown-header">Edit</div><a class="dropdown-item" href="#">Edit Details</a><a
                        class="dropdown-item" href="#">Delete</a>
                </div>
            </div>
        </div>
        <!-- Card Body -->
        <div class="card-body" id="${containerId}">
            <div type="text" class="mb-3">${description}</div>
        </div>
        `;
        var htmlElement = document.createElement('div');
        htmlElement.classList.add('card', 'shadow', 'mb-4');
        htmlElement.innerHTML = htmlTemplate;
        return htmlElement;
    }
    static onDropDownAddExpense(costCenterId) {
        var costCenter = Dashboard.allCostCenters.find((c) => c.uid == costCenterId);
        document.getElementById('addExpenseModalTitle').innerHTML = 'Add Expense ( ' + costCenter.title + ' )';
        document.getElementById('expenseModalAddBtn').onclick = () => DashboardHTML.onExpenseModalAdd(costCenterId);
    }
    static onExpenseModalAdd(costCenterId) {
        var expenseTitle = document.getElementById('expenseTitle').value;
        var expenseDescription = document.getElementById('expenseDescription').value;
        var expenseTotalCost = document.getElementById('expenseTotalCost').value;
        Dashboard.addExpense(expenseTitle, expenseDescription, expenseTotalCost, costCenterId);
    }
}

class Dashboard {
    static allExpenses = [];
    static allCostCenters = [];
    /**
     * Repeats some text a given number of times.
     *
     * @param {string} costCenterId
     * @param {HTMLElement} container
     */
    static loadExpenses(costCenterId, container, ownersCount) {
        var expenses = [];
        firebase.database().ref('expenses')
            .orderByChild('costCenterId')
            .equalTo(costCenterId)
            .once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((snapshotChild) => {
                        var expense = snapshotChild.val();
                        expense.uid = snapshotChild.key; // append additional data
                        expenses.push(expense);
                    });
                }
            }).then((res) => {
                expenses.forEach((e) => {
                    
                    firebase.database().ref('payments/' + e.uid).once('value', (snapshot) => {
                        var payments = [];
                        var totalPayments = 0;
                        if (snapshot.exists()) {
                            snapshot.forEach((snapshotChild) => {
                                var payment = snapshotChild.val();
                                payments.push(payment);
                                totalPayments += payment.amount;
                            });
                            
                            e.payments = payments; // append additional data
                        }
                        container.appendChild(
                            DashboardHTML.generateExpenseCard(e.uid, e.title, e.totalCost, totalPayments, ownersCount - payments.length, '')
                        );
                    });
                });
            });
    }
    static loadCostCenters(containerId) {
        Dashboard.allCostCenters = [];
        var container = document.getElementById(containerId);
        firebase.database().ref('costCenters')
            .once('value', (snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((snapshotChild) => {
                        var costCenter = snapshotChild.val();
                        var costCenterId = snapshotChild.key;
                        costCenter.uid = costCenterId;
                        Dashboard.allCostCenters.push(costCenter);
                        var htmlCC = DashboardHTML.generateCostCenterCard(costCenter.title, costCenter.description, costCenterId, costCenterId);
                        container.appendChild(htmlCC);
                        var cardBody = document.getElementById(costCenterId);
                        Dashboard.loadExpenses(costCenterId, cardBody, costCenter.owners.length);
                    });
                }
            });
    }

    static addExpense(title, description, totalCost, costCenterId) {
        var timestamp = new Date().getTime();
        var expenseId = generateUUID();
        var expense = {
            title: title,
            description: description,
            totalCost: totalCost,
            costCenterId: costCenterId,
            creationTimestamp: timestamp,
        }
        console.log(expense);
        var promise = firebase.database().ref('expenses/' + expenseId).set(expense).then((r) =>{
            return firebase.database().ref('costCenters/' + costCenterId).update({creationTimestamp: timestamp});
        });
        return promise;
    }

    static dropExpense(expenseId){
        firebase.database().ref('expenses/' + expenseId).remove();
        /**
         * should also remove all payments
         * will be implemented after payments
         */
        //firebase.database().ref('payments/' + expenseId).remove();
    }
}

Dashboard.loadCostCenters('costCentersContainer');