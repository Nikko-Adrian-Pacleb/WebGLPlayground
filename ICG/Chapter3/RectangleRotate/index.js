const vertexShaderSource = `#version 300 es
    in vec4 position;
    uniform float theta;
    void main() {
        // Change the position of the point based on theta
        gl_Position.x = -sin(theta) * position.x + cos(theta) * position.y;
        gl_Position.y = sin(theta) * position.y + cos(theta) * position.x;
        gl_Position.z = 0.0;
        gl_Position.w = 1.0;
    }
`

const fragmentShaderSource = `#version 300 es
    precision mediump float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1, 0, 0.5, 1);
    }
`
let delay = 100;
let clockwise = true; // Variable to determine the direction of rotation
const DirectionChangeButton = document.getElementById("DirectionChangeButton").onclick = () => {
    clockwise = !clockwise
}
// const AppMenuSelect = document.getElementById("AppMenuSelect")
// AppMenuSelect.addEventListener("click", () => {
//     switch(AppMenuSelect.selectedIndex) {
//         case 0:
//             clockwise = !clockwise
//             break;
//         case 1:
//             delay /= 2
//             break;
//         case 2:
//             delay *= 2
//             break;
//     }
// })
document.getElementById("Slider").addEventListener("change", (e) => {
    delay = e.target.value
})

function main() {
    const canvas = document.getElementById("glCanvas")
    const gl = canvas.getContext("webgl2");
    
    const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource])
    
    gl.useProgram(program)
    
    let theta = 0.0; 
    const thetaLocation = gl.getUniformLocation(program, "theta")
    gl.uniform1f(thetaLocation, theta)
    const rectanglePoints = [
        0.0, 0.5,
        0.5, 0.0,
        -0.5, 0.0,
        0.0, -0.5,
    ]
    const positionAttributeLocation = gl.getAttribLocation(program, "position")

    const pointPositionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectanglePoints), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
    
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)
    
    gl.viewport(0, 0, canvas.width, canvas.height)
    function render() {
        setTimeout(() => {
            // Every Render, change the theta value based on the direction of rotation
            theta += clockwise ? 0.1 : -0.1

            requestAnimationFrame(render)
            gl.clearColor(0.5, 0.5, 0.5, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.uniform1f(thetaLocation, theta)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }, delay)
    }
    render()
}
main()

