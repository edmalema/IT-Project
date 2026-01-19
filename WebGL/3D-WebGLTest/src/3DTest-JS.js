import { create3dPosColorInterleavedVao, CUBE_INDICES, CUBE_VERTICES, TABLE_INDICES, TABLE_VERTECES } from "./geometry.js";
import { createProgram, createStaticIndexBuffer, createStaticVertexBuffer, getContext, loadTexture, showError } from "./gl-utils.js";
import { glMatrix, mat4, quat, vec3 } from 'gl-matrix';
//OBS must be run with npx vite since it doesnt find gl-matrix



//Variables

const gravityStrength = 1;


//Shader source code
//mat is not material, its matrix
//matViewProj is the view matrix multiplied by the projection matrix
const vertexShaderSourceCode = `#version 300 es 
    precision mediump float;

    in vec3 vertexPosition;
    in vec3 vertexColor;

    out vec3 fragmentColor;

    in vec2 vertexUV;
    out vec2 fragUV;
    
    uniform mat4 matWorld;
    uniform mat4 matViewProj;


    void main(){
        fragUV = vertexUV; 

        fragmentColor = vertexColor;

        gl_Position = matViewProj * matWorld * vec4(vertexPosition, 1.0);
    }
    
    `;



//Fragment shader source code

const fragmentShaderSourceCode = `#version 300 es
    
    precision mediump float;

    in vec3 fragmentColor;

    out vec4 outputColor;

    uniform sampler2D uTexture;
    in vec2 fragUV;

    void main(){
    
        outputColor = texture(uTexture, fragUV) * vec4(fragmentColor, 1.0);
        //outputColor = vec4(fragmentColor, 1.0);

    }`;



let Forwards = 0;
let Sidewards = 0;

document.addEventListener('keydown', function (event) {
    if (event.key == "w") {
        Forwards = 1;
    }
    else if (event.key == "s") {
        Forwards = -1;
    }
    if (event.key == "d") {
        Sidewards = 1;
    }
    else if (event.key == "a") {
        Sidewards = -1;
    }
});
document.addEventListener('keyup', function (event) {
    if (event.key == "w") {
        Forwards = 0;
    }
    else if (event.key == "s") {
        Forwards = 0;
    }
    if (event.key == "d") {
        Sidewards = 0;
    }
    else if (event.key == "a") {
        Sidewards = 0;
    }

});



class Shape {
    matWorld = mat4.create();
    scaleVec = vec3.create();
    rotation = quat.create();

    constructor(pos, scale, rotationAxis, rotationAngle, vao, numIndices, player, gravity) {
        this.pos = pos
        this.scale = scale
        this.rotationAxis = rotationAxis
        this.rotationAngle = rotationAngle
        this.vao = vao
        this.numIndices = numIndices
        this.player = player
        this.gravity = gravity
    }
    draw(Context, matWorldUniform) {
        quat.setAxisAngle(this.rotation, this.rotationAxis, this.rotationAngle);
        vec3.set(this.scaleVec, this.scale, this.scale, this.scale);

        mat4.fromRotationTranslationScale(
            this.matWorld,
            /* rotation */this.rotation,
            /* position */this.pos,
            /* scale */this.scaleVec
        );

        Context.uniformMatrix4fv(matWorldUniform, false, this.matWorld);

        Context.bindVertexArray(this.vao);
        Context.drawElements(Context.TRIANGLES, this.numIndices, Context.UNSIGNED_SHORT, 0);
        Context.bindVertexArray(null);
    }
    update(deltaTime) {

        if (this.pos[1] <= this.scale && this.gravity) {
            this.pos[1] = this.scale;
            this.gravity = false;
        }
        else if (this.gravity) {
            vec3.add(this.pos, this.pos, vec3.fromValues(0, -gravityStrength * deltaTime, 0));
        }

        if (!this.player) {
            return;
        }

        vec3.add(this.pos, this.pos, vec3.fromValues(Forwards * deltaTime, 0, Sidewards * deltaTime));
    }
}





