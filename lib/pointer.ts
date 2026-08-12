/**
 * One pointer, broadcast.
 *
 * There are a lot of light fields on this site — ten index blocks, a title on
 * each of them, a plate on each of them, a contact sheet on every set page.
 * They all want the same two numbers, so they share one listener rather than
 * each binding their own and each paying for every move event.
 *
 * Subscribers are called immediately with the last known position, so a field
 * that mounts under a stationary cursor is lit correctly without waiting for
 * the pointer to move.
 */

type Sub = (x: number, y: number) => void;

let x = -9999;
let y = -9999;
let bound = false;
const subs = new Set<Sub>();

export function onPointer(fn: Sub) {
  if (!bound) {
    bound = true;
    window.addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        for (const s of subs) s(x, y);
      },
      { passive: true }
    );
  }
  subs.add(fn);
  fn(x, y);
  return () => {
    subs.delete(fn);
  };
}
