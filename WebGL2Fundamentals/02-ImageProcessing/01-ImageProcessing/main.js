"use strict";

const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    in vec2 a_texCoord;

    // Used to pass in the resolution of the canvas
    uniform vec2 u_resolution;

    // Used to pass the texture coordinates to the fragment shader
    out vec2 v_texCoord;

    void main() {
        // convert the position from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        gl_Position = vec4((zeroToTwo - 1.0) * vec2(1, -1), 0, 1);

        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points
        v_texCoord = a_texCoord;
    }
`;

const fragmentShaderSource = `#version 300 es
    // Fragment shaders don't have a default precision so we need
    // to pick one. highp is a good default. It means "high precision"
    precision highp float;
 
    // our texture
    uniform sampler2D u_image;
 
    // the texCoords passed in from the vertex shader.
    in vec2 v_texCoord;
 
    // we need to declare an output for the fragment shader
    out vec4 outColor;
 
    void main() {
        // Look up a color from the texture.
        outColor = texture(u_image, v_texCoord).bgra;
    }
`;

function render(image) {

    // 01 - Get Canvas Element
    const canvas = document.getElementById("canvas");
    // 02 - Get WebGL Rendering Context
    const gl = canvas.getContext("webgl2");

    // 03 - Create Shaders
    // 03.1 - Create Vertex Shader
    let success;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return;
    }
    // 03.2 - Create Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return;
    }

    // 04 - Create Program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return;
    }

    // 05 - Lookup Variabls
    // 05.1 - Lookup Attribute vaiables
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
    // 05.2 - Lookup Uniform vaiables
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const imageUniformLocation = gl.getUniformLocation(program, "u_image");

    // 06 - Craete vertex array object (Attribute State)
    const vao = gl.createVertexArray();
    // ant make it the one we are currently working with
    gl.bindVertexArray(vao);

    // 07 - Create a buffer and put a single pixel space rectangle in
    // it (2 triangles)
    const positionBuffer = gl.createBuffer();
    // 07.1 - Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // 07.2 - Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const posSize = 2;          // 2 components per iteration
    const posType = gl.FLOAT;   // the data is 32bit floats
    const posNormalize = false; // don't normalize the data
    const posStride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const posOffset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, posSize, posType, posNormalize, posStride, posOffset);

    // 08 - Provide texture coordinates for the rectangle.
    // 08.1 - Create Buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    // 08.2 - Fill Buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0]), gl.STATIC_DRAW);
    // 08.3 - Bind Buffer
    gl.enableVertexAttribArray(texCoordAttributeLocation);
    const texCoordSize = 2;          // 2 components per iteration
    const texCoordType = gl.FLOAT;   // the data is 32bit floats
    const texCoordNormalize = false; // don't normalize the data
    const texCoordStride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const texCoordOffset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(texCoordAttributeLocation, texCoordSize, texCoordType, texCoordNormalize, texCoordStride, texCoordOffset);
    
    // 09 - Textures
    // 09.1 - Create Texture
    const texture = gl.createTexture();
    // 09.exra
    // make unit 0 the active texture unit
    // (i.e, the unit all other texture commands will affect.)
    gl.activeTexture(gl.TEXTURE0 + 0);
    // 09.2 - Bind Texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // ?? - Learn More
    // Set the parameters so we don't need mips and so we're not filtering
    // and we don't repeat
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // 10 - Upload Image into Texture
    const mipLevel = 0;               // the largest mip
    const internalFormat = gl.RGBA;   // format we want in the texture
    const srcFormat = gl.RGBA;        // format of data we are supplying
    const srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
    gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                image);

    // 11 - Canvas Setup
    // 11.1 - Resize Canvas
    gl.canvas.width = image.width;
    gl.canvas.height = image.height;
    // 11.2 - Set Viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // 11.3 - Clear Canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 12 - Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // 13 - Bind the attribute/buffer set we want
    gl.bindVertexArray(vao);

    // 14 - Set the uniforms
    // Pass in the canvas resolution so we can convert from
    // pixels to clip space in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    // 14.1 - Tell Shader to get data from texture unit 0
    gl.uniform1i(imageUniformLocation, 0);

    // 15 - Bind the position buffer so gl.bufferData that will be called
    // in setRectangle puts data in the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 16 - Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, image.width, image.height);

    // 17 - Draw the rectangle.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
  }

function main() {
    // 00 - Initialize
    const image = new Image()
    image.src = "https://cdn.pixabay.com/photo/2023/06/28/08/34/people-8093808_1280.jpg"
    image.crossOrigin = "anonymous";
    image.onload = function () {
        render(image);
    }
}

main();