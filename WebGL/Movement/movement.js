function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorText
    errorBoxDiv.appendChild(errorTextElement);
    console.log(errorText)
}


//Variables

const spawnRate = 0.08;
const minShapeTime = 0.25;
const maxShapeTime = 6;
const minShapeSpeed = 125;
const maxShapeSpeed = 400;
const minShapeForce = 150;
const maxShapeForce = 700;
const minShapeSize = 2;
const maxShapeSize = 50;
const maxShapeCount = 500;
const circleSegments = 40;





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



//Fragment shader source code

const fragmentShaderSourceCode = `#version 300 es
    
    precision mediump float;

    in vec3 fragmentColor;

    out vec4 outputColor;


    void main(){
    
        outputColor = vec4(fragmentColor, 1.0);

    }`;



function buildCircleVertexBufferData() {
    const vertexData = [];

    for (let i = 0; i < circleSegments; i++) {
        const vertex1Angle = i * Math.PI * 2 / circleSegments;
        const vertex2Angle = (i + 1) * Math.PI * 2 / circleSegments;

        const x1 = Math.cos(vertex1Angle)
        const y1 = Math.sin(vertex1Angle)
        const x2 = Math.cos(vertex2Angle)
        const y2 = Math.sin(vertex2Angle)

        //Center vertex and the middle of the shape is a light blue color
        vertexData.push(
            0, 0,
            0.678, 0.851, 0.957
        );

        //External verteces are darker

        vertexData.push(
            x1, y1,

            0.251, 0.353, 0.856
        );

        vertexData.push(
            x2, y2,

            0.251, 0.353, 0.856
        );

    }
    return new Float32Array(vertexData);
}


const trianglePositions = new Float32Array([
    //top middle
    0.0, 1.0,
    //bottom middle
    -1.0, -1.0,
    //bottom rights
    1.0, -1.0
]);

const squarePositions = new Float32Array([
    -1, 1,
    -1, -1,
    1, -1,
    -1, 1,
    1, -1,
    1, 1
])



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


const indigoGradientSquareColors = new Uint8Array([
    167, 153, 255,

    88, 62, 122,
    88, 62, 122,
    167, 153, 255,
    88, 62, 122,
    167, 153, 255
]);

const graySquareColors = new Uint8Array([
    45, 45, 45,
    45, 45, 45,
    45, 45, 45,
    45, 45, 45,
    45, 45, 45,
    45, 45, 45
])







function createStaticVertexBuffer(Context, data) {
    const buffer = Context.createBuffer();
    if (!buffer) {
        showError('Failed to allocate buffer')
        return null;
    }
    Context.bindBuffer(Context.ARRAY_BUFFER, buffer)
    Context.bufferData(Context.ARRAY_BUFFER, data, Context.STATIC_DRAW)
    Context.bindBuffer(Context.ARRAY_BUFFER, null)


    return buffer;
}

function createTwoBufferVao(Context, positionBuffer, colorBuffer, positionAtributeLocation, colorAttribLocation) {
    const vao = Context.createVertexArray();
    if (!vao) {
        showError('Failed to allocate VAO for two buffer');
        return null;
    }

    Context.bindVertexArray(vao);

    Context.enableVertexAttribArray(positionAtributeLocation);
    Context.enableVertexAttribArray(colorAttribLocation);

    Context.bindBuffer(Context.ARRAY_BUFFER, positionBuffer);
    Context.vertexAttribPointer(
        positionAtributeLocation, 2, Context.FLOAT, false, 0, 0
    );

    Context.bindBuffer(Context.ARRAY_BUFFER, colorBuffer);
    Context.vertexAttribPointer(
        colorAttribLocation, 3, Context.UNSIGNED_BYTE, true, 0, 0
    );

    Context.bindBuffer(Context.ARRAY_BUFFER, null);

    Context.bindVertexArray(null);

    return vao;
}

