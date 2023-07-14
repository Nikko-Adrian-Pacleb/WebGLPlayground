const vertexShaderSource = `#version 300 es
    in vec2 position;

    void main() {
        gl_Position = vec4(position, 0, 1);
        gl_PointSize = 1.0;
    }
`

const fragmentShaderSource = `#version 300 es
    precision mediump float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1, 0, 0.5, 1);
    }
`
function main() {
    const canvas = document.getElementById("glCanvas")
    const gl = canvas.getContext("webgl2");
    
    const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource])
    
    gl.useProgram(program)
    
    const edgePoints = [
        [0.0, 0.8],
        [-0.8, -0.8],
        [0.8, -0.8]
    ]
    let currentPoint = [0.0, 0.0]
    let allPoints = [
        0.0, 0.8,
        -0.8, -0.8,
        0.8, -0.8,
        0.0, 0.0
    ]
    let pointCount = 100000
    for(let i = 0; i < pointCount; i++) {
        const currentEdgeIndex = Math.floor(Math.random() * 3)
        let pointPx = (currentPoint[0] + edgePoints[currentEdgeIndex][0]) / 2 
        let pointPy = (currentPoint[1] + edgePoints[currentEdgeIndex][1]) / 2
        currentPoint = [pointPx, pointPy]
        allPoints.push(pointPx, pointPy)
    }


    const pointPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPoints), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
    const positionAttributeLocation = gl.getAttribLocation(program, "position")
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)
    
    gl.clearColor(0.5, 0.5, 0.5, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, canvas.width, canvas.height)
    console.log(allPoints)
    gl.drawArrays(gl.POINTS, 0, pointCount + 4)
}
main()