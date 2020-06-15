
/*
    Bug:
        upon testing i found that authentication API doesn't support arabic letters displaynames.
        a solution for this maybe igonring authentication API display name and store additional
        user data (ie: name, prefered language, settings[if exists]) in the database under /users/uid 
*/
function validateAndRegisterAccount() {

    var email = document.getElementById("registerEmail").value;
    var password = document.getElementById("registerPassword").value;
    var passwordRepeat = document.getElementById("registerRepeatPassword").value;
    var firstName = document.getElementById("registerFirstName").value;
    var lastName = document.getElementById("registerLastName").value;
    if (password != passwordRepeat) {
        document.getElementById("errorMessageCardContainer").style.display = "block";
        document.getElementById("errorMessageCard").innerHTML = getLocaleString("reg_password_mismatch");
        return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result) {
        return result.user.updateProfile({
            displayName: firstName + ' ' + lastName
        })
    }).catch(function (error) {
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
}