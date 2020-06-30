var owners = [];
firebase.database().ref('owners').on('value', function (snapshot) {
    owners = [];
    snapshot.forEach(function (childSnapshot) {
        var e = childSnapshot.val();
        e.id = childSnapshot.key;
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

function removeOwner(id) {
    owner = owners.find((o) => o.id == id);
    if (confirm(LocaleStrings.getLocaleString('remove_owner_msg' ,owner.name))) {
        firebase.database().ref("owners/" + id).remove();
        logAction(ActionCode.DELETE_OWNER, {
            id: id,
            archivedVersion: owner
        });
    }
}

function addOwner(formData) {
    var id = generateUUID();
    var database = firebase.database();
    var isSafe = true;
    if (formData.name == null || formData.name == "" ||
        formData.flatNumber == null || formData.flatNumber == "" ||
        formData.phoneNumber == null || formData.phoneNumber == "") {
        alert(LocaleStrings.getLocaleString("empty_fields_msg"));
        return;
    }
    for (const o of owners) {
        if (formData.name == o.name) {
            alert(LocaleStrings.getLocaleString('dublicated_name_msg'));
            isSafe = false;
            break;
        }
        else if (formData.flatNumber == o.flatNumber) {
            alert(LocaleStrings.getLocaleString('dublicated_flat_number_msg'));
            isSafe = false;
            break;
        }
        else if (formData.phoneNumber == o.phoneNumber) {
            alert(LocaleStrings.getLocaleString('dublicated_phone_number_msg'));
            isSafe = false;
            break;
        }
    }

    if (isSafe) {
        database.ref('owners/' + id).set({
            name: formData.name,
            flatNumber: formData.flatNumber,
            phoneNumber: formData.phoneNumber,
        });
        logAction(ActionCode.ADD_OWNER, { id: id });
    }
}
function showAddOwnerForm() {
    // load the form
    document.getElementById("ownerModalLabel").innerHTML = "Add Owner";
    //clear fields
    fillOwnerFormData({
        name: "", flatNumber: "", phoneNumber: ""
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
        var args = {
            id: id,
            edits: {},
        }
        if (currentOwnerData.name != formData.name) {
            args.edits.name = { old: currentOwnerData.name, new: formData.name };
        }
        if (currentOwnerData.flatNumber != formData.flatNumber) {
            args.edits.flatNumber = { old: currentOwnerData.flatNumber, new: formData.flatNumber };
        }
        if (currentOwnerData.phoneNumber != formData.phoneNumber) {
            args.edits.phoneNumber = { old: currentOwnerData.phoneNumber, new: formData.phoneNumber };
        }
        database.ref('owners/' + id).update({
            name: formData.name,
            flatNumber: formData.flatNumber,
            phoneNumber: formData.phoneNumber,
        }).then(() => logAction(ActionCode.EDIT_OWNER, args));
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

function generateRowButtons(id) {
    var editBtn = `
    <a class="btn btn-light p-1 m-0" onclick="showEditOwnerForm('${id}')" data-toggle="modal" data-target="#ownerModal">
        <i class="fas fa-pen text-primary"></i>
    </a>`
    var removeBtn = `
    <a class="btn btn-light p-1 m-0" onclick="removeOwner('${id}')">
        <i class="fas fa-trash text-danger"></i>
    </a>`
    return editBtn + removeBtn;
}
