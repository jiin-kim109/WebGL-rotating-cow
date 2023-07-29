function colorCow()
{
    var faces = get_cow_faces();
    var vertices = get_cow_vertices();
    var vertexNormals = computeCowVertexNormals();

    var positions = [];
    var normals = [];
    var colors = [];
    for (const indicies of faces) {
        const [a, b, c] = indicies;
        positions.push(vertices[a-1]);
        positions.push(vertices[b-1]);
        positions.push(vertices[c-1]);
        //vertex normals
        normals.push(vertexNormals[a-1]);
        normals.push(vertexNormals[b-1]);
        normals.push(vertexNormals[c-1]);
        //cow color
        colors.push([0.84, 0.5, 0.2, 1.0]);
        colors.push([0.84, 0.5, 0.2, 1.0]);
        colors.push([0.84, 0.5, 0.2, 1.0]);
    }
    positions = flatten(positions);
    colors = flatten(colors);
    normals = flatten(normals);
    return [positions, colors, normals];
}

/**
 * Global Variables
 */
var gl
var canvas;

var angleX;
var angleY;
var angleZ;

var pLightAngle;

var sptLightAngle;
var sptLightPanningAngleCutOff = 30;
var sptLightPanningSpeed = 0.5;
var sptLightPanningSpeedAbs = 0.5;
var sptLightLimit = 12 * Math.PI / 180;

// Positions and Colors
var positions = [];
var colors = [];
var normals = [];

var cowPositionLength = 0;
var pLightPositionLength = 0;
var sptLightPositionLength = 0;

function vertexDataFill() {
    var [cowPositions, cowColors, cowNormals] = colorCow();
    positions = [...positions, ...cowPositions];
    colors = [...colors, ...cowColors];
    normals = [...normals, ...cowNormals];
    cowPositionLength = cowPositions.length;
    
    var [pLightPositions, pLightColors] = colorCube();
    positions = [...positions, ...pLightPositions];
    colors = [...colors, ...pLightColors];
    pLightPositionLength = pLightPositions.length;

    var [sptLightPositions, sptLightColors] = colorCone();
    positions = [...positions, ...sptLightPositions];
    colors = [...colors, ...sptLightColors];
    sptLightPositionLength = sptLightPositions.length;
}
vertexDataFill();

// Shader sources
var vs_source;
var fs_source;

// Buffer objects
var position_buffer;
var color_buffer;
var normal_buffer;

// Shader handles
var vs;
var fs;
var prog;

// Handle for the vertex array object
var vao;

// translate
var xTranslate = 0.0;
var yTranslate = 0.0;
var zTranslate = 0.0;
// rotation
var xRotation = 0.0;
var yRotation = 0.0;
var zRotation = 0.0;


function initializeContext() { 
    canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl2");
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = pixelRatio * canvas.clientWidth;
    canvas.height = pixelRatio * canvas.clientHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.4, 0.4, 0.4, 1.0);
    gl.lineWidth(1.0);
    gl.enable(gl.DEPTH_TEST);

    logMessage("WebGL initialized.");
}

/**
 * Setup
 */
async function setup() {
    initializeContext();
    setEventListeners(canvas);
    colorCow();
    await loadShaders();
    compileShaders();
    createBuffers();
    createVertexArrayObjects();
    resetTransformValues();

    requestAnimationFrame(render)
};
function resetTransformValues() {
    angleX = 0.0;
    angleY = 0.0;
    angleZ = 0.0;
    xTranslate = 0.0;
    yTranslate = 0.0;
    zTranslate = 0.0;
    pLightAngle = 0.0;
    sptLightAngle = 0.0;
}

function loadShaderFile(url) {
    return fetch(url).then(response => response.text());
}

async function loadShaders() {
    const shaderURLs = [
        './main.vert',
        './main.frag'
    ];
    const shader_files = await Promise.all(shaderURLs.map(loadShaderFile));

    vs_source = shader_files[0];
    fs_source = shader_files[1];

    logMessage("Shader files loaded.")
}

function compileShaders() {
    vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vs_source);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        logError(gl.getShaderInfoLog(vs));
        gl.deleteShader(vs);
    }

    fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fs_source);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        logError(gl.getShaderInfoLog(fs));
        gl.deleteShader(fs);
    }

    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        logError(gl.getProgramInfoLog(prog));
    }

    logMessage("Shader program compiled successfully.");
}

function createBuffers() {
    position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW);

    color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW);

    normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
        new Float32Array(normals),
        gl.STATIC_DRAW);

    logMessage("Created buffers.");
}

