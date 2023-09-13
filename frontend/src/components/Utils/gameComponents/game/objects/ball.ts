namespace Pong
{
    export class Ball implements GraphicalElement
    {
        protected _X: number;
        protected _Y: number;
        protected _radius: number;
        protected _speed: number;
        protected _color: string;
        protected _vector: number;

        constructor(startX: number, startY: number)
        {
            this._X = startX;
            this._Y = startY;
        }

        setXpos(x: number): void
        {
            this._X = x;
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

        setVector(vector: number): void
        {
            this._vector = vector;
        }


    }
}