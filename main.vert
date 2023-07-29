#version 300 es

// Define the inputs. The first input
// will be the position and the second will be
// the color.
layout(location = 0) in vec3 position;
layout(location = 1) in vec4 color;
layout(location = 2) in vec3 normal;

// Define the outputs. Since the output for the vertex
// position is a built-in variable, we just need to define
// an output for the color. Note that the default interpolation 
// qualifier is smooth, so it is not neccessary to write.
smooth out vec4 vertexColor;
smooth out vec3 vertexNormal;

// Define a uniform mat4 variable for the
// transformation matrix.
uniform mat4 world;
uniform mat4 worldViewProjection;
uniform mat4 worldInverseTranspose;

// lighting
uniform vec3 viewWorldPosition;
out vec3 v_surfaceToView;
// point lighting
uniform mat4 pointLightTransform;
uniform vec3 pointLightPosition;
out vec3 v_pLight_surfaceToLight;
// spot lighting
uniform mat4 spotLightTransform;
uniform vec3 spotLightPosition;
out vec3 v_sptLight_surfaceToLight;

// Per-vertex transformations 
// should be computed in the vertex shader.
void main() {
    // Write the position to gl_Position.
    // Remember, we need to use homogenous coordinates.
    gl_Position = worldViewProjection*vec4(position, 1.0f);

    // Write the color to the output defined earlier.
    vertexColor = color;

    // compute the world position of the surface
    vertexNormal = mat3(worldInverseTranspose) * normal;

    // lighting
    vec3 surfaceWorldPosition = (world * vec4(position, 1.0f)).xyz;
    v_surfaceToView = viewWorldPosition - surfaceWorldPosition;
    // point light
    vec3 plightWorldPosition = mat3(pointLightTransform) * pointLightPosition;
    v_pLight_surfaceToLight = plightWorldPosition - surfaceWorldPosition;
    // spot light
    vec3 sptlightWorldPosition = mat3(spotLightTransform) * spotLightPosition;
    v_sptLight_surfaceToLight = sptlightWorldPosition - surfaceWorldPosition;
}