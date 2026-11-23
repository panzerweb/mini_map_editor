
const canvas = document.getElementById("drawing-board");
const toolbar = document.getElementById("toolbar");
const ctx = canvas.getContext("2d");

// Canvas dimensions
const container = canvas.parentElement;
const rect = container.getBoundingClientRect();

canvas.width = rect.width;
canvas.height = rect.height;

let isPainting = false;
let lineWidth = 5;

// Terrain texture
const terrainTextures = {
    terrain1: "terrain1.avif",
    water: "water.jpg",
};

const terrainPatterns = {};
let selectedBrush = {
    type: "",
    value: ""
};


Object.entries(terrainTextures).forEach(([key, path]) => {
    const image = new Image();

    image.onload = () => {
        const pattern = ctx.createPattern(image, "repeat");

        if (pattern) {
            terrainPatterns[key] = pattern;
        }
    };

    image.onerror = () => {
        console.error(`Failed to load texture: ${path}`);
    };

    image.src = path;
});

const buttonGroups = document.querySelector(".button-groups");

buttonGroups.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (!button) return;

    const terrainId = button.id;

    if (!terrainPatterns[terrainId]) {
        console.warn(`Terrain "${terrainId}" is not ready`);
        return;
    }

    selectedBrush = {
        type: "terrain",
        value: terrainId
    };

    buttonGroups.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.id === terrainId);
    });
})

// Get coordinates relative to the canvas
function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (e.clientX - rect.left) * canvas.width / rect.width,
        y: (e.clientY - rect.top) * canvas.height / rect.height
    };
}

// Start painting
canvas.addEventListener("mousedown", (e) => {
    const pattern = getBrushStyle();

    if (!pattern) return;

    isPainting = true;

    const { x, y } = getMousePosition(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = pattern;

    // Draw a dot for single clicks
    ctx.lineTo(x, y);
    ctx.stroke();
});

// Draw terrain
canvas.addEventListener("mousemove", (e) => {
    if (!isPainting) return;

    const { x, y } = getMousePosition(e);

    ctx.lineTo(x, y);
    ctx.stroke();
});

// Stop painting
function stopPainting() {
    if (!isPainting) return;

    isPainting = false;
    ctx.beginPath();
}

canvas.addEventListener("mouseup", stopPainting);
canvas.addEventListener("mouseleave", stopPainting);
window.addEventListener("mouseup", stopPainting);

// Toolbar controls
toolbar.addEventListener("click", (e) => {
    if (e.target.id === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

toolbar.addEventListener("change", (e) => {
    if (e.target.id === "stroke") {
        selectedBrush = {
            type: "color",
            value: e.target.value
        };
        
        buttonGroups.querySelectorAll("button").forEach((btn) => {
            btn.classList.remove("active");
        });
    }

    if (e.target.id === "lineWidth") {
        lineWidth = Number(e.target.value);
    }
});

function getBrushStyle() {
    if (selectedBrush.type === "terrain") {
        return terrainPatterns[selectedBrush.value] ?? null;
    }

    if (selectedBrush.type === "color") {
        return selectedBrush.value;
    }

    return null;
}