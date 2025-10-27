// utils/cropImage.js
export async function getCroppedImg(imageSrc, pixelCrop, fileName = 'crop.jpg') {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // tamaño del recorte en píxeles
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );

    // a Blob
    const blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92)
    );

    // opcional: convertir a File (útil para FormData)
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(blob);

    return { blob, file, previewUrl };
}