function createInterleavedBufferVao(Context, interleavedBuffer, positionAtributeLocation, colorAttribLocation) {
    const vao = Context.createVertexArray();
    if (!vao) {
        showError('Failed to allocate VAO for two buffer');
        return null;
    }

    Context.bindVertexArray(vao);

    Context.enableVertexAttribArray(positionAtributeLocation);
    Context.enableVertexAttribArray(colorAttribLocation);

    Context.bindBuffer(Context.ARRAY_BUFFER, interleavedBuffer);
    Context.vertexAttribPointer(
        positionAtributeLocation, 2, Context.FLOAT, false,
        //Moves 5 floats worth of bytes for every step
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    Context.vertexAttribPointer(
        colorAttribLocation, 3, Context.FLOAT, false,
        //Moves 5 floats worth of bytes for every step
        5 * Float32Array.BYTES_PER_ELEMENT,
        //Starts two floats worth of bytes in
        2 * Float32Array.BYTES_PER_ELEMENT
    );

    Context.bindBuffer(Context.ARRAY_BUFFER, null);

    Context.bindVertexArray(null);

    return vao;
}


function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}


class MovingShape {

    constructor(position, velocity, force, size, timeRemaining, vao, numVertices) {
        this.position = position,
            this.velocity = velocity,
            this.force = force,
            this.size = size,
            this.timeRemaining = timeRemaining,
            this.vao = vao,
            this.numVertices = numVertices
    }

    isAlive() {
        return this.timeRemaining > 0;
    }

    update(deltaTime) {

        this.velocity[0] += this.force[0] * deltaTime;
        this.velocity[1] += this.force[1] * deltaTime;

        this.position[0] += this.velocity[0] * deltaTime;
        this.position[1] += this.velocity[1] * deltaTime;

        this.timeRemaining -= deltaTime;
    }

}






