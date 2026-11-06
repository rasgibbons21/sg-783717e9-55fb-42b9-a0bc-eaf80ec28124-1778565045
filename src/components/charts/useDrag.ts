import { useCallback, useRef } from "react";

/**
 * Pointer dragging that keeps following a finger or mouse even outside the element.
 * `onMove` receives the pointer's vertical position in the SVG's own pixels.
 */
export function useDrag(svgRef: React.RefObject<SVGSVGElement | null>, onMove: (y: number) => void) {
  const active = useRef(false);

  const yFor = useCallback(
    (event: React.PointerEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      return rect ? event.clientY - rect.top : 0;
    },
    [svgRef],
  );

  return {
    onPointerDown: (event: React.PointerEvent<SVGElement>) => {
      active.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
      onMove(yFor(event));
    },
    onPointerMove: (event: React.PointerEvent<SVGElement>) => {
      if (active.current) onMove(yFor(event));
    },
    onPointerUp: (event: React.PointerEvent<SVGElement>) => {
      active.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => {
      active.current = false;
    },
  };
}
