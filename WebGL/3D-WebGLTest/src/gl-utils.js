export function showError(errorText) {
    const errorBoxDiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorText
    errorBoxDiv.appendChild(errorTextElement);
    console.log(errorText)
}


export function createStaticVertexBuffer(Context, data) {
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



export function createStaticIndexBuffer(Context, data) {
    const buffer = Context.createBuffer();
    if (!buffer) {
        showError('Failed to allocate buffer')
        return null;
    }
    Context.bindBuffer(Context.ELEMENT_ARRAY_BUFFER, buffer)
    Context.bufferData(Context.ELEMENT_ARRAY_BUFFER, data, Context.STATIC_DRAW)
    Context.bindBuffer(Context.ELEMENT_ARRAY_BUFFER, null)


    return buffer;
}

export function initTextureBuffer(Context) {
    const textureCoordBuffer = Context.createBuffer();
    Context.bindBuffer(Context.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
        // Front 
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];

    Context.bufferData(
        Context.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        Context.STATIC_DRAW,
    );

    return textureCoordBuffer;
}



export function createProgram(Context, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = Context.createShader(Context.VERTEX_SHADER);
    const fragmentShader = Context.createShader(Context.FRAGMENT_SHADER);
    const program = Context.createProgram();

    if (!vertexShader || !fragmentShader || !program) {
        showError(`Failed to allocate  GL objects (`
            + `vertex shader = ${!!vertexShader}`
            + `fragment shader = ${!!fragmentShader}`
            + `program = ${!!program})`
        );
        return null;
    }

    Context.shaderSource(vertexShader, vertexShaderSource);

    Context.compileShader(vertexShader);

    if (!Context.getShaderParameter(vertexShader, Context.COMPILE_STATUS)) {
        const errorMessage = Context.getShaderInfoLog(vertexShader);
        showError(`Failed to compile vertex shader: ${errorMessage}`);
        return null;
    }

    Context.shaderSource(fragmentShader, fragmentShaderSource);

    Context.compileShader(fragmentShader);

    if (!Context.getShaderParameter(fragmentShader, Context.COMPILE_STATUS)) {
        const errorMessage = Context.getShaderInfoLog(fragmentShader);
        showError(`Failed to compile fragment shader: ${errorMessage}`);
        return null;
    }

    Context.attachShader(program, vertexShader);
    Context.attachShader(program, fragmentShader);

    Context.linkProgram(program);

    if (!Context.getProgramParameter(program, Context.LINK_STATUS)) {
        const errorMessage = Context.getProgramInfoLog(program);
        showError(`Failed to link GPU program: ${errorMessage}`);
        return null;
    }

    return program;
}



export function getContext(canvas) {
    const Context = canvas.getContext('webgl2');
    if (!Context) {
        const isWebGl1Supported = !!(document.createElement('canvas')).getContext('webgl');
        if (isWebGl1Supported) {
            throw new Error('WebGL 1 is supported, but not but not v2 - try using a different device or browser');
        }
        else {
            throw new Error('WebGL is not supported on this device - try using a different device or browser')
        }
    }

    return Context;
}

export function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}



function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

export function loadTexture(Context, url) {
    const texture = Context.createTexture();
    Context.bindTexture(Context.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = Context.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = Context.RGBA;
    const srcType = Context.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255]);
    Context.texImage2D(
        Context.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    const image = new Image();
    image.onload = () => {
        Context.bindTexture(Context.TEXTURE_2D, texture);
        Context.texImage2D(
            Context.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            Context.generateMipmap(Context.TEXTURE_2D);
        }
        else {
            Context.texParameteri(Context.TEXTURE_2D, Context.TEXTURE_WRAP_S, Context.CLAMP_TO_EDGE);
            Context.texParameteri(Context.TEXTURE_2D, Context.TEXTURE_WRAP_T, Context.CLAMP_TO_EDGE);
            Context.texParameteri(Context.TEXTURE_2D, Context.TEXTURE_MIN_FILTER, Context.LINEAR);
        }
    };
    image.src = url;
    return texture;
}