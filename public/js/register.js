firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        firebase.database().ref('users/' + user.uid).on('value', (snapshot) => {
            if (snapshot.exists()) {
                window.location = "index.html";
            } else {
                document.getElementById('splashScreen').hidden = true;
            }
        });
        selectFragment('personalInfoForm');
    } else {
        selectFragment('registerationDataForm');
        document.getElementById('splashScreen').hidden = true;

    }
});

// prevent form submissions
let fragments = document.querySelectorAll(`.fragment`);
fragments.forEach(f => {
    let callback = (event) => event.preventDefault();
    f.addEventListener('submit', callback);
});
// add events for image input
{
    let fileInput = document.getElementById('fileInput');
    let displayImage = document.getElementById('displayImage');
    let displayImageWrapper = document.querySelector('.display-image');
    // set on remove click
    displayImageWrapper.querySelector('a').onclick = () => {
        fileInput.value = null;
        displayImage.src = "img/no-user-image.jpg";
        displayImageWrapper.classList.remove('remove');
    };
    fileInput.addEventListener('change', (e) => {
        let file = fileInput.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                displayImage.src = fileReader.result;
            }
            fileReader.readAsDataURL(file);
            displayImageWrapper.classList.add('remove');
        } else {
            displayImageWrapper.classList.remove('remove');
        }
    });
}



function selectFragment(fragmentId) {
    let target = document.getElementById(fragmentId);
    if (!target) return;
    // update progress bar
    let progressItemIndex = target.getAttribute('progress-item-index');
    if (progressItemIndex) StepsProgressBar.select('mainProgressBar', progressItemIndex);
    // show the fragment
    let fragments = document.querySelectorAll(`.fragment`);
    fragments.forEach(f => {
        //if (f.id != fragmentId && !f.hidden) f.classList.add('hide'); // animation
        if (f.id != fragmentId && !f.hidden) f.hidden = true;
    });
    target.hidden = false;
}

function registerAccount() {
    justRegistered = true;
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var passwordRepeat = document.getElementById("repeatPassword");
    if (password.value != passwordRepeat.value) {
        password.setCustomValidity("password mismatch!");
        password.reportValidity();
        return;
    }
    console.log(email.value);
    firebase.auth().createUserWithEmailAndPassword(email.value, password.value).catch(function (error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                email.setCustomValidity(LocaleStrings.getLocaleString("email_already_in_use"));
                email.reportValidity();
                break;
            case 'auth/invalid-email':
                email.setCustomValidity(LocaleStrings.getLocaleString("invalid_email"));
                email.reportValidity();
                break;
            case 'auth/weak-password':
                password.setCustomValidity(LocaleStrings.getLocaleString("weak_password"));
                password.reportValidity();
                break;
            default:
                console.log(error.message);
                break;
        }
    });

}
function completeRegisteration() {
    let fileInput = document.getElementById('fileInput');
    let displayName = document.getElementById('displayName');
    let file = fileInput.files[0];
    const submitData = (imgBlob) => {
        document.getElementById('savePersonalInfoBtn').disabled = true;
        let user = firebase.auth().currentUser;
        // upload image 
        if (imgBlob) {
            firebase.storage().ref('users-profile-pictures/' + user.uid + '.jpg')
                .put(imgBlob)
                .then((res) => res.ref.getDownloadURL()
                    .then((url) => user.updateProfile({
                        displayName: document.getElementById('displayName').value,
                        photoURL: url
                    })
                        .then(() => firebase.database().ref('users/' + user.uid).set({ displayName: user.displayName, email: user.email }))));
        } else {
            user.updateProfile({
                displayName: displayName.value
            })
                .then(() => firebase.database().ref('users/' + user.uid).set({ displayName: displayName.value, email: user.email }));
        }
        // firebase.ref('users/' + user.uid).set({
        //   displayName: displayName,
        //   email: user.email
        // });
    }
    if (file) {
        const fileReader = new FileReader();
        var image = new Image();
        const canvas = document.querySelector('canvas');
        fileReader.onload = function (e) {
            image.src = fileReader.result;
        }
        image.onload = () => {
            compressImage(canvas, image, 0.5, (blob) => {
                submitData(blob);
            });
        }
        fileReader.readAsDataURL(file);
    } else {
        submitData();
    }
}
