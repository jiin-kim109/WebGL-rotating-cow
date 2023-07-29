function colorCone()
{
    var positions = [];
    var colors = [];

    var vertices = [
        vec3(0, 1.5, 0),
        vec3(1, -1.5, 0), 
        vec3(0.809017, -1.5, 0.587785),
        vec3(0.309017, -1.5, 0.951057), 
        vec3(-0.309017, -1.5, 0.951057), 
        vec3(-0.809017, -1.5, 0.587785),
        vec3(-1, -1.5, 0), 
        vec3(-0.809017, -1.5, -0.587785),
        vec3(-0.309017, -1.5, -0.951057), 
        vec3(0.309017, -1.5, -0.951057), 
        vec3(0.809017, -1.5, -0.587785)
    ];
    var indices = [
        vec3(0, 1, 2),
        vec3(0, 2, 3),
        vec3(0, 3, 4),
        vec3(0, 4, 5),
        vec3(0, 5, 6),
        vec3(0, 6, 7),
        vec3(0, 7, 8),
        vec3(0, 8, 9),
        vec3(0, 9, 10),
        vec3(0, 10, 1)
    ];

    for (const surface of indices) {
        positions.push( vertices[surface[0]] );
        positions.push( vertices[surface[1]] );
        positions.push( vertices[surface[2]] );
        colors.push([1,0,0,1]);
        colors.push([1,0,0,1]);
        colors.push([1,0,0,1]);
    }

    // flatten
    positions = flatten(positions);
    colors = flatten(colors);
    return [positions, colors];
}