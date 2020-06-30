var allOwners = [];
var allCostCenters = [];
var allPayments = [];
var allExpenses = [];


function findCostCenterById(id) {
    return allCostCenters.find((cc) => cc.id == id);
}

function findOwnerById(id) {
    return allOwners.find((o) => o.id == id);
}
function viewAttachment(id) {
    firebase.storage().ref('expenses-attachments/' + id + '.jpg').getDownloadURL().then((res) => {
        var pswpElement = document.querySelectorAll('.pswp')[0];
        // build items array
        var items = [
            {
                src: res,
                w: 1200,
                h: 900
            }
        ];
        // define options (if needed)
        var options = {
            // optionName: 'option value'
            // for example:
            index: 0 // start at first slide
        };
        // Initializes and opens PhotoSwipe
        var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
        console.log("galaeeeee");
    }).catch( (err) => {
        alert("failed to load attachment!");
        console.error(err);
    });
}
function generateAttachmentButton(id) {
    return `
        <a href="#" class="btn p-0"  data-toggle="modal" data-target="#previewModal" onclick="viewAttachment('${id}')">
            <i class="fas fa-paperclip text-primary"></i>
        </a>
    `;
}
var allPromises = [];
var db = firebase.database();
allPromises.push(db.ref('owners').once('value', (snapshot) => {
    snapshot.forEach((spChild) => {
        var owner = spChild.val();
        owner.id = spChild.key;
        allOwners.push(owner);
    });
}));
allPromises.push(db.ref('costCenters').once('value', (snapshot) => {
    snapshot.forEach((spChild) => {
        var costCenter = spChild.val();
        costCenter.id = spChild.key;
        allCostCenters.push(costCenter);
    });
}));
allPromises.push(db.ref('payments').once('value', (snapshot) => {
    snapshot.forEach((spChild) => {
        var payment = spChild.val();
        payment.id = spChild.key;
        allPayments.push(payment);
    });
}));
allPromises.push(db.ref('expenses').once('value', (snapshot) => {
    snapshot.forEach((spChild) => {
        var expense = spChild.val();
        expense.id = spChild.key;
        allExpenses.push(expense);
    });
}));

Promise.all(allPromises).then(() => {
    /**
     * id
     * ownerName + ownerFlatnumber
     * amount
     * Attachment
     * Reason
     * Cost-Center Title
     * Timestamp
     */
    var transactions = [];
    allPayments.forEach(p => {
        var owner = findOwnerById(p.ownerId);
        var costCenter = findCostCenterById(p.costCenterId);
        transactions.push({
            id: p.id,
            ownerDetails: owner.name + " - " + owner.flatNumber,
            amount: LocaleStrings.replaceLocaleNumbers(Number(p.amount).toFixed(2)),
            reason: p.reason,
            costCenterTitle: costCenter.title,
            timestamp: LocaleStrings.formatDate(p.timestamp)
        });
    });
    allExpenses.forEach(e => {
        var costCenter = findCostCenterById(e.costCenterId);
        transactions.push({
            id: e.id,
            ownerDetails: '-',
            amount: Number(-e.amount).toFixed(2),
            attachmentId: e.attachmentId,
            reason: e.reason,
            costCenterTitle: costCenter.title,
            timestamp: LocaleStrings.formatDate(e.timestamp)
        });
    });
    table = $('#transactionsTable').DataTable({
        destroy: true,
        data: transactions,
        autoWidth: false,
        columns: [
            { data: 'timestamp' },
            {
                "mData": 'amount',
                "mRender": function (data, type, row) {
                    if (data < 0) {
                        return `<a class="text-danger">${data}</a>`;
                    } else {
                        return `<a class="text-success">${data}</a>`;
                    }
                }

            },
            { data: 'reason' },
            { data: 'ownerDetails' },
            { data: 'costCenterTitle' },
            {
                "mData": 'attachmentId',
                "bSortable": false,
                "mRender": function (data, type, row) {
                    if (data) {
                        return generateAttachmentButton(data);
                    } else {
                        return '-';
                    }
                }
            },
        ]
    });
});