// Creates VAOs for vertex attributes
function createVertexArrayObjects() {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var pos_idx = gl.getAttribLocation(prog, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    gl.vertexAttribPointer(pos_idx, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pos_idx);

    var col_idx = gl.getAttribLocation(prog, "color");
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.vertexAttribPointer(col_idx, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(col_idx);

    var normal_idx = gl.getAttribLocation(prog, "normal");
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.vertexAttribPointer(normal_idx, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normal_idx);

    gl.bindVertexArray(null);

    logMessage("Created VAOs.");
}

/**
 * Uniform Setup
 */
function cowTranformModel() {
    var model = mat4();
    /**
     * Translation
     */
    model = translate(xTranslate, yTranslate, zTranslate);
    /**
     * Rotation
     */
    model = mult(model, rotate(angleX, [1.0, 0.0, 0.0]));
    model = mult(model, rotate(angleY, [0.0, 1.0, 0.0]));
    model = mult(model, rotate(angleZ, [0.0, 0.0, 1.0]));
    return model;
}
function pLightTransformModel() {
    var model = mat4();
    /**
     * Translation
     */
    var initialLocationMatrix = rotate(pLightAngle, [0.0, 1.0, 0.0]);
    initialLocationMatrix = mult(initialLocationMatrix, translate(8.0, 5.0, 5.0));
    model = mult(model, initialLocationMatrix);
    /**
     * Rotation
     */
    model = mult(model, rotate(0, [1.0, 0.0, 0.0]));
    model = mult(model, rotate(0, [0.0, 1.0, 0.0]));
    model = mult(model, rotate(0, [0.0, 0.0, 1.0]));
    return model;
}
function sptLightTransformModel() {
    var model = mat4();
    /**
     * Translation
     */
    var initialLocationMatrix = translate(0.0, 6.0, 6.0);
    initialLocationMatrix = mult(initialLocationMatrix, rotate(sptLightAngle, [0.0, 0.0, 1.0]));
    initialLocationMatrix = mult(initialLocationMatrix, rotate(10, [-1.0, 0.0, 0.0]));
    initialLocationMatrix = mult(initialLocationMatrix, scalem(0.4, 0.4, 0.4))
    model = mult(model, initialLocationMatrix);
    /**
     * Rotation
     */
    model = mult(model, rotate(0, [1.0, 0.0, 0.0]));
    model = mult(model, rotate(0, [0.0, 1.0, 0.0]));
    model = mult(model, rotate(0, [0.0, 0.0, 1.0]));
    return model;
}
// Sets the uniform variables in the shader program
function setWorldVariables(model) {
    gl.useProgram(prog);
    /**
     * World
     */
    var worldLocation = gl.getUniformLocation(prog, "world");
    gl.uniformMatrix4fv(worldLocation, false, flatten(model));
    /**
     * World Inverse Transpose
     */
    var worldInverseTransposeLocation = gl.getUniformLocation(prog, "worldInverseTranspose");
    var worldInverseTranspose = transpose(inverse4(model));
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, flatten(worldInverseTranspose));
    /**
     * World Projection
     */
    var worldViewProjectionLocation = gl.getUniformLocation(prog, "worldViewProjection");
    /**
     * View
     */
    var eye = vec3(0, 0, 30);
    var target = vec3(0, 0, 0);
    var up = vec3(0, 1, 0);
    var view = lookAt(
        eye,
        target,
        up
    );
    var aspect = canvas.width / canvas.height;
    var projection = perspective(45.0, aspect, 0.1, 1000.0);
    var transform = mult(projection, mult(view, model));
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, flatten(transform));
}

function setUniformVariables() {
    // point light
    var pointLightTransformLocation = gl.getUniformLocation(prog, "pointLightTransform");
    gl.uniformMatrix4fv(pointLightTransformLocation, false, flatten(pLightTransformModel()));
    var pointLightPositionLocation = gl.getUniformLocation(prog, "pointLightPosition");
    gl.uniform3fv(pointLightPositionLocation, [8, 5, 5]);
    // spot light
    var spotLightTransformLocation = gl.getUniformLocation(prog, "spotLightTransform");
    gl.uniformMatrix4fv(spotLightTransformLocation, false, flatten(mult(translate(0.0, 6.0, 6.0), rotate(-sptLightAngle, [0.0, 0.0, 1.0]))));
    var spotLightPositionLocation = gl.getUniformLocation(prog, "spotLightPosition");
    gl.uniform3fv(spotLightPositionLocation, [0, 6, 6]);
    var lightDirectionLocation = gl.getUniformLocation(prog, "u_lightDirection");
    var lightDirection = [0, 0, 0];
    {
        var pos = vec3(0, 6, 6);
        var target = vec3(0, 0, 0);
        var up = vec3(0, 1, 0);
        var lmat = lookAt(pos, target, up);
        //lmat = m4.multiply(m4.xRotation(lightRotationX), lmat);
        //lmat = m4.multiply(m4.yRotation(lightRotationY), lmat);
        //lightDirection = [-lmat[8], -lmat[9],-lmat[10]];
        lightDirection = [0, -0.7, -0.7];
    }
    gl.uniform3fv(lightDirectionLocation, lightDirection);
    var limitLocation = gl.getUniformLocation(prog, "u_limit");
    gl.uniform1f(limitLocation, Math.cos(sptLightLimit));
    // view
    var viewWorldPositionLocation = gl.getUniformLocation(prog, "viewWorldPosition");
    gl.uniform3fv(viewWorldPositionLocation, [0, 0, 30]);
    var shininessLocation = gl.getUniformLocation(prog, "u_shininess");
    gl.uniform1f(shininessLocation, 10);
}

