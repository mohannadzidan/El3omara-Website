var currentUserRole;
{
    let authScript = document.currentScript;
    let allRoleCallbackListeners = [];
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // fetch user data
            if (user.photoURL) {
                SharedContent.addOnLoadListner(() => {
                    document.getElementById("statusbarUserDisplayImage").src = user.photoURL;
                });
            }
            firebase.database().ref("users/" + user.uid).once('value', function (snapshot) {
                userData = snapshot.val();
                if (userData) {
                    SharedContent.addOnLoadListner(() => {
                        document.getElementById("statusbarUserDisplayName").innerHTML = userData.displayName;
                    });
                    document.getElementById("splashScreen").hidden = true; // show loaded page
                } else {
                    window.location = 'register.html';
                }

            });

            // fetch user role
            const roleFetchCallback = function (role) {
                currentUserRole = role;
                let requirements = authScript.getAttribute('require-role');
                if (requirements && !requirements.split('|').includes(role)) {
                    window.location = 'permission-denied.html';
                } else {
                    allRoleCallbackListeners.forEach(listener => listener(role));
                }

            }
            firebase.database().ref("roles/" + user.uid).once('value', function (snapshot) {
                roleFetchCallback(snapshot ? snapshot.val() : 'none');
                if (snapshot.exists()) {
                    var role = snapshot.val();
                    SharedContent.addOnLoadListner(() => {

                        switch (role) {
                            case "admin":
                                document.getElementById("editorToolsCollapseMenu").style.display = "block";
                                document.getElementById("adminToolsCollapseMenu").style.display = "block";
                                break;
                            case "editor":
                                document.getElementById("editorToolsCollapseMenu").style.display = "block";
                                break;
                        }
                    });
                }
            }).catch(function (error) {
                console.error(error.code + ": " + error.message);
            });

        }
        else {
            window.location = '/login.html';
        }
    });

    function addRoleCallbackListener(listener) {
        allRoleCallbackListeners.push(listener);
    }

}
