var justRegistered = false;
function validateAndRegisterAccount() {
    justRegistered = true;
    var email = document.getElementById("registerEmail").value;
    var password = document.getElementById("registerPassword").value;
    var passwordRepeat = document.getElementById("registerRepeatPassword").value;
    var displayName = document.getElementById("registerDisplayName").value;
    if (password != passwordRepeat) {
        document.getElementById("errorMessageCardContainer").style.display = "block";
        document.getElementById("errorMessageCard").innerHTML = getLocaleString("reg_password_mismatch");
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
        document.getElementById("errorMessageCardContainer").style.display = "block";
        // Handle Errors here.
        switch (error.code) {
            case 'auth/email-already-in-use':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_email_already_in_use");
                break;
            case 'auth/invalid-email':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_invalid_email");
                break;
            case 'auth/weak-password':
                document.getElementById("errorMessageCard").innerHTML = getLocaleString("auth_weak_password");
                break;
            default:
                console.log(error.message);
                break;
        }
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            document.body.style.display = "block";
        }else{
            firebase.database().ref('users/' + user.uid).set({
                email: email,
                displayName: displayName
            }).then(function onSucess(res) {
                window.location = "index.html";
            }).catch(function onError(err) {
                console.error(err);
            });
        }
    });
}