function compressImage(canvas, image, ratio, blobCallback) {
    var newWidth = image.width, newHeight = image.height;
    if (image.width > 1280 || image.height > 1280) {
        if (image.width > image.height) {
            var widthHeightRatio = 1280 / image.width;
            newHeight = image.height * widthHeightRatio;
            newWidth = 1280;
        } else {
            var heightWidthRatio = 1280 / image.height;
            newWidth = image.width * heightWidthRatio;
            newHeight = 1280;
        }
    }
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
    canvas.toBlob(blobCallback, "image/jpeg", ratio);
}

function resizeImage(canvas, image, maxSize) {
    var newWidth = image.width, newHeight = image.height;
    if (image.width > maxSize || image.height > maxSize) {
        if (image.width > image.height) {
            var widthHeightRatio = maxSize / image.width;
            newHeight = image.height * widthHeightRatio;
            newWidth = maxSize;
        } else {
            var heightWidthRatio = maxSize / image.height;
            newWidth = image.width * heightWidthRatio;
            newHeight = maxSize;
        }
    }
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.getContext("2d").drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight);
}

