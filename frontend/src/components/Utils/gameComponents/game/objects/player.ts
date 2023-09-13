namespace Pong
{
  export class Player implements GraphicalElement
  {
    // player
    private score: number;
    private name: string;

    // paddle
    protected _X: number;
    protected _Y: number;
    protected _width: number;
    protected _height: number;
    protected _speed: number = 0;
    protected _color: string = color.white;
    protected _direction: Direction | null = null;
    protected _paddleWidth: number;
    protected _paddleHeight: number;

    constructor(name: string, startX: number, startY: number)
    {
      this.name = name;
      this.score = 0;
      this._X = startX;
      this._Y = startY;
    }

    getScore(): number
    {
      return this.score;
    }

    setScore(score: number): void
    {
      this.score = score;
    }

    getName(): string
    {
      return this.name;
    }

    setYpos(y: number): void
    {
      this._Y = y;
    }

    setSpeed(speed: number): void
    {
      this._speed = speed;
    }

    setColor(color: string): void
    {
      this._color = color;
    }

    setPaddleMesurements(width: number, height: number): void
    {
      this._paddleWidth = width;
      this._paddleHeight = height;
    }

    update(ctx: CanvasRenderingContext2D) {

      if (this._direction !== null) {
        switch (this._direction) {
          case Direction.UP:
            this._Y -= this._speed;
            break;
          case Direction.DOWN:
            this._Y += this._speed;
        }
      }

      let maxY = ctx.canvas.height - this._paddleHeight;
      if (this.y < 0) {
        this.y = 0;
      } else if (this.y > maxY) {
        this.y = maxY;
      }

      if (Utils.between(this.ball.y, this._Y, this._Y + this._paddleHeight)
          && Utils.between(this.ball.x, this.x, this.x + this._paddleWidth)) {
        this.ball.hit();
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = this.colour;
      ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
    }
  }

}
