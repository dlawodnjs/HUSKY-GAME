// Presents a low-res Surface on a visible canvas at an integer pixel scale,
// optionally zoomed in on a point (camera). Browser only.

export class Screen {
  constructor(canvas, w, h) {
    this.canvas = canvas;
    this.w = w;
    this.h = h;
    this.buffer = document.createElement('canvas');
    this.buffer.width = w;
    this.buffer.height = h;
    this.bctx = this.buffer.getContext('2d');
    this.image = this.bctx.createImageData(w, h);
    this.pixels = new Uint32Array(this.image.data.buffer);
    this.ctx = canvas.getContext('2d');
    this.scale = 1;
    this.zoom = 1;
    this.view = { x: 0, y: 0, w, h };
  }

  // Largest integer scale that fits the given box.
  fit(maxW, maxH) {
    this.scale = Math.max(1, Math.floor(Math.min(maxW / this.w, maxH / this.h)));
    this.canvas.width = this.w * this.scale;
    this.canvas.height = this.h * this.scale;
    this.ctx.imageSmoothingEnabled = false;
  }

  // focus: world point the camera tries to centre when zoomed in.
  present(surface, focus = null) {
    this.pixels.set(surface.px);
    this.bctx.putImageData(this.image, 0, 0);
    const vw = Math.round(this.w / this.zoom);
    const vh = Math.round(this.h / this.zoom);
    let vx = 0;
    let vy = this.h - vh; // keep the floor in view
    if (focus && this.zoom > 1) vx = Math.round(Math.min(this.w - vw, Math.max(0, focus[0] - vw / 2)));
    this.view = { x: vx, y: vy, w: vw, h: vh };
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.buffer, vx, vy, vw, vh, 0, 0, this.canvas.width, this.canvas.height);
  }

  // Canvas client coordinates -> world pixel.
  toWorld(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    const u = (clientX - r.left) / r.width;
    const v = (clientY - r.top) / r.height;
    return [this.view.x + u * this.view.w, this.view.y + v * this.view.h];
  }
}
