const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.id = 'particle-canvas';
document.body.insertBefore(canvas, document.body.firstChild);

// Canvas Styling
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none';

let width, height;
let particles = [];
let webParticles = [];
const numParticles = 900; 
const numWebs = 70; // Low count required for spider web O(N^2) math
let mouse = { x: -1000, y: -1000 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// The massive dot halo
class Particle {
    constructor() {
        this.distance = Math.random() * 250 + 160; // Outer halo
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() - 0.5) * 0.015;
        this.size = Math.random() * 2 + 0.5; 
        this.isAccent = Math.random() > 0.88;
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.friction = Math.random() * 0.08 + 0.02; 
    }
    
    update(time) {
        if (mouse.x === -1000) return; 
        this.angle += this.speed;
        let currentDistance = this.distance + Math.sin(time * 0.002 + this.angle) * 20;
        let targetX = mouse.x + Math.cos(this.angle) * currentDistance;
        let targetY = mouse.y + Math.sin(this.angle) * currentDistance;
        this.x += (targetX - this.x) * this.friction;
        this.y += (targetY - this.y) * this.friction;
    }
    
    draw() {
        if (mouse.x === -1000) return;
        let alpha = 1 - ((this.distance - 160) / 250);
        alpha = Math.max(0.15, alpha * 0.9); 
        ctx.fillStyle = this.isAccent ? `rgba(237, 137, 54, ${alpha})` : `rgba(49, 130, 206, ${alpha})`; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- 3D Buckyball (Buckminsterfullerene) Geometry Generator ---
const phi = (1 + Math.sqrt(5)) / 2;
const icoVerts = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
];

let icoEdges = [];
for(let i=0; i<12; i++) {
    for(let j=i+1; j<12; j++) {
        let dx = icoVerts[i][0] - icoVerts[j][0];
        let dy = icoVerts[i][1] - icoVerts[j][1];
        let dz = icoVerts[i][2] - icoVerts[j][2];
        if (Math.abs(Math.sqrt(dx*dx + dy*dy + dz*dz) - 2.0) < 0.1) icoEdges.push([i, j]);
    }
}

let buckyVertsBase = [];
for(let i=0; i<icoEdges.length; i++) {
    let v1 = icoVerts[icoEdges[i][0]], v2 = icoVerts[icoEdges[i][1]];
    // Truncate at 1/3 and 2/3
    buckyVertsBase.push([v1[0] + (v2[0]-v1[0])/3, v1[1] + (v2[1]-v1[1])/3, v1[2] + (v2[2]-v1[2])/3]);
    buckyVertsBase.push([v1[0] + 2*(v2[0]-v1[0])/3, v1[1] + 2*(v2[1]-v1[1])/3, v1[2] + 2*(v2[2]-v1[2])/3]);
}

let buckyEdges = [];
for(let i=0; i<60; i++) {
    for(let j=i+1; j<60; j++) {
        let dx = buckyVertsBase[i][0] - buckyVertsBase[j][0];
        let dy = buckyVertsBase[i][1] - buckyVertsBase[j][1];
        let dz = buckyVertsBase[i][2] - buckyVertsBase[j][2];
        if (Math.abs(Math.sqrt(dx*dx + dy*dy + dz*dz) - (2/3)) < 0.05) buckyEdges.push([i, j]);
    }
}

// Center the Buckyball mathematically
let cx=0, cy=0, cz=0;
for(let i=0; i<60; i++) {
    cx += buckyVertsBase[i][0];
    cy += buckyVertsBase[i][1];
    cz += buckyVertsBase[i][2];
}
cx/=60; cy/=60; cz/=60;
for(let i=0; i<60; i++) {
    buckyVertsBase[i][0] -= cx;
    buckyVertsBase[i][1] -= cy;
    buckyVertsBase[i][2] -= cz;
}

let rotX = 0, rotY = 0, rotZ = 0;
function rotate3D(v, ax, ay, az) {
    let x = v[0], y = v[1], z = v[2];
    let cosX = Math.cos(ax), sinX = Math.sin(ax);
    let y1 = y*cosX - z*sinX, z1 = y*sinX + z*cosX; y = y1; z = z1;
    let cosY = Math.cos(ay), sinY = Math.sin(ay);
    let x1 = x*cosY + z*sinY, z2 = -x*sinY + z*cosY; x = x1; z = z2;
    let cosZ = Math.cos(az), sinZ = Math.sin(az);
    let x2 = x*cosZ - y*sinZ, y2 = x*sinZ + y*cosZ; x = x2; y = y2;
    return [x, y, z];
}

function drawBuckyball() {
    if (mouse.x === -1000) return;
    
    // Smooth, automatic continuous rotation
    rotX += 0.002;
    rotY += 0.003;
    rotZ += 0.001;
    
    // Scale model to cover roughly 1/4 of the screen area
    let scale = Math.min(width, height) / 2.5; 
    
    let projectedVerts = [];
    for(let i=0; i<60; i++) {
        let rv = rotate3D(buckyVertsBase[i], rotX, rotY, rotZ);
        projectedVerts.push([rv[0] * scale, rv[1] * scale, rv[2] * scale]);
    }
    
    // PINNING PHYSICS: Force Vertex #0 to exactly match the mouse (x, y) coordinates
    let anchor = projectedVerts[0];
    let centerX = mouse.x - anchor[0];
    let centerY = mouse.y - anchor[1];
    
    // Draw edges
    ctx.lineWidth = 1.2;
    for(let i=0; i<buckyEdges.length; i++) {
        let v1 = projectedVerts[buckyEdges[i][0]];
        let v2 = projectedVerts[buckyEdges[i][1]];
        
        // Dynamic Depth Fading
        let zDist = (v1[2] + v2[2]) / 2;
        let depthRatio = (zDist / scale + 1) / 2; // Normalizes to 0-1
        let alpha = 0.05 + depthRatio * 0.25; // Fainter lines
        
        ctx.strokeStyle = `rgba(49, 130, 206, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(centerX + v1[0], centerY + v1[1]);
        ctx.lineTo(centerX + v2[0], centerY + v2[1]);
        ctx.stroke();
    }
    
    // Draw 60 Vertices
    for(let i=0; i<60; i++) {
        let v = projectedVerts[i];
        let depthRatio = (v[2] / scale + 1) / 2; 
        let alpha = 0.05 + depthRatio * 0.35; // Fainter dots
        
        if (i === 0) {
            // Pinned Vertex (Below Cursor) - Made slightly less intense
            ctx.fillStyle = `rgba(237, 137, 54, 0.7)`; 
            ctx.beginPath();
            ctx.arc(centerX + v[0], centerY + v[1], 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = `rgba(49, 130, 206, ${alpha})`;
            ctx.beginPath();
            ctx.arc(centerX + v[0], centerY + v[1], 1.5 + depthRatio * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) particles.push(new Particle());
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);
    
    // 1. Draw Massive Buckyball Wireframe
    drawBuckyball();
    
    // 2. Draw outer 3600-dot halo
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(time);
        particles[i].draw();
    }
    
    requestAnimationFrame(animate);
}

// Start
resize();
initParticles();
animate(0);
