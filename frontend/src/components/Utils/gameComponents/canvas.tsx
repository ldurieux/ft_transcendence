import React, { useRef, useEffect } from 'react'

type CanvasProps = React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>

function drawBackground(ctx: CanvasRenderingContext2D) {
    if (!ctx) return
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height / 2)
}

function drawPaddle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    if (!ctx) return
    ctx.fillStyle = 'white'
    ctx.fillRect(x, y, width, height)
}

const Canvas: React.FC<CanvasProps> = ({ ...props }, BallData) => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctx = canvasRef.current?.getContext('2d') as CanvasRenderingContext2D

    drawBackground(ctx);
    drawPaddle(ctx, 10, 34, 32, 32);

    return <canvas 
      width={props.width} 
      height={props.height} 
      // style={canvasStyle}
      ref={canvasRef}
    />
}

const canvasStyle = {
    width: '100%',
    position: 'fixed',
    top: '50%',
    left: '50%',
    border: '1px solid #11111'
}

export default Canvas