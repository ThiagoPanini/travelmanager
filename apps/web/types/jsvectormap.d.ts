/**
 * Tipos mínimos para `jsvectormap` (1.7.x não embarca .d.ts). Só o que a costura
 * `<RouteMap>` usa — construir o mapa, focar e destruir.
 */
declare module "jsvectormap" {
  export type JvmMarker = { name?: string; coords: [number, number] };
  export type JvmLine = { from: string; to: string };
  export type JvmFocus = {
    regions?: string[];
    coords?: [number, number];
    scale?: number;
    animate?: boolean;
  };
  export type JvmOptions = {
    selector: HTMLElement;
    map: string;
    backgroundColor?: string;
    zoomButtons?: boolean;
    zoomOnScroll?: boolean;
    regionStyle?: Record<string, unknown>;
    markers?: JvmMarker[];
    markerStyle?: Record<string, unknown>;
    lines?: JvmLine[];
    lineStyle?: Record<string, unknown>;
    showTooltip?: boolean;
  };
  export default class JsVectorMap {
    constructor(options: JvmOptions);
    setFocus(options: JvmFocus): void;
    destroy(): void;
    static addMap(name: string, map: unknown): void;
  }
}

declare module "jsvectormap/dist/maps/world.js";
declare module "jsvectormap/dist/jsvectormap.css";
