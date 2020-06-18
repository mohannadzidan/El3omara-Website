var googleSignIn = false;
function emailPasswordLogin() {

    var email = document.getElementById("emailField").value;
    var password = document.getElementById("passwordField").value;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        document.getElementById("errorMessageCardContainer").style.display = "block";
        switch (error.code) {
            case 'auth/invalid-email':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_invalid_email");
                break;
            case 'auth/user-disabled':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_user_disabled");
                break;
            case 'auth/user-not-found':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_user_not_found");

                break;
            case 'auth/wrong-password':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_wrong_password");
                break;
            default:
                console.log('unkown error code -> {' + error.code + '} : msg=' + error.message);
                break;
        }
    });
}
function signInWithGoogle() {
    console.log("signInWithGoogle");
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider).catch(function (error) {
        console.error(error);
    });
}