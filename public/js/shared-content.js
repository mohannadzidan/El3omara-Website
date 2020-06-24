function __toggleSidebar() {
    var sidebar = document.getElementById("accordionSidebar");
    if (sidebar.classList.contains("toggled")) {
        sidebar.classList.remove('toggled');
    } else {
        sidebar.classList.add('toggled');
    }
}
$(function () {
    $("#topbar").load("sharedhtml/topbar.html");
    $("#accordionSidebar").load("sharedhtml/sidebar.html");
    $("#logoutModal").load("sharedhtml/logoutmodal.html");
});
