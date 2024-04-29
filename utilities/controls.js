import * as THREE from "../libs/CS559-Three/build/three.module.js";

import { BLOCKSIZE, PLAYERSPEED, GRAVITY_ENABLED } from "../config.js";

export function updatePlayerPosition ( controls, playerObj, collisionBox,  velocity, directionInput, raycaster, scene, delta ) {
    let position = controls.getObject().position;

    velocity.x -= velocity.x * 0.25;
    velocity.z -= velocity.z * 0.25;
    if ( Math.abs(velocity.x) < 1e-5 ) velocity.x = 0;
    if ( Math.abs(velocity.z) < 1e-5 ) velocity.z = 0;

    let groundY = getNearestObjectBelow( raycaster, position, scene );
    let targetY = groundY + 3*BLOCKSIZE;
    const groundBelow = !( groundY === null );
    if ( position.y <= targetY && groundBelow && GRAVITY_ENABLED ) {
        position.y = targetY;
        directionInput.canjump = true;
    }
    if ( ( position.y > targetY || !groundBelow ) && GRAVITY_ENABLED ) {
        velocity.y -= 6/100000 * delta;
        position.y += velocity.y * delta;
        if ( groundBelow ) position.y = Math.max(position.y,targetY); 
    }

    let direction = new THREE.Vector3( 0,0,0 );
    direction.z = Number( directionInput.movefwd ) - Number( directionInput.moveback );
    direction.x = Number( directionInput.moveright ) - Number( directionInput.moveleft );
    direction.normalize();

    if ( directionInput.movefwd  || directionInput.moveback ) velocity.z = direction.z * PLAYERSPEED * delta;
    if ( directionInput.moveleft || directionInput.moveright ) velocity.x = direction.x * PLAYERSPEED * delta;
    if ( directionInput.jump && directionInput.canjump ) {
        if ( GRAVITY_ENABLED ) {
            velocity.y = 15/1000;
            position.y += velocity.y * delta;
            directionInput.canjump = false;
        } else {
            position.y += delta * PLAYERSPEED * 10;
        }
    }
    if ( directionInput.movedown && !GRAVITY_ENABLED) position.y -= delta * PLAYERSPEED * 10;

    controls.moveRight( velocity.x * delta );
    controls.moveForward( velocity.z * delta );

    playerObj.position.set( position.x, position.y, position.z );
    collisionBox.copy( playerObj.geometry.boundingBox ).applyMatrix4( playerObj.matrixWorld );
};

function getNearestObjectBelow ( raycaster, position, scene ) {
    raycaster.set( position, new THREE.Vector3 (0, -1, 0) );
    const intersectingObjs = raycaster.intersectObjects( scene.children );

    if ( intersectingObjs.length > 0 )  return intersectingObjs[0].object.position.y;
    else return null;
}

export function checkCollisions( boundingBox1 , boundingBox2 ) {
    return boundingBox1.intersectsBox(boundingBox2)
}
