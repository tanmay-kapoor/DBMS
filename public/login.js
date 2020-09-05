$("#password-checkbox").click(function() {
    if($(this).prop("checked") === true) {
        $("#password").attr("type", "text");
    } else {
        $("#password").attr("type", "password");
    }
});

function isValid(username) {
    const allowedChars = ['-', '_', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for(let i = 0; i<username.length; i++) {
        let ch = username.charAt(i);
        if(!(ch>='a' && ch<='z') && !(ch>='A' && ch<='Z') && !allowedChars.includes(ch)) {
            return false;
        }
    }
    return true;
}

$(".pass-btn").click(function() {
    alert("Check your email to get password");
});