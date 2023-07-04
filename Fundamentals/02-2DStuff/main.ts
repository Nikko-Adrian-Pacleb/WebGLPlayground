"use strict";

const vertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`

const fragmentShaderSource = `#version 300 es
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    outColor = u_color;
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if(success) {
        return shader
    }
    console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShaderSource)
    gl.attachShader(program, fragmentShaderSource)
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if(success) {
        return program
    }

    console.log(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
}

function main() {
    // Get A WebGL context
    const canvas = document.querySelector('canvas')
    if(!canvas) {
        throw new Error('Canvas not found')
    }
    const gl = canvas.getContext('webgl2')
    if(!gl) {
        throw new Error('WebGL2 not supported')
    }
    
    // Create Program From Sources
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = createProgram(gl, vertexShader, fragmentShader)
    
    // Look up where the vertex data needs to go
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    // Look up uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    // Create a buffer and put a single pixel space rectangle in
    // it (2 triangles)
    // Create a buffer and put three 2d clip space points in it
    const positionBuffer = gl.createBuffer()

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    const positions = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    
    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray()

    // and make it the one we're currently working with
    gl.bindVertexArray(vao)

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation)
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2 // 2 components per iteration
    const type = gl.FLOAT // the data is 32bit floats
    const normalize = false // don't normalize the data
    const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
    
    // Resize canvas
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program)
    
    // Bind the attribute/buffer set we want
    gl.bindVertexArray(vao)
    
    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
    
    // Draw 50 random rectangles in random colors
    for (let i = 0; i < 50; i++) {
        // Put a rectangle in the position buffer
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300))

        // Set a random color.
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1)

        // Draw the rectangle
        const primitiveType = gl.TRIANGLES
        const offDraw = 0
        const count = 6
        gl.drawArrays(primitiveType, offDraw, count)
    }
}
function randomInt(range) {
    return Math.floor(Math.random() * range)
}
function setRectangle(gl, x, y, width, height) {
const x1 = x
const x2 = x + width
const y1 = y
const y2 = y + height
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
    ]), gl.STATIC_DRAW)
}


main();