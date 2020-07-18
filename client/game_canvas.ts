// CANVAS
interface RenderItem {

}

export class GameCanvas extends HTMLDivElement {
  constructor() {
    super();
    this.canvasBG.setAttribute("class", "canvas canvas-bg");
    this.canvasFG.setAttribute("class", "canvas canvas-fg");
    this.appendChild(this.canvasBG);
    this.appendChild(this.canvasFG);
  }

  public startRender() {
    window.requestAnimationFrame();
  }

  private renderFrame() {
    let renderItem = this.renderQueue.pop();
    if (renderItem !== undefined) {

    }
    const cbId = window.requestAnimationFrame();
    this.animFrameCBs.
  }

  private canvasBG = new HTMLCanvasElement();
  private canvasFG = new HTMLCanvasElement();
  private ctxBG = this.canvasBG.getContext("2d");
  private ctxFG = this.canvasFG.getContext("2d");
  private renderQueue = new Array<RenderItem>();
  private animFrameCBs = new Array<number>();
} 