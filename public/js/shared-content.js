function __toggleSidebar() {
    var sidebar = document.getElementById("accordionSidebar");
    if (sidebar.classList.contains("toggled")) {
        sidebar.classList.remove('toggled');
    } else {
        sidebar.classList.add('toggled');
    }
}
var SharedContent = {
    addOnLoadListner: (callback) => {
        if (!SharedContent.loadCallbacks) SharedContent.loadCallbacks = [];
        SharedContent.loadCallbacks.push(callback);
    }
}
{
    let loadSharedContent = (loadRequests) => {
        let remainingRequests = loadRequests.length;
        loadRequests.forEach(clr => {
            let request = new XMLHttpRequest();
            request.open('GET', clr.path, true);
            request.onreadystatechange = function () {
                if (this.status !== 200) throw "couldn't find shared content!";
                document.getElementById(clr.containerId).innerHTML = this.responseText;
                if (--remainingRequests == 0 && SharedContent.loadCallbacks)
                    SharedContent.loadCallbacks.forEach(callback => callback());
            };
            request.send();
        });
    }
    loadSharedContent([
        {path: 'sharedhtml/sidebar.html', containerId: 'accordionSidebar'},
        {path: 'sharedhtml/logoutmodal.html', containerId: 'logoutModal'},
        {path: 'sharedhtml/topbar.html', containerId: 'topbar'}
    ]);

}
