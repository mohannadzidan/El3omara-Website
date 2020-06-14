var owners = [];
function tabulatedOwners() {
    var ownersRef = firebase.database().ref('owners');
    ownersRef.on('value', function (snapshot) {
        owners = [];
        snapshot.forEach(function (childSnapshot) {
            var e = childSnapshot.val();
            owners.push(e);
        });
        table = $('#ownersTable').DataTable({
            destroy: true,
            data: owners,
            columns: [
                { data: 'name' },
                { data: 'flatNumber' },
                { data: 'phoneNumber' },
                {
                    "mData": 'id',
                    "bSortable": false,
                    "mRender": function (data, type, full) {
                        return iconButton('primary', "showEditOwnerForm(" + data + ")", 'pen') +
                            iconButton('danger', "removeOwner(" + data + ")", 'trash');
                    }
                }
            ]

        });
    });
}

function removeOwner(id) {
    owner = owners.find((o) => o.id == id);
    if (confirm("Are you sure to remove " + owner.name + "? (this cannot be undone)")) {
        firebase.database().ref("owners/" + id).remove()
    }
}

function addOwner(formData) {
    var date = new Date();
    var id = date.getTime();
    var database = firebase.database();
    var isSafe = true;
    for (const o of owners) {
        if (formData.name == o.name) {
            alert("An owner of same name exists!");
            isSafe = false;
            break;
        }
        else if (formData.flatNumber == o.flatNumber) {
            alert("An owner of same flat number exists!");
            isSafe = false;
            break;
        }
        else if (formData.phoneNumber == o.phoneNumber) {
            alert("An owner of same phone number exists!");
            isSafe = false;
            break;
        }
    }

    if (isSafe)
        database.ref('owners/' + id).set({
            name: formData.name,
            flatNumber: formData.flatNumber,
            phoneNumber: formData.phoneNumber,
            id: id
        });
}
function showAddOwnerForm() {
    var form = document.getElementById("ownerForm");
    // load the form
    document.getElementById("ownerFormHeader").innerHTML = "Add Owner";
    // display
    form.style.display = "block";
    // set events
    form.onsubmit = () => {
        var formData = fetchOwnerFormData();
        addOwner(formData);
        closeForm('ownerForm');
    }
}

function showEditOwnerForm(id) {
    currentOwnerData = owners.find((o)=>o.id == id);
    fillOwnerFormData(currentOwnerData);
    var form = document.getElementById("ownerForm");
    // load the form
    document.getElementById("ownerFormHeader").innerHTML = "Edit Owner";
    // display
    form.style.display = "block";
    // set 
    form.onsubmit = () => {
        var formData = fetchOwnerFormData();
        var database = firebase.database();
        database.ref('owners/' + id).set({
            name: formData.name,
            flatNumber: formData.flatNumber,
            phoneNumber: formData.phoneNumber,
            id: id
        });
        closeForm('ownerForm');
    }
}

function fetchOwnerFormData() {
    return {
        name: document.getElementById("ownerFormName").value,
        flatNumber: document.getElementById("ownerFormFlatNumber").value,
        phoneNumber: document.getElementById("ownerFormPhoneNumber").value
    }
}
function fillOwnerFormData(ownerData) {
    document.getElementById("ownerFormName").value = ownerData.name;
    document.getElementById("ownerFormFlatNumber").value = ownerData.flatNumber;
    document.getElementById("ownerFormPhoneNumber").value = ownerData.phoneNumber;
}

function closeForm(formName) {
    document.getElementById(formName).style.display = "none";
}

function iconButton(type, onclick, icon) {
    return "<a style=\"color:white\" class=\"white btn-" + type + " btn-circle btn-sm\" onclick=\"" + onclick + "\"><i class=\"fas fa-" + icon + "\"></i></a>"
}