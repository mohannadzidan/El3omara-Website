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
                        return generateRowButtons(data);
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
    if (formData.name == null || formData.name == "" ||
        formData.flatNumber == null || formData.flatNumber == "" ||
        formData.phoneNumber == null || formData.phoneNumber == "") {
        alert(getLocaleString("embty_fields"));
        return;
    }
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
    // load the form
    document.getElementById("ownerModalLabel").innerHTML = "Add Owner";
    //clear fields
    fillOwnerFormData({
        name: "", flatNumber:"", phoneNumber:""
    });
    document.getElementById("ownerModalDoneBtn").onclick = () => addOwner(fetchOwnerFormData());
}

function showEditOwnerForm(id) {
    currentOwnerData = owners.find((o) => o.id == id);
    fillOwnerFormData(currentOwnerData);
    document.getElementById("ownerModalLabel").innerHTML = "Edit Owner";
    document.getElementById("ownerModalDoneBtn").onclick = () => {
        var formData = fetchOwnerFormData();
        var database = firebase.database();
        database.ref('owners/' + id).set({
            name: formData.name,
            flatNumber: formData.flatNumber,
            phoneNumber: formData.phoneNumber,
            id: id
        });
    }

}

function fetchOwnerFormData() {
    return {
        name: document.getElementById("ownerModalName").value,
        flatNumber: document.getElementById("ownerModalFlatNumber").value,
        phoneNumber: document.getElementById("ownerModalPhoneNumber").value
    }
}
function fillOwnerFormData(ownerData) {
    document.getElementById("ownerModalName").value = ownerData.name;
    document.getElementById("ownerModalFlatNumber").value = ownerData.flatNumber;
    document.getElementById("ownerModalPhoneNumber").value = ownerData.phoneNumber;
}

function generateRowButtons(id){
    var editBtn = "<a style=\"color:white\" class=\"white btn-primary btn-circle btn-sm m-1\" onclick=\"showEditOwnerForm(" + id + ")\" data-toggle=\"modal\" data-target=\"#ownerModal\"><i class=\"fas fa-pen\"></i></a>"
    var removeBtn = "<a style=\"color:white\" class=\"white btn-danger btn-circle btn-sm m-1\" onclick=\"removeOwner(" + id + ")\"><i class=\"fas fa-trash\"></i></a>"
    return editBtn+removeBtn;
}
