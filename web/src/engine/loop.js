// Fixed-timestep loop: logic always advances in 1/60 s steps (scaled by
// `speed` for slow motion), rendering happens once per animation frame.
export function startLoop({ update, render, step = 1 / 60, getSpeed = () => 1 }) {
  let last = performance.now();
  let acc = 0;
  function frame(now) {
    acc += Math.min(0.25, (now - last) / 1000) * getSpeed();
    last = now;
    while (acc >= step) {
      update(step);
      acc -= step;
    }
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
