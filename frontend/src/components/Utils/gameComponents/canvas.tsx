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

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    
    if (ctx) {
      ctx.fillStyle = 'black';
      //rectangle width must be 100% of the canvas width
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawPaddle(ctx, 0, 50, 5, 40);
      drawPaddle(ctx, ctx.canvas.width - 5, 50, 5, 40);
    }
  }, [])
return <canvas ref={canvasRef} style={canvasStyle}></canvas>
}

const canvasStyle = {
    width: '100%',
    height: '50%',
    position: 'absolute',
    top: '25%',
    border: '1px solid white'
}

export default Canvas