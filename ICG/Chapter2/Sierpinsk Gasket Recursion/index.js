const vertexShaderSource = `#version 300 es
    in vec2 position;

    void main() {
        gl_Position = vec4(position, 0, 1);
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
    
    // Triangle Edge Points
    const edgePoints = [
        [0.0, 0.8],
        [-0.8, -0.8],
        [0.8, -0.8]
    ]
    let allPoints = [] // Collection of all points to be drawn
    const recursionCount = 9;

    /**
     * 
     * @param {[x, y]} point1 
     * @param {[x, y]} point2 
     * @param {[x, y]} point3 
     * @param {[x, y]} recursionCount 
     * @returns 
     * 
     * @description
     * if recursionCount is 0, then the last triangle is drawn
     * the points that are passed in are the points of the triangle
     * 
     * if the recursionCount is not 0, then the triangle is divided into 3 triangles
     * to get the points of the new triangles, the midpoint of the edges of the triangle are calculated
     */
    function DivideTriangle(point1, point2, point3, recursionCount) {
        if(recursionCount === 0) {
            // Last Triangle
            allPoints.push(point1[0], point1[1])
            allPoints.push(point2[0], point2[1])
            allPoints.push(point3[0], point3[1])
            return
        }
        DivideTriangle(point1, [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2], [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2], recursionCount - 1)
        DivideTriangle(point2, [(point2[0] + point1[0]) / 2, (point2[1] + point1[1]) / 2], [(point2[0] + point3[0]) / 2, (point2[1] + point3[1]) / 2], recursionCount - 1)
        DivideTriangle(point3, [(point3[0] + point1[0]) / 2, (point3[1] + point1[1]) / 2], [(point3[0] + point2[0]) / 2, (point3[1] + point2[1]) / 2], recursionCount - 1)
    }

    DivideTriangle(edgePoints[0], edgePoints[1], edgePoints[2], recursionCount)
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
    gl.drawArrays(gl.TRIANGLES, 0, allPoints.length / 2)
}
main()