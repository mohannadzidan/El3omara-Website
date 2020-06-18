var roleFetchCallback = [];

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // fetch user data
        firebase.database().ref("users/" + user.uid).once('value', function (snapshot) {
            userData = snapshot.val();
            document.getElementById("topbar").style.visibility = "visible";
            document.getElementById("statusbarUserDisplayName").innerHTML = userData.displayName;
        });

        // fetch user role
        const invokeRoleFetchCallback = function (role){
            roleFetchCallback.forEach(callback => {
                callback(role);
            });
        }
        firebase.database().ref("roles/" + user.uid).once('value', function (snapshot) {
            if (snapshot.exists()) {
                var role = snapshot.val();
                switch (role) {
                    case "admin":
                        document.getElementById("editorToolsCollapseMenu").style.display = "block";
                        document.getElementById("adminToolsCollapseMenu").style.display = "block";
                        break;
                    case "editor":
                        document.getElementById("editorToolsCollapseMenu").style.display = "block";
                        break;
                }
                invokeRoleFetchCallback(role);
            }else{
                invokeRoleFetchCallback("none");
            }
        }).catch(function (error) {
            console.error(error.code + ": " + error.message);
        });
        document.body.style.display = "block"; // show loaded page
    }
    else {
        window.location = '/login.html';
    }
});
