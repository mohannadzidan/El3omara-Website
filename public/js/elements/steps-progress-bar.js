var StepsProgressBar = {
    select: (id, index) => {
        let elements = document.querySelectorAll(`[progress-bar-id="${id}"] .steps-progress-bar-item`);
        let links = document.querySelectorAll(`[progress-bar-id="${id}"] .steps-link`);

        for (let i = 0; i <= index; i++) {
            const element = elements[i];
            element.classList.add('done');

        }
        for (let i = index + 1; i < elements.length; i++) {
            const element = elements[i];
            element.classList.remove('done');
        }
        for (let i = 0; i < links.length; i++) {
            const element = links[i];
            if (i < index) element.classList.add('done');
            else element.classList.remove('done');

        }
    }
}