/**
 * Rendering
 */
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    setUniformVariables();
    /**
     * Cow Rendering
     */
    renderCow();
    /**
     * Point Light Rendering
     */
    renderPointLight();
    if (pLightRotatePressed) pLightAngle += 0.7;
    /**
     * Spot Light Rendering
     */
    renderSpotLight();
    if (sptLightPanningPressed) {
        sptLightAngle += sptLightPanningSpeed;
        if (sptLightAngle > sptLightPanningAngleCutOff) sptLightPanningSpeed = -sptLightPanningSpeedAbs;
        else if (sptLightAngle < -sptLightPanningAngleCutOff) sptLightPanningSpeed = sptLightPanningSpeedAbs;
    }
    // Animation
    requestAnimationFrame(render);
}

// Draws the vertex data for Cow
function renderCow() {
    setWorldVariables(cowTranformModel());
    gl.drawArrays(gl.TRIANGLES, 0, cowPositionLength/3);
}

// Draws the vertex data for Point Light Wireframe
function renderPointLight() {
    setWorldVariables(pLightTransformModel());
    gl.drawArrays(gl.LINES, cowPositionLength/3, pLightPositionLength/3);
}

function renderSpotLight() {
    setWorldVariables(sptLightTransformModel());
    gl.drawArrays(gl.LINE_STRIP, cowPositionLength/3 + pLightPositionLength/3, sptLightPositionLength/3);
}


/*
    Input Events
*/
var leftMousePressed = false;
var rightMousePressed = false;
var zoomInPressed = false;
var zoomOutPressed = false;
var zRotatePosPressed = false;
var zRotateNegPressed = false;
var pLightRotatePressed = false;
var sptLightPanningPressed = false;

var anchorXY = [0.0, 0.0];
var rotAnchorXY = [0.0, 0.0];

function setEventListeners(canvas) {
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    canvas.addEventListener('mousedown', (event) => {
        switch(event.button) {
            case 0:
                leftMousePressed = true;
                break;
            case 2:
                rightMousePressed = true;
                break;
        }
        anchorXY = [event.x, event.y];
        rotAnchorXY = [event.x, event.y];
    });
    canvas.addEventListener('mouseup', (event) => {
        switch(event.button) {
            case 0:
                leftMousePressed = false;
                break;
            case 2:
                rightMousePressed = false;
                break;
        }
        anchorXY = [0.0, 0.0];
        rotAnchorXY = [0.0, 0.0];
    });
    canvas.addEventListener('mousemove', function (event) {
        if (leftMousePressed) {
            xTranslate -= (anchorXY[0] - event.x) / 50;
            yTranslate += (anchorXY[1] - event.y) / 50;
            anchorXY = [event.x, event.y];
        }
        if (rightMousePressed) {
            angleY -= (rotAnchorXY[0] - event.x) / 2;
            angleX += (rotAnchorXY[1] - event.y) / 2;
            rotAnchorXY = [event.x, event.y];
        }
    });
    canvas.addEventListener('keyup', function (event) {
        if (event.keyCode == '38') { // Key 'UP'
            zoomInPressed = false;
        }
        if (event.keyCode == '40') { // Key 'DOWN'
            zoomOutPressed = false;
        }
        if (event.keyCode == '39') { // Key 'RIGHT'
            zRotateNegPressed = false;
        }
        if (event.keyCode == '37') { // Key 'LEFT'
            zRotatePosPressed = false;
        }
        if (event.keyCode == '80') { // Key 'p' Point Light Rotate
            pLightRotatePressed = !pLightRotatePressed;
        }
        if (event.keyCode == '83') { // Key 's' Point Light Rotate
            sptLightPanningPressed = !sptLightPanningPressed;
        }
    });
    canvas.addEventListener('keydown', function (event) {
        if (event.keyCode == '38') { // Key 'UP'
            zoomInPressed = true;
        }
        if (event.keyCode == '40') { // Key 'DOWN'
            zoomOutPressed = true;
        }
        if (event.keyCode == '39') { // Key 'RIGHT'
            zRotateNegPressed = true;
        }
        if (event.keyCode == '37') { // Key 'LEFT'
            zRotatePosPressed = true;
        }
        if (event.keyCode == '82') { // Key 'r' Reset
            resetTransformValues();
        }
        /**
         * Ticker
         */
        if (zoomInPressed) {
            zTranslate += 0.3;
        }
        if (zoomOutPressed) {
            zTranslate -= 0.3;
        }
        if (zRotatePosPressed) {
            angleZ += 3;
        }
        if (zRotateNegPressed) {
            angleZ -= 3;
        }
    });
}


// Logging
function logMessage(message) {
    console.log(message);
}

function logError(message) {
    console.log(`Error: ${message}`);
}


/**
 * 
 */
window.onload = setup;