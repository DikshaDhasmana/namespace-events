import React, { useEffect, useRef } from 'react';

interface SquaresBackgroundProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

const SquaresBackground: React.FC<SquaresBackgroundProps> = ({
  direction = 'diagonal',
  speed = 0.5,
  borderColor = 'hsl(270, 52%, 70%)', // Light purple for borders
  squareSize = 40,
  hoverFillColor = 'hsl(270, 52%, 28%)', // Primary purple for hover
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const squares: Array<{
      x: number;
      y: number;
      alpha: number;
      size: number;
    }> = [];

    // Initialize squares grid
    const cols = Math.ceil(canvas.width / squareSize) + 2;
    const rows = Math.ceil(canvas.height / squareSize) + 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        squares.push({
          x: i * squareSize - squareSize,
          y: j * squareSize - squareSize,
          alpha: 0.2 + Math.random() * 0.3, // Lighter opacity for subtle effect
          size: squareSize,
        });
      }
    }

    let offset = 0;

    const getMovement = (direction: string) => {
      switch (direction) {
        case 'up':
          return { dx: 0, dy: -speed };
        case 'down':
          return { dx: 0, dy: speed };
        case 'left':
          return { dx: -speed, dy: 0 };
        case 'right':
          return { dx: speed, dy: 0 };
        case 'diagonal':
        default:
          return { dx: speed * 0.7, dy: speed * 0.7 };
      }
    };

    const movement = getMovement(direction);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      offset += speed;

      squares.forEach((square) => {
        const x = square.x + (offset * movement.dx) % (squareSize * 2);
        const y = square.y + (offset * movement.dy) % (squareSize * 2);

        // Check if mouse is over this square
        const isHovered = 
          mouseRef.current.x >= x && 
          mouseRef.current.x <= x + square.size &&
          mouseRef.current.y >= y && 
          mouseRef.current.y <= y + square.size;

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 0.5; // Even thinner lines
        ctx.globalAlpha = square.alpha;

        if (isHovered) {
          ctx.fillStyle = hoverFillColor;
          ctx.fillRect(x, y, square.size, square.size);
        }

        ctx.strokeRect(x, y, square.size, square.size);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1;
      mouseRef.current.y = -1;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 ${className}`}
      style={{ 
        background: 'transparent', 
        pointerEvents: 'auto',
        zIndex: 1
      }}
    />
  );
};

export default SquaresBackground;