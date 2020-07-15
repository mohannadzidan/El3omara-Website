{
    // prevent form submissions
    let fragments = document.querySelectorAll(`.fragment`);
    fragments.forEach(f => {
        let callback = (event) => event.preventDefault();
        f.addEventListener('submit', callback);
    });
}
var Fragments = {
    selectFragment: function (fragmentId, fragmentsGroup) {
        let target = document.getElementById(fragmentId);
        if (!target) throw `fragment with id="${fragmentId}" not found!`;
        // show the fragment
        let fragments = fragmentsGroup? document.querySelectorAll(`.fragment[fragments-group="${fragmentsGroup}"]`) : document.querySelectorAll(`.fragment`);
        fragments.forEach(f => {
            //if (f.id != fragmentId && !f.hidden) f.classList.add('hide'); // animation
            if (f!= target) f.hidden = true;
        });
        target.hidden = false;
    }
}