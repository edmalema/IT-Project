function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorText
    errorBoxDiv.appendChild(errorTextElement);
    console.log(errorText)
}

const trianglePositions = new Float32Array([
    //top middle
    0.0, 1.0,
    //bottom middle
    -1.0, -1.0,
    //bottom rights
    1.0, -1.0
]);

const rgbTriangleColors = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255,
]);
const fireyTriangleColors = new Uint8Array([
    229, 47, 15,
    246, 206, 29,
    233, 154, 26
]);

function MovementColor() {
    var canvas = document.querySelector("canvas");

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        showError("html element is null")
        return;
    }


    var Context = canvas.getContext('webgl2')






    const triangleGeoBuffer = Context.createBuffer();
    Context.bindBuffer(Context.ARRAY_BUFFER, triangleGeoBuffer);
    Context.bufferData(Context.ARRAY_BUFFER, trianglePositions, Context.STATIC_DRAW);


    const rgbTriangleColorsBuffer = Context.createBuffer();
    Context.bindBuffer(Context.ARRAY_BUFFER, rgbTriangleColorsBuffer);
    Context.bufferData(Context.ARRAY_BUFFER, rgbTriangleColors, Context.STATIC_DRAW);


    const fireyTriangleColorsBuffer = Context.createBuffer();
    Context.bindBuffer(Context.ARRAY_BUFFER, fireyTriangleColorsBuffer);
    Context.bufferData(Context.ARRAY_BUFFER, fireyTriangleColors, Context.STATIC_DRAW);




    //Shader source code
    const vertexShaderSourceCode = `#version 300 es 
    precision mediump float;

    in vec2 vertexPosition;
    in vec3 vertexColor;

    out vec3 fragmentColor;

    uniform vec2 canvasSize;

    uniform vec2 shapeLocation;
    uniform float shapeSize;

    void main(){
        fragmentColor = vertexColor;

        vec2 finalVertexPosition = vertexPosition * shapeSize + shapeLocation;
        vec2 clipPosition = (finalVertexPosition / canvasSize) * 2.0 - 1.0;

        gl_Position = vec4(clipPosition, 0.0, 1.0);
    }
    
    `;

    //Creates and compiles the vertex shader
    const vertexShader = Context.createShader(Context.VERTEX_SHADER);

    if (vertexShader === null) {
        showError('Couldnt allocate memory for vertex shader')
        return;
    }

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

    in vec3 fragmentColor;

    out vec4 outputColor;


    void main(){
    
        outputColor = vec4(fragmentColor, 1.0);

    }`;

    //Creates and compiles the fragment shader
    const fragmentShader = Context.createShader(Context.FRAGMENT_SHADER);

    if (fragmentShader === null) {
        showError('Couldnt allocate memory for fragment shader')
        return;
    }

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

    if (triangeShaderProgram === null) {
        showError('Couldnt allocate program')
        return;
    }

    Context.attachShader(triangeShaderProgram, vertexShader);
    Context.attachShader(triangeShaderProgram, fragmentShader);
    Context.linkProgram(triangeShaderProgram);

    if (!Context.getProgramParameter(triangeShaderProgram, Context.LINK_STATUS)) {
        const linkError = Context.getProgramInfoLog(triangeShaderProgram);
        showError(`Failed to LINK shaders - ${linkError}`);
        return;
    }

    //Get attribute location
    const vertexPositionAttribLocation = Context.getAttribLocation(triangeShaderProgram, 'vertexPosition');
    const vertexColorAttribLocation = Context.getAttribLocation(triangeShaderProgram, 'vertexColor')
    if (vertexPositionAttribLocation < 0 || vertexColorAttribLocation < 0) {
        showError(`Failed to get attrib locations: (pos = ${vertexPositionAttribLocation},`
            + ` color = ${vertexColorAttribLocation})`);
        return;
    }

    const shapeLocationUniform = Context.getUniformLocation(triangeShaderProgram, 'shapeLocation');
    const shapeSizeUniform = Context.getUniformLocation(triangeShaderProgram, 'shapeSize');
    const canvasSizeUniform = Context.getUniformLocation(triangeShaderProgram, 'canvasSize');

    if (canvasSizeUniform == null || shapeLocationUniform == null || shapeSizeUniform == null) {
        showError('Couldt get the location')
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
    Context.enableVertexAttribArray(vertexColorAttribLocation)



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

    Context.uniform2f(canvasSizeUniform, canvas.width, canvas.height);

    //First triangle
    Context.bindBuffer(Context.ARRAY_BUFFER, rgbTriangleColorsBuffer);
    Context.vertexAttribPointer(
        vertexColorAttribLocation,
        3,
        Context.UNSIGNED_BYTE,
        true, 0, 0
    );

    Context.uniform1f(shapeSizeUniform, 100);
    Context.uniform2f(shapeLocationUniform, 150, 200);
    Context.drawArrays(Context.TRIANGLES, 0, 3);

    //Second triangle
    Context.bindBuffer(Context.ARRAY_BUFFER, fireyTriangleColorsBuffer);
    Context.vertexAttribPointer(
        vertexColorAttribLocation,
        3,
        Context.UNSIGNED_BYTE,
        true, 0, 0
    );
    Context.uniform1f(shapeSizeUniform, 50);
    Context.uniform2f(shapeLocationUniform, 325, 150);

    Context.drawArrays(Context.TRIANGLES, 0, 3);

}



MovementColor()
