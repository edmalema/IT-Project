

function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorText
    errorBoxDiv.appendChild(errorTextElement);
    console.log(errorText)
}


function helloTriangle() {
    var canvas = document.querySelector("canvas");



    var Context = canvas.getContext('webgl2')




    const triangleVertecies = [
        //top middle
        0.0, 0.5,
        //bottom middle
        -0.5, -0.5,
        //bottom rights
        0.5, -0.5
    ];

    const triangleVerteciesCPUBuffer = new Float32Array(triangleVertecies);

    const triangleGeoBuffer = Context.createBuffer();
    Context.bindBuffer(Context.ARRAY_BUFFER, triangleGeoBuffer);
    Context.bufferData(Context.ARRAY_BUFFER, triangleVerteciesCPUBuffer, Context.STATIC_DRAW);

    //Shader source code
    const vertexShaderSourceCode = `#version 300 es 
    precision mediump float;

    in vec2 vertexPosition;

    void main(){
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
    }
    
    `;

    //Creates and compiles the vertex shader
    const vertexShader = Context.createShader(Context.VERTEX_SHADER);
    Context.shaderSource(vertexShader, vertexShaderSourceCode);
    Context.compileShader(vertexShader);

    //Checks if vertex shaders have a compile error
    if (!Context.getShaderParameter(vertexShader, Context.COMPILE_STATUS)) {
        const compileError = Context.getShaderInfoLog(vertexShader);
        showError(`Failed to COMPILE vertex shader  - ${compileError}`);
        return;
    }

    //Fragment shader source code

    const fragmentShaderSourceCode = `#version 300 es
    
    precision mediump float;

    out vec4 outputColor;


    void main(){
    
        outputColor = vec4(0.294, 0.0, 0.51, 1.0);

    }`;

    //Creates and compiles the fragment shader
    const fragmentShader = Context.createShader(Context.FRAGMENT_SHADER);
    Context.shaderSource(fragmentShader, fragmentShaderSourceCode);
    Context.compileShader(fragmentShader);

    //Checks if fragment shaders have a compile error
    if (!Context.getShaderParameter(fragmentShader, Context.COMPILE_STATUS)) {
        const compileError = Context.getShaderInfoLog(fragmentShader);
        showError(`Failed to COMPILE fragment shader  - ${compileError}`);
        return;
    }


    //creates a program and attaches both shaders then links together the program
    const triangeShaderProgram = Context.createProgram();
    Context.attachShader(triangeShaderProgram, vertexShader);
    Context.attachShader(triangeShaderProgram, fragmentShader);
    Context.linkProgram(triangeShaderProgram);

    if (!Context.getProgramParameter(triangeShaderProgram, Context.LINK_STATUS)){
        const linkError = Context.getProgramInfoLog(triangeShaderProgram);
        showError(`Failed to LINK shaders - ${linkError}`);
        return;
    }
    
    //Get attribute location
    const vertexPositionAttribLocation = Context.getAttribLocation(triangeShaderProgram, 'vertexPosition');
    if (vertexPositionAttribLocation < 0) {
        showError('Failed to get attrib location for vertexPosition');
        return;
    }

    // Output merger - how to merge the shaded pixel fragment with the existing output image
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    Context.clearColor(0.08, 0.08, 0.08, 1.0)
    Context.clear(Context.COLOR_BUFFER_BIT | Context.DEPTH_BUFFER_BIT);

    // Rasterizer - which pixels are part of a triangle

    Context.viewport(0, 0, canvas.width, canvas.height);

    // Set GPU program (vertex + fragment shader pair)
    Context.useProgram(triangeShaderProgram);
    Context.enableVertexAttribArray(vertexPositionAttribLocation)


    // Input assembler - how to read vertices from gpu triangle buffer

    Context.bindBuffer(Context.ARRAY_BUFFER, triangleGeoBuffer);
    Context.vertexAttribPointer(
        /* Index: which attribute to use */ 
        vertexPositionAttribLocation,
        /* Size: how many components in that attribute */ 
        2, 
        /* Type: what is the data type stored in the GPU buffer for this attribute? */
        Context.FLOAT,
        /* Normalized: determines how to convert ints into floats,
        false will convert to closest float eks 1 -> 1.0f
        true will convert the interger range into the float range -1 - 1 eks 8 out of 10 -> 0.8f*/
        false,
        /* Stride: how many bytes between positions in buffers, 0 is AUTO anything else is manual*/ 
        2 * Float32Array.BYTES_PER_ELEMENT,
        /* Offset: how many bytes should the input assembler skip into the buffer
         when reading attributes */
        0
    );

    // Draw Call (also sets up primitive assembly)

    Context.drawArrays(Context.TRIANGLES, 0, 3);

}



helloTriangle()
