"use strict";

const vertexShaderSource = `#version 300 es
    in vec4 a_position;

    void main() {
        gl_Position = a_position;
    }
`

const fragmentShaderSource = `#version 300 es
    precision highp float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1, 0, 0.5, 1);
    }
`

function createShader(gl, type, source) {
    // Create Shader
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    // Check if Shader was created successfully
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!success) {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return undefined
    }

    return shader
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    // Create Shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    
    // Create Program
    const program = gl.createProgram()
    
    // Attach Shaders to Program
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Check if Program was created successfully
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
        console.error(gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
        return undefined
    }

    return program
}

function main() {
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl2")
    if (!gl) {
        console.error("WebGL2 is not supported")
        return
    }

    // Create Program and Shaders
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

    // Get Shader Variable Locations
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")

    // Create Buffer
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
        -1, 0,
        0, 1,
        1, 1,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    // Create Vertex Array Object
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionAttributeLocation) // Learn why this has to be here
    const size = 2
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
    
    // Clear Canvas
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Use Program
    gl.useProgram(program)
    gl.bindVertexArray(vao)

    // Draw
    const primitiveType = gl.TRIANGLES
    const offset2 = 0
    const count = 3
    gl.drawArrays(primitiveType, offset2, count)
}

main()