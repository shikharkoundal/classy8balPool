// script/core/ResourceLoader.js
export async function loadImage(path) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = e => rej(e);
        img.src = path;
    });
}

export async function loadSprites(map) {
    const sprites = {};
    const entries = Object.entries(map);
    for (const [key, url] of entries) {
        sprites[key] = await loadImage(url);
    }
    return sprites;
}
