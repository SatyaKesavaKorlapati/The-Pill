import React, { useEffect, useRef } from 'react';

interface LiquidMetaballCanvasProps {
  width: number;
  height: number;
  pillCenter?: [number, number];
  pillHalfSize?: [number, number];
  pillRadius?: number;
  dropletCenter?: [number, number];
  dropletRadius?: number;
  smoothK?: number;
  color?: [number, number, number, number];
  className?: string;
}

const VERT_SHADER_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG_SHADER_SRC = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pillCenter;
uniform vec2 u_pillHalfSize;
uniform float u_pillRadius;
uniform vec2 u_dropletCenter;
uniform float u_dropletRadius;
uniform float u_smoothK;
uniform vec4 u_color;

float sdBox(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r, r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
    vec2 pos = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
    float dPill = sdBox(pos - u_pillCenter, u_pillHalfSize, u_pillRadius);
    float dDroplet = length(pos - u_dropletCenter) - u_dropletRadius;
    float dUnified = smin(dPill, dDroplet, u_smoothK);
    float alpha = 1.0 - smoothstep(-0.8, 0.8, dUnified);
    gl_FragColor = u_color * alpha;
}
`;

export const LiquidMetaballCanvas: React.FC<LiquidMetaballCanvasProps> = ({
  width,
  height,
  pillCenter = [width / 2, 19],
  pillHalfSize = [105, 19],
  pillRadius = 18,
  dropletCenter = [width / 2, 19],
  dropletRadius = 0,
  smoothK = 18,
  color = [0.03, 0.04, 0.06, 0.98],
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, VERT_SHADER_SRC);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, FRAG_SHADER_SRC);
    gl.compileShader(fragShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uPCenter = gl.getUniformLocation(program, 'u_pillCenter');
    const uPHalf = gl.getUniformLocation(program, 'u_pillHalfSize');
    const uPRad = gl.getUniformLocation(program, 'u_pillRadius');
    const uDCenter = gl.getUniformLocation(program, 'u_dropletCenter');
    const uDRad = gl.getUniformLocation(program, 'u_dropletRadius');
    const uSmoothK = gl.getUniformLocation(program, 'u_smoothK');
    const uCol = gl.getUniformLocation(program, 'u_color');

    let animId: number;

    const render = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uPCenter, pillCenter[0], pillCenter[1]);
      gl.uniform2f(uPHalf, pillHalfSize[0], pillHalfSize[1]);
      gl.uniform1f(uPRad, pillRadius);
      gl.uniform2f(uDCenter, dropletCenter[0], dropletCenter[1]);
      gl.uniform1f(uDRad, dropletRadius);
      gl.uniform1f(uSmoothK, smoothK);
      gl.uniform4f(uCol, color[0], color[1], color[2], color[3]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [width, height, pillCenter, pillHalfSize, pillRadius, dropletCenter, dropletRadius, smoothK, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
