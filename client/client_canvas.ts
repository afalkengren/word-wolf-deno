import { GameCanvas, RenderContext, RenderItem } from "./game_canvas"

export class WordWolfCanvas extends GameCanvas {
  constructor() {
    super();
    this.style.width = "auto";
    this.style.height = "auto";
  }

  public showWord(word: string, fgCtx: CanvasRenderingContext2D) {
    const ctx: RenderContext = { duration: 3000, ctx: { fg: fgCtx }, data: { word } };
    const renItem: RenderItem = { ctx, cb: this.showWordFrameCB.bind(this, ctx) };
    this.renderQueue.enqueue(renItem);
  }

  private showWordFrameCB(ts: DOMHighResTimeStamp, ctx: RenderContext) {
    // If context doesn't have a start, this is the first frame
    if (ctx.start === undefined) {
      ctx.start = ts;
      ctx.end = ts + ctx.duration;
    }
    let word = ctx.data["word"] as string;
    if (word === undefined) return; // todo better handling

    { // prevent vars from leaving scope
      let renderCtx: CanvasRenderingContext2D;
      if (renderCtx = ctx.ctx.fg) {
        renderCtx.save();
        renderCtx.fillStyle = "black";
        this.clearCanvas(renderCtx);
        // renderCtx.fillText(word, 0, ) todo
        renderCtx.restore();
      }
    }
      

  }

  private clearCanvas(ctx: CanvasRenderingContext2D) {
    return ctx.clearRect(0 , 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  }
}