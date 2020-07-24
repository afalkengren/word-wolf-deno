import { Queue } from "../shared/linked_list";

export interface RenderContext {
  start: DOMHighResTimeStamp;
  end: DOMHighResTimeStamp;
}

export interface RenderItem {
  ctx: RenderContext,
  cb: (ts: DOMHighResTimeStamp, ctx: RenderContext) => void,
}

export class GameCanvas extends HTMLDivElement {
  public constructor() {
    super();
    this.canvasBG.setAttribute("class", "canvas canvas-bg");
    this.canvasFG.setAttribute("class", "canvas canvas-fg");
    this.appendChild(this.canvasBG);
    this.appendChild(this.canvasFG);
  }
  
  public stop() {
    while (this.animFrameCBs.length > 0) {
      const cbId = this.animFrameCBs.pop();
      if (cbId == undefined) break; // probably not necessary due to evloop js
      window.cancelAnimationFrame(cbId);
    }
  }

  public start() {
    const cb: FrameRequestCallback = this.renderFrame.bind(this);
    const cbId = window.requestAnimationFrame(cb);
    this.animFrameCBs.push(cbId);
  }

  // Read-only members
  readonly canvasBG = new HTMLCanvasElement();
  readonly canvasFG = new HTMLCanvasElement();
  readonly ctxBG = this.canvasBG.getContext("2d");
  readonly ctxFG = this.canvasFG.getContext("2d");
  readonly renderQueue = new Queue<RenderItem>();

  // Private members
  private animFrameCBs = new Array<number>();
  private renderFrame(ts: DOMHighResTimeStamp) {
    let renderItem: RenderItem;
    if (renderItem = this.renderQueue.dequeue()) {
      renderItem.cb(ts, renderItem.ctx);
    }
    const cb: FrameRequestCallback = this.renderFrame.bind(this);
    const cbId = window.requestAnimationFrame(cb);
    this.animFrameCBs.push(cbId);
  }
}