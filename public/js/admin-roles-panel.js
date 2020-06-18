var users = [];
firebase.database().ref('users').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        var e = childSnapshot.val();
        users.push({
            email: e.email,
            uid: childSnapshot.key,
        });
    });
}).then(function (res) {
    var remaining = users.length;
    users.forEach(u => {
        firebase.database().ref('roles/' + u.uid).once('value', function (snapshot) {
            if (snapshot.exists()) {
                u.role = snapshot.val();
            } else {
                u.role = 'none';
            }
        }).then(function (res2) {
            remaining--;
            if (remaining == 0) {
                tabulateRoles();
            }
        });
    });
})
function tabulateRoles() {
    myUid = firebase.auth().currentUser.uid;
    var table = $('#rolesTable').DataTable({
        destroy: true,
        data: users,
        columns: [
            { data: 'email' },
            { data: 'uid' },
            { data: 'role' },
            {
                "mData": 'uid',
                "bSortable": false,
                "mRender": function (uid, type, full) {
                    if(uid == myUid) return '';
                    return generateDropDown(uid);
                }
            }
        ]
    });
}



function generateDropDown(uid) {
    var roleDropDown = `
        <button class="btn btn-primary dropdown-toggle" type="button" id="${uid}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Give Role</button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 38px, 0px);">
            <a class="dropdown-item" onclick="giveRole('${uid}', 'none')">User</a>
            <a class="dropdown-item" onclick="giveRole('${uid}', 'editor')">Editor</a>
            <a class="dropdown-item" onclick="giveRole('${uid}', 'admin')">Admin</a>
        </div>
  `;
    return roleDropDown;
}

function giveRole(uid, role) {
    console.log(uid +" "+role);
    firebase.database().ref('roles/' + uid).set(
        role
    ).then(function (res){
        users.find((u) => u.uid == uid).role = role;
        tabulateRoles();
    });
}