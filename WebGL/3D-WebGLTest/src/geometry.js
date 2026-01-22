import { showError } from "./gl-utils.js";

//Vertex positions  Color rgb   UV

export const CUBE_VERTICES = new Float32Array([
    // Front face
    -1.0, -1.0, 1.0,  1, 0, 0,  0.0, 0.0, //First verteces
    1.0, -1.0, 1.0,   1, 0, 0,  1.0, 0.0,//Second verteces
    1.0, 1.0, 1.0,    1, 0, 0,  1.0, 1.0,//Third verteces
    -1.0, 1.0, 1.0,   1, 0, 0,  0.0, 1.0,//Fourth verteces

    // Back face
    -1.0, -1.0, -1.0, 1, 0, 0,  0.0, 0.0,
    -1.0, 1.0, -1.0,  1, 0, 0,  0.0, 1.0,
    1.0, 1.0, -1.0,   1, 0, 0,  1.0, 1.0,
    1.0, -1.0, -1.0,  1, 0, 0,  1.0, 0.0,

    // Top face
    -1.0, 1.0, -1.0,  0, 1, 0,  0.0, 0.0,
    -1.0, 1.0, 1.0,   0, 1, 0,  0.0, 1.0,
    1.0, 1.0, 1.0,    0, 1, 0,  1.0, 1.0,
    1.0, 1.0, -1.0,   0, 1, 0,  1.0, 0.0,

    // Bottom face
    -1.0, -1.0, -1.0, 0, 1, 0,  0.0, 0.0,
    1.0, -1.0, -1.0,  0, 1, 0,  1.0, 0.0,
    1.0, -1.0, 1.0,   0, 1, 0,  1.0, 1.0,
    -1.0, -1.0, 1.0,  0, 1, 0,  0.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,  0, 0, 1,  0.0, 0.0,
    1.0, 1.0, -1.0,   0, 0, 1,  1.0, 0.0,
    1.0, 1.0, 1.0,    0, 0, 1,  1.0, 1.0,
    1.0, -1.0, 1.0,   0, 0, 1,  0.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, 0, 0, 1,  0.0, 0.0,
    -1.0, -1.0, 1.0, 0, 0, 1,   0.0, 1.0,
    -1.0, 1.0, 1.0, 0, 0, 1,    1.0, 1.0,
    -1.0, 1.0, -1.0, 0, 0, 1,   1.0, 0.0,
]);


export const CUBE_INDICES = new Uint16Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,   // top
    12, 13, 14, 12, 14, 15,   // bottom
    16, 17, 18, 16, 18, 19,   // right
    20, 21, 22, 20, 22, 23,   // left
]);


export const TABLE_VERTECES = new Float32Array([
    // Top face
    -10.0, 0.0, -10.0, 0.2, 0.2, 0.2,   0, 0,
    -10.0, 0.0, 10.0, 0.2, 0.2, 0.2,    0, 1,
    10.0, 0.0, 10.0, 0.2, 0.2, 0.2,     1, 1,
    10.0, 0.0, -10.0, 0.2, 0.2, 0.2,    1, 0,
]);

export const TABLE_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3,
]);


export function create3dPosColorInterleavedVao(
    Context, vertexBuffer,
    indexBuffer, posAttrib, colorAttrib, uvAttrib
) {
    const vao = Context.createVertexArray();
    if (!vao) {
        showError('Failed to create VAO');
        return null;
    }

    Context.bindVertexArray(vao);
    Context.enableVertexAttribArray(posAttrib);
    Context.enableVertexAttribArray(colorAttrib);
    Context.enableVertexAttribArray(uvAttrib);

    Context.bindBuffer(Context.ARRAY_BUFFER, vertexBuffer);

    Context.vertexAttribPointer(
        posAttrib, 3, Context.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT, 0);

    Context.vertexAttribPointer(
        colorAttrib, 3, Context.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT);

    Context.vertexAttribPointer(
        uvAttrib, 3, Context.FLOAT, false,
        8 * Float32Array.BYTES_PER_ELEMENT,
        6 * Float32Array.BYTES_PER_ELEMENT);

    Context.bindBuffer(Context.ARRAY_BUFFER, null);

    Context.bindBuffer(Context.ELEMENT_ARRAY_BUFFER, indexBuffer);

    Context.bindVertexArray(null);

    Context.bindBuffer(Context.ELEMENT_ARRAY_BUFFER, null); //Might not be necessary

    return vao;
}








/*
export function parseOBJ(text){
    const keywords ={

    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo){
        const line = lines[lineNo].trim();
        if (line === ' ' || line.startsWith('#')){
            continue;
        }
        const m = keywordRE.exec(line);

        if (!m){
            continue;
        }
        const [, keyword, unparsedArgs] = m;

        const parts = line.split(/\s+/).slice(1);

        const handler = keyword[keyword];

        if (!handler) {
            showError(`Unhandeled keyword: ${keyword} at line ${lineNo + 1}`);
            continue;
        }
        handler(parts, unparsedArgs);
    }
}*/