function MovementColor() {
    var canvas = document.querySelector("canvas");

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        showError("html element is null")
        return;
    }


    var Context = canvas.getContext('webgl2')






    const triangleGeoBuffer = createStaticVertexBuffer(Context, trianglePositions);
    const rgbTriangleColorsBuffer = createStaticVertexBuffer(Context, rgbTriangleColors);
    const fireyTriangleColorsBuffer = createStaticVertexBuffer(Context, fireyTriangleColors);

    const squareGeoBuffer = createStaticVertexBuffer(Context, squarePositions);
    const indigoGradientSquareColorsBuffer = createStaticVertexBuffer(Context, indigoGradientSquareColors);
    const graySquareColorsBuffer = createStaticVertexBuffer(Context, graySquareColors);

    //the circle buffer is a combination of its geo and color buffer
    const circleInterleavedBuffer = createStaticVertexBuffer(Context, buildCircleVertexBufferData());




    if (!triangleGeoBuffer || !rgbTriangleColorsBuffer || !fireyTriangleColorsBuffer ||
        !squareGeoBuffer || !indigoGradientSquareColorsBuffer || !graySquareColorsBuffer ||
        !circleInterleavedBuffer) {
        showError(`Failed to create vertex buffers (triangle pos = ${!!triangleGeoBuffer}`
            + `, rgb tri color = ${!!rgbTriangleColorsBuffer}`
            + `, firey tri color = ${!!fireyTriangleColorsBuffer}`
            + `, square pos = ${!!squareGeoBuffer}`
            + `, indigo square color = ${!!indigoGradientSquareColorsBuffer}`
            + `, gray square color = ${!!graySquareColorsBuffer}`
            + `, blue circle color = ${!!circleInterleavedBuffer})`);
        return null;
    }




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



    //Create VAOs
    const rgbTriangeVao = createTwoBufferVao(
        Context, triangleGeoBuffer, rgbTriangleColorsBuffer,
        vertexPositionAttribLocation, vertexColorAttribLocation
    );
    const fireyTriangeVao = createTwoBufferVao(
        Context, triangleGeoBuffer, fireyTriangleColorsBuffer,
        vertexPositionAttribLocation, vertexColorAttribLocation
    );

    const indigoSquareVao = createTwoBufferVao(
        Context, squareGeoBuffer, indigoGradientSquareColorsBuffer,
        vertexPositionAttribLocation, vertexColorAttribLocation
    );
    const graySquareVao = createTwoBufferVao(
        Context, squareGeoBuffer, graySquareColorsBuffer,
        vertexPositionAttribLocation, vertexColorAttribLocation
    );

    const circleVao = createInterleavedBufferVao(
        Context, circleInterleavedBuffer, vertexPositionAttribLocation, vertexColorAttribLocation
    );


    if (!rgbTriangeVao || !fireyTriangeVao || !indigoSquareVao || !graySquareVao || !circleVao) {
        showError(`Failed to create VAOs: (` +
            `rgbTriangleVao = ${!!rgbTriangeVao}, ` +
            `fireyTriangleVao = ${!!fireyTriangeVao}, ` +
            `indigoSquareVao = ${!!indigoSquareVao}, ` +
            `graySquareVao = ${!!graySquareVao}` +
            `circleVao = ${!!circleVao}` +
            `)`
        );
        return;
    }


    const geometryList = [
        { vao: rgbTriangeVao, numVertices: 3 },
        { vao: fireyTriangeVao, numVertices: 3 },
        { vao: indigoSquareVao, numVertices: 6 },
        { vao: circleVao, numVertices: circleSegments * 3 },
        { vao: graySquareVao, numVertices: 6 },
    ];

    let shapes = [];
    let timeToNextSpawn = spawnRate;


    let lastFrameTime = performance.now();

    const frame = function () {
        const thisFrameTime = performance.now();
        const deltaTime = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        timeToNextSpawn -= deltaTime;
        if (timeToNextSpawn <= 0) {
            timeToNextSpawn = spawnRate;

            const movementAngle = getRandomNumber(0, 2 * Math.PI);
            const movementSpeed = getRandomNumber(minShapeSpeed, maxShapeSpeed);
            const forceAngle = getRandomNumber(0, 2 * Math.PI);
            const forceSpeed = getRandomNumber(minShapeForce, maxShapeForce);

            const position = [canvas.width / 2, canvas.height / 2];
            const velocity = [
                //90 degrees = 1
                Math.sin(movementAngle) * movementSpeed,
                //90 degrees = 0
                Math.cos(movementAngle) * movementSpeed
                //Its a normalized vector multiplied by speed O:
            ]

            const force = [
                Math.sin(forceAngle) * forceSpeed,
                Math.cos(forceAngle) * forceSpeed
            ]
            const size = getRandomNumber(minShapeSize, maxShapeSize);
            const timeRemaining = getRandomNumber(minShapeTime, maxShapeTime);

            const geometryIdx = Math.floor(getRandomNumber(0, geometryList.length))
            const geometry = geometryList[geometryIdx];

            const shape = new MovingShape(position, velocity, force, size, timeRemaining, geometry.vao, geometry.numVertices)

            shapes.push(shape);
        }

        //Update func Obj

        for (let i = 0; i < shapes.length; i++) {
            shapes[i].update(deltaTime);
        }

        //filter returns an array containing only shapes that return true on isAlive
        //slice returns an array that has a max length of maxShapeCount
        shapes = shapes.filter((shape) => shape.isAlive()).slice(0, maxShapeCount);


        // Output merger - how to merge the shaded pixel fragment with the existing output image
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        Context.clearColor(0.08, 0.08, 0.08, 1.0)
        Context.clear(Context.COLOR_BUFFER_BIT | Context.DEPTH_BUFFER_BIT);

        // Rasterizer - which pixels are part of a triangle

        Context.viewport(0, 0, canvas.width, canvas.height);

        // Set GPU program (vertex + fragment shader pair)
        Context.useProgram(triangeShaderProgram);




        // Set uniforms shared across frame...

        Context.uniform2f(canvasSizeUniform, canvas.width, canvas.height);

        //Draw triangles
        for (let i = 0; i < shapes.length; i++) {
            Context.uniform1f(shapeSizeUniform, shapes[i].size);
            Context.uniform2f(shapeLocationUniform, shapes[i].position[0], shapes[i].position[1]);
            Context.bindVertexArray(shapes[i].vao);
            Context.drawArrays(Context.TRIANGLES, 0, shapes[i].numVertices);
        }



        requestAnimationFrame(frame);

    };

    requestAnimationFrame(frame);

}



MovementColor()