function Test3DWebGL() {
    const canvas = document.getElementById("MainCanvas");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        showError("Could not get Canvas reference");
        return;
    }

    const Context = getContext(canvas);

    const cubeVertices = createStaticVertexBuffer(Context, CUBE_VERTICES);

    const cubeIndices = createStaticIndexBuffer(Context, CUBE_INDICES);

    const tableVerteces = createStaticVertexBuffer(Context, TABLE_VERTECES);
    const tableIndices = createStaticIndexBuffer(Context, TABLE_INDICES);



    Context.pixelStorei(Context.UNPACK_FLIP_Y_WEBGL, true);

    if (!cubeVertices || !cubeIndices ||
        !tableVerteces || !tableIndices) {
        showError(`Failed to create geo: cube: (v = ${!!cubeVertices}, i = ${!!cubeIndices}), table: (v = ${!!tableVerteces}, i = ${!!tableIndices})`)
        return;
    }

    const demoProgram = createProgram(Context, vertexShaderSourceCode, fragmentShaderSourceCode);

    if (!demoProgram) {
        showError('Failed to compile WebGL program');
        return;
    }

    const posAttrib = Context.getAttribLocation(demoProgram, 'vertexPosition');
    const colorAttrib = Context.getAttribLocation(demoProgram, 'vertexColor');
    const uvAttrib = Context.getAttribLocation(demoProgram, 'vertexUV');

    //Gets the location of the variables from the GLSL source code
    const matWorldUniform = Context.getUniformLocation(demoProgram, 'matWorld');
    const matViewProjUniform = Context.getUniformLocation(demoProgram, 'matViewProj');
    const textureUniformLocation = Context.getUniformLocation(demoProgram, 'uTexture');

    if (posAttrib < 0 || colorAttrib < 0 || !matWorldUniform || !matViewProjUniform || !textureUniformLocation || uvAttrib < 0) {
        showError(`Failed to get attribs/uniforms:` +
            `pos = ${posAttrib}, color = ${colorAttrib},` +
            `matWorld = ${!!matWorldUniform}, matViewProj = ${!!matViewProjUniform},` +
            `uv = ${uvAttrib}, textureUniformLocation = ${!!textureUniformLocation}`);
        return;
    }

    const texture = loadTexture(Context, "../Textures/Cubed.jpg")




    const cubeVao = create3dPosColorInterleavedVao(
        Context, cubeVertices, cubeIndices, posAttrib, colorAttrib, uvAttrib);
    const tableVao = create3dPosColorInterleavedVao(
        Context, tableVerteces, tableIndices, posAttrib, colorAttrib, null);

    if (!cubeVao || !tableVao) {
        showError(`Failed to create VAOs: cube = ${!!cubeVao}, table = ${!!tableVao}`);
        return;
    }


    const UP_VEC = vec3.fromValues(0, 1, 0);

    const shapes = [
        new Shape(vec3.fromValues(0, 0, 0), 1, UP_VEC, 0, tableVao, TABLE_INDICES.length, false, false),
        new Shape(vec3.fromValues(1, 5, 0.5), 0.4, UP_VEC, glMatrix.toRadian(40), cubeVao, CUBE_INDICES.length, true, true),
        new Shape(vec3.fromValues(-0.3, 3, -0.7), 0.2, UP_VEC, glMatrix.toRadian(70), cubeVao, CUBE_INDICES.length, false, true),
        new Shape(vec3.fromValues(0.2, 4, 0.8), 0.05, UP_VEC, glMatrix.toRadian(340), cubeVao, CUBE_INDICES.length, false, true),
        new Shape(vec3.fromValues(-0.4, 6, 0.5), 0.1, UP_VEC, glMatrix.toRadian(320), cubeVao, CUBE_INDICES.length, false, true)

    ]

    const matView = mat4.create();
    const matProj = mat4.create();
    const matViewProj = mat4.create();

    let cameraAngle = 0;

    //Render
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    let lastFrameTime = performance.now();
    const frame = function () {
        const thisFrameTime = performance.now();
        const deltaTime = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;


        //Update


        shapes.forEach((shape) => shape.update(deltaTime));

        cameraAngle += deltaTime * glMatrix.toRadian(10);

        //cameraAngle = 0

        const cameraX = 3 * Math.sin(cameraAngle);
        const cameraZ = 3 * Math.cos(cameraAngle);

        mat4.lookAt(
            matView,
        /* pos */vec3.fromValues(cameraX, 1, cameraZ),
        /* look at */vec3.fromValues(0, 0, 0),
        /* up */vec3.fromValues(0, 1, 0)
        );

        mat4.perspective(
            matProj,
        /* FOV */ glMatrix.toRadian(80),
        /* Aspect ratio */ canvas.width / canvas.height,
        /* nearPlane, farPlane */ 0.1, 100.0
        )



        mat4.multiply(matViewProj, matProj, matView);



        //Finish Render




        Context.clearColor(0.02, 0.02, 0.02, 1);
        Context.clear(Context.COLOR_BUFFER_BIT | Context.DEPTH_BUFFER_BIT);

        //Doesnt render verteces behind other verteces,
        Context.enable(Context.DEPTH_TEST);
        //Renders the verteces if they are counter clockwise, like unity O:
        Context.enable(Context.CULL_FACE);


        Context.viewport(0, 0, canvas.width, canvas.height);

        Context.useProgram(demoProgram);

        Context.activeTexture(Context.TEXTURE0);
        Context.bindTexture(Context.TEXTURE_2D, texture);
        Context.uniform1i(textureUniformLocation, 0);

        //Gives the GLSL variables a value
        Context.uniformMatrix4fv(matViewProjUniform, false, matViewProj);

        shapes.forEach((shape) => shape.draw(Context, matWorldUniform));
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}


try {
    Test3DWebGL();
}
catch (e) {
    showError(`Unhandled JavaScript exeption: ${e}`);
}