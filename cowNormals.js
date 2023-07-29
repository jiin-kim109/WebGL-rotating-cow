
function computeCowSurfaceNormal() {
    const vertices = get_cow_vertices();
    const faces = get_cow_faces();
    const surfaceNormal = [];

    for (const surface of faces) {
        const v1 = vertices[surface[0]-1];
        const v2 = vertices[surface[1]-1];
        const v3 = vertices[surface[2]-1];
        const p1 = subtract(v2, v1);
        const p2 = subtract(v3, v2);
        const n = normalize(cross(p1, p2));

        surfaceNormal.push(n);
    }
    return surfaceNormal;
}

function computeCowVertexNormals() {
    const surfaceNormal = computeCowSurfaceNormal();
    const vertices = get_cow_vertices();
    const faces = get_cow_faces();
    const vertexNormal = [];

    for (var vIndex=0; vIndex<vertices.length; vIndex++) {
        const adjFaceIndicies = [];
        for (var fIndex=0; fIndex<faces.length; fIndex++) {
            const surface = faces[fIndex];
            const v1Idx = surface[0]-1;
            const v2Idx = surface[1]-1;
            const v3Idx = surface[2]-1;
            if (vIndex == v1Idx || vIndex == v2Idx || vIndex == v3Idx) {
                adjFaceIndicies.push(fIndex);
            }
        }
        const n = normalize(adjFaceIndicies.reduce((acc, fIndex) => {
            acc[0] += surfaceNormal[fIndex][0];
            acc[1] += surfaceNormal[fIndex][1];
            acc[2] += surfaceNormal[fIndex][2];
            return acc;
        }, [0,0,0]));
        vertexNormal.push(n);
    }
    return vertexNormal;
}