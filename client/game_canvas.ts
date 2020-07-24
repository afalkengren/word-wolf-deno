import { Queue } from "../shared/linked_list";

export interface RenderContext {
  start?: DOMHighResTimeStamp;
  end?: DOMHighResTimeStamp;
  duration: number;
  ctx: { 
    fg?: CanvasRenderingContext2D, 
    bg?: CanvasRenderingContext2D 
  };
  data: any;
}

export interface RenderItem {
  ctx: RenderContext,
  cb: (ts: DOMHighResTimeStamp, ctx: RenderContext) => void,
}

export class GameCanvas extends HTMLDivElement {
  public constructor() {
    super();
    this._canvasBG.setAttribute("class", "canvas canvas-bg");
    this._canvasFG.setAttribute("class", "canvas canvas-fg");
    this.appendChild(this._canvasBG);
    this.appendChild(this._canvasFG);
  }
  
  public stop() {
    while (this._animFrameCBs.length > 0) {
      const cbId = this._animFrameCBs.pop();
      if (cbId == undefined) break; // probably not necessary due to evloop js
      window.cancelAnimationFrame(cbId);
    }
  }

  public start() {
    const cb: FrameRequestCallback = this.renderFrame.bind(this);
    const cbId = window.requestAnimationFrame(cb);
    this._animFrameCBs.push(cbId);
  }
  
  // Public getters for protected/private properties
  public get renderQueue() { return this._renderQueue; }
  public get getBgContext() { return this._ctxBG; }
  public get getFgContext() { return this._ctxFG; }

  // Protected members
  protected _canvasBG = new HTMLCanvasElement();
  protected _canvasFG = new HTMLCanvasElement();
  protected _ctxBG = this._canvasBG.getContext("2d");
  protected _ctxFG = this._canvasFG.getContext("2d");
  protected _renderQueue = new Queue<RenderItem>();

  // Private members
  private _animFrameCBs = new Array<number>();
  private renderFrame(ts: DOMHighResTimeStamp) {
    let renderItem: RenderItem;
    if (renderItem = this._renderQueue.dequeue()) {
      renderItem.cb(ts, renderItem.ctx);
    }
    const cb: FrameRequestCallback = this.renderFrame.bind(this);
    const cbId = window.requestAnimationFrame(cb);
    this._animFrameCBs.push(cbId);
  }
}