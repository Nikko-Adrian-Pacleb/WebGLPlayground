"use strict"
const vertexShaderSource = `#version 300 es
    in vec2 position;

    void main() {
        gl_Position = vec4(position, 0, 1);
        gl_PointSize = 100.0;
    }
`

const fragmentShaderSource = `#version 300 es
    precision mediump float;

    out vec4 outColor;

    void main() {
        outColor = vec4(0, 0, 0, 1);
    }
`

let numOfPoints = 0
const allPoints = []

const canvas = document.getElementById("glCanvas")
const gl = canvas.getContext("webgl2");
if(!gl) {
    alert("Unable to initialize WebGL")
}
const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource])
gl.useProgram(program)

canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight
gl.viewport(0, 0, canvas.width, canvas.height)

// Look up where the vertex data needs to go.
const positionAttributeLocation = gl.getAttribLocation(program, "position")

// Create a buffer to put positions in
const positionBuffer = gl.createBuffer()

// Bind it to ARRAY_BUFFER
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
const size = 2;          // 2 components per iteration
const type = gl.FLOAT;   // the data is 32bit floats
const normalize = false; // don't normalize the data
const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
const offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
gl.enableVertexAttribArray(positionAttributeLocation);

canvas.addEventListener("click", (event) => {
    const mouseXPos = -1 + (2 * event.clientX / canvas.width)
    const mouseYPos = -1 + (2 * (canvas.height - event.clientY) / canvas.height)
    console.log(mouseXPos, mouseYPos)
    
    // ver1
    // allPoints.push(mouseXPos, mouseYPos)
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPoints), gl.STATIC_DRAW)
    // ++numOfPoints
    // // Draw
    // gl.clear(gl.COLOR_BUFFER_BIT)
    // gl.drawArrays(gl.POINTS, 0, numOfPoints)

    //ver2: does not use an array outside. This version will delete the previous point
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([mouseXPos, mouseYPos]), gl.STATIC_DRAW)
    gl.drawArrays(gl.POINTS, 0, 1)


})
