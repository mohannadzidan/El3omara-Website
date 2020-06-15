var lang = {
    en : {
        auth_wrong_password : "The password that you've entered is incorrect.",
        auth_invalid_email:"The email address you've entered is not valid.",
        auth_user_not_found:"The email address that you've entered doesn't match any account.",
        auth_user_disabled:"Your account is disabled.",
        auth_email_already_in_use:"An account already exists with the given email address.",
        auth_weak_password:"The password is not strong enough.",
        reg_password_mismatch:"Your password and confirmation password do not match.",
        dashboard:"Dashboard",
        moderate:"Moderate",
        logout:"Logout",
        login:"Login",
        embty_fields:"Some of these fields cannot be embty!"
    },
    ar : {
        auth_wrong_password : "كلمة المرور التي ادخلتها غير صحيحة",
        auth_invalid_email: "عنوان البريد الالكتروني الذي ادخلته غير صحيح.",
        auth_user_not_found: "عنوان البريد الالكتروني الذي ادخلته لا يطابق اي حساب.",
        auth_user_disabled: "تم تعطيل هذا الحساب.",
        auth_email_already_in_use:"عنوان البريد الالكتروني الذي ادخلته مرتبط بحساب مسجل بالفعل.",
        auth_weak_password:"كلمة السر ضعيفة.",
        reg_password_mismatch:"كلمة السر التي ادخلتها لا تتطابق مع كلمة السر التأكيدية.",
        dashboard: "لوحة القيادة",
        moderate:"اشراف",
        logout:"تسجيل الخروج",
        login:"تسجيل الدخول",
        embty_fields:"بعض تلك الحقول لا يمكن ان يترك فارغا!"
    }
}
var currentLanguage = "en"; // will be loaded from user preferences
function getLocaleString(key){
    return lang[currentLanguage][key];
}

