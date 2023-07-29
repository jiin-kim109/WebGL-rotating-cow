#version 300 es
precision highp float;
// Define the input to the fragment shader
// based on the output from the vertex shader,, assuming
// there are no intermediate shader stages.
in mediump vec4 vertexColor;
in mediump vec3 vertexNormal;

// Define the color output.
out mediump vec4 outputColor;

// lighting
uniform float u_shininess;
in vec3 v_surfaceToView;
// point lighting
in vec3 v_pLight_surfaceToLight;
// spot lighting
in vec3 v_sptLight_surfaceToLight;
uniform vec3 u_lightDirection;
uniform float u_limit;

void main() {
    // Write the color to the output.
    outputColor = vertexColor;

    vec3 normal = normalize(vertexNormal);

    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    // point light
    vec3 surfaceToPointLightDirection = normalize(v_pLight_surfaceToLight);
    vec3 pointLightHalfVector = normalize(surfaceToPointLightDirection + surfaceToViewDirection);
    float pointLight = dot(normal, surfaceToPointLightDirection);
    float pointSpecular = 0.0;
    if (pointLight > 0.0) {
      pointSpecular = pow(dot(normal, pointLightHalfVector), u_shininess);
    }
    // spot light
    vec3 surfaceToSpotLightDirection = normalize(v_sptLight_surfaceToLight);
    vec3 spotLightHalfVector = normalize(surfaceToSpotLightDirection + surfaceToViewDirection);
    float spotLight = 0.0;
    float spotSpecular = 0.0;

    float dotFromDirection = dot(surfaceToSpotLightDirection, -u_lightDirection);
    if (dotFromDirection >= u_limit) {
      spotLight = dot(normal, surfaceToSpotLightDirection);
      if (spotLight > 0.0) {
        spotSpecular = pow(dot(normal, spotLightHalfVector), u_shininess);
      }
    }
/*
    spotLight = dot(normal, surfaceToSpotLightDirection);
    if (spotLight > 0.0) {
      spotSpecular = pow(dot(normal, spotLightHalfVector), u_shininess);
    }
*/
    // Lets multiply just the color portion (not the alpha)
    // by the light
    outputColor.rgb *= (pointLight + spotLight);
    outputColor.rgb *= (pointSpecular + spotSpecular);
}