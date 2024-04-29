// @ts-checks

import * as THREE from "../libs/CS559-Three/build/three.module.js";
import { ScreenOverlay } from "./screenoverlay.js"; 
//import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "../libs/CS559-Three/examples/jsm/controls/PointerLockControls.js";
import { EnderDragon } from "./models/ender_dragon.js";
import { Firework } from "./models/fireworks.js";
import * as landscapeTools from "./utilities/landscapetools.js";
import * as controls from "./utilities/controls.js";
import * as config from "./config.js";
import { Vector3 } from "./libs/CS559-Three/build/three.module.js";

let canvas = document.getElementById("overlay");
let overlay = new ScreenOverlay( canvas, window.innerWidth, window.innerHeight );


let renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("gamescreen").appendChild(renderer.domElement);
renderer.domElement.id = "canvas";

let scene = new THREE.Scene();
scene.background = new THREE.Color( "black" );//0x8FBCD4 );

// Lights
let dlight1 = new THREE.DirectionalLight( "white", config.USE_TEXTURES?1:10 );
dlight1.position.set( 50, 50, 50 );
scene.add(dlight1);
let dlight2 = new THREE.DirectionalLight( "white", config.USE_TEXTURES?1:10 );
dlight2.position.set( -50, 50, -50 );
scene.add(dlight2);
let light_amb = new THREE.AmbientLight("white", config.USE_TEXTURES?1:2 );
scene.add(light_amb);

//let startPos = new Vector3(-40,50,40);
let startPos = new Vector3(-10,10,10);

// Camera
let camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, config.RENDER_DISTANCE );
camera.position.set( startPos.x, startPos.y, startPos.z );
camera.lookAt(0,10,0);

// since we're animating, add OrbitControls
//let controls = new OrbitControls(camera, renderer.domElement);
let playerControls = new PointerLockControls (camera, renderer.domElement);
let player = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: "red"}));
scene.add(player);

player.position.set( startPos.x, startPos.y, startPos.z );
player.geometry.computeBoundingBox();
playerControls.getObject().position.set(  startPos.x, startPos.y, startPos.z  );

let playerCollisionBox = new THREE.Box3().setFromObject( player );//copy( player.geometry.boundingBox ).applyMatrix4( player.matrixWorld );
playerCollisionBox.setFromObject( player );

// Build the scene
const flightRadius = config.TERRAIN_SIZE/2;
const enderDragon = new EnderDragon({ x:flightRadius , y:config.DRAGON_FLIGHT_HEIGHT , z:0 });
scene.add(enderDragon.body);

const numPts = 6;
function updateFlightPath( params = {} ) {
    let ctrlPts = [];
    let distances = [];
    for ( let i = 0; i < numPts; i++ ) {
        let flightPoint = new THREE.Vector3( flightRadius * Math.cos( i * 2 * Math.PI/numPts ), config.DRAGON_FLIGHT_HEIGHT, flightRadius * Math.sin( i * 2 * Math.PI/numPts ));
        ctrlPts.push( flightPoint );
        if ( !( params.targetFlightPosition === undefined )) distances.push( flightPoint.distanceTo( params.targetFlightPosition ) );
    }

    if ( !( params.targetFlightPosition === undefined )) {
        let mindist = distances[0];
        let ndx = 0;
        for ( let i = 1; i < numPts; i++ ) {
            if (distances[i] < mindist) {
                mindist = distances[i];
                ndx = i;
            }
        }
        ctrlPts[ndx] = params.targetFlightPosition;
    }

    let path = new THREE.CatmullRomCurve3( ctrlPts );
    path.closed = true;
    path.tension = 0;
    return path;
}
let flightPath = updateFlightPath();

// returns if the dragon is at the nearest or futhest position from the target based on the mode (mode == 1 means return furthest)
function atExtremePosition ( dragonPosition, flightPath, target, mode ) {
    const TOLERANCE = 1;
    const NUMSAMPLES = 30;

    const dragonDist = dragonPosition.distanceTo( target );
    let maxdist, mindist;
    for ( let u = 0; u < 1; u += 1/NUMSAMPLES ) {
        const pathpoint = flightPath.getPointAt( u );
        
        if ( maxdist === undefined ) maxdist = pathpoint.distanceTo ( target );
        else maxdist = Math.max( pathpoint.distanceTo ( target ), maxdist );

        if ( mindist === undefined ) mindist = pathpoint.distanceTo ( target );
        else mindist = Math.min( pathpoint.distanceTo ( target ), mindist );
    }

    const dist = (mode == 1) ? maxdist:mindist;
    return ( Math.abs( dist - dragonDist ) <= TOLERANCE );
}

let terrainBlockArray = landscapeTools.generateTerrain( scene, { maxHeight:5, maxWidth: config.TERRAIN_SIZE, perlinscale:20, seed:2 });
let endCrystalArray = landscapeTools.generateEndSpikes( scene, terrainBlockArray, { num:5 } );

let fireworks = [];
for (let i = 0; i < config.MAX_FIREWORKS; i++) fireworks[i] = new Firework( scene );

function slayDragon( dragonPos, delta ) {
    const offsetStrength = 2;
    enderDragon.body.visible = false;
    dragonSlain = true;

    if ( endFireworkDelay <= 0 && endFireworkCount > 0 ) {
        for ( let i = 0; i < fireworks.length; i++ ) {
            if (!fireworks[i].deployed) {
                let target = dragonPos.clone();
                target.x += offsetStrength * ( Math.random() * 2 - 1 );
                target.y += offsetStrength * ( Math.random() * 2 - 1 );
                target.z += offsetStrength * ( Math.random() * 2 - 1 );
                fireworks[i].launch( target, new THREE.Vector3( 0, 0, 0 ) );
                fireworks[i].explode( delta );
                //console.log("manually exploded firework: slayDragon");

                endFireworkDelay = 250;
                endFireworkCount--;
                break;
            }
        }
    } else if ( endFireworkCount > 0 && endFireworkDelay > 0 ) endFireworkDelay -= delta;
}

// Animation loop
let lasttime;
let playerPosition = playerControls.getObject().position;
let playerVelocity = new THREE.Vector3(0,0,0);
let flightPhase = 0;
let countdownUntilNextAttack = config.DRAGON_ATTACK_DELAY;
let flightMode = "cruising"
let target = playerPosition.clone().add( new THREE.Vector3( 0,0,0 ));
let dragonFlightSpeed = config.CRUSING_FLIGHT_SPEED;
let hitCoolDown = 1000;
let rocketCoolDown = 1000;
let playerHealth = 100;
let damagePoints = 25;
let dragonSlain = false;
let endFireworkDelay = 250;
let endFireworkCount = 5;
let paused = true;

let render = function(time) {
    if (!(lasttime === undefined)) {
        const timestep = time - lasttime;

        if ( !dragonSlain ) {
            // Update Ender dragon position in world
            enderDragon.stepAnimation( timestep );
            const dragonposition = flightPath.getPointAt( flightPhase );
            const tangent = flightPath.getTangentAt( flightPhase );
            let dragonorientaton = dragonposition.clone().add( tangent );
            enderDragon.body.position.set( dragonposition.x, dragonposition.y, dragonposition.z );
            enderDragon.body.lookAt(dragonorientaton);
            // update bounding box
            enderDragon.collisionBox.copy( enderDragon.collisionBox_mesh.geometry.boundingBox ).applyMatrix4( enderDragon.collisionBox_mesh.matrixWorld );
            flightPhase = ( flightPhase + timestep * dragonFlightSpeed/1000 ) % 1;

            // Ender dragon attack logic
            if ( flightMode == "cruising" && countdownUntilNextAttack > 0 && !paused ) {
                countdownUntilNextAttack -= timestep;
            } else if (flightMode == "cruising" && countdownUntilNextAttack <= 0) {
                target = playerPosition.clone().add( new THREE.Vector3( 0,0,0 ));
                flightMode = "preparing to attack"
            } else if (flightMode == "preparing to attack" && atExtremePosition( enderDragon.body.position, flightPath, target, 1 )) {
                flightPath = updateFlightPath({ targetFlightPosition:target });
                flightMode = "attacking";
            } else if ( flightMode == "attacking" && atExtremePosition( enderDragon.body.position, flightPath, target, 0 )) {
                flightMode = "recovering";
            } else if ( flightMode == "recovering" && atExtremePosition( enderDragon.body.position, flightPath, target, 1 )) {
                flightPath = updateFlightPath();
                countdownUntilNextAttack = config.DRAGON_ATTACK_DELAY;
                dragonFlightSpeed = config.CRUSING_FLIGHT_SPEED;
                flightMode = "cruising";
            } else if ( flightMode == "attacking" ) {
                dragonFlightSpeed = Math.min ( config.CRUSING_FLIGHT_SPEED * 2, dragonFlightSpeed += config.CRUSING_FLIGHT_SPEED * timestep/1000 );
            } else if ( flightMode == "recovering" ) {
                dragonFlightSpeed = Math.max ( config.CRUSING_FLIGHT_SPEED, dragonFlightSpeed -= config.CRUSING_FLIGHT_SPEED * timestep/1000 );
            }
        }

        if ( playerControls.isLocked === true ) controls.updatePlayerPosition( playerControls, player, playerCollisionBox, playerVelocity, playerDirectionInput, raycaster, scene, timestep );
        
        let playerHit = controls.checkCollisions( enderDragon.collisionBox, playerCollisionBox);
        if ( playerHit ) playerVelocity = new THREE.Vector3(0,config.KNOCKBACK_VELOCITY_Y,0); 

        for (let i = 0; i < endCrystalArray.length; i++ ) { 
            endCrystalArray[i].animate( timestep );
            let endCrystalHit = controls.checkCollisions(fireworks[i].collisionBox,enderDragon.collisionBox);
        }

        for (let i = 0; i < fireworks.length; i++ ) {
            if ( fireworks[i].deployed ) {
                fireworks[i].fly( timestep );
                
                for (let i = 0; i < endCrystalArray.length; i++ ) { 
                    let endCrystalHit = controls.checkCollisions(fireworks[i].collisionBox, endCrystalArray[i].collisionBox);
                    if ( endCrystalHit && endCrystalArray[i].block.visible ) {
                        endCrystalArray[i].block.visible = false;
                        fireworks[i].explode( timestep );
                        //console.log("externally exploded firework: EndCrystal hit box");
                    }
                }
                
                let dragonHit = controls.checkCollisions(fireworks[i].collisionBox, enderDragon.collisionBox);
                if ( dragonHit && !dragonSlain ) {
                    //console.log("externally exploded firework: dragon hit box");
                    if ( hitCoolDown <= 0 ) {
                        fireworks[i].explode( timestep );
                        enderDragon.health = Math.max( 0, enderDragon.health -= damagePoints );
                        hitCoolDown = 1000;
                    }
                }
            } else if ( fireworks[i].exploding ) {
                fireworks[i].explode( timestep );
            }
        }
        hitCoolDown = Math.max( 0, hitCoolDown -= timestep);
        rocketCoolDown = Math.max( 0, rocketCoolDown -= timestep);

        if ( enderDragon.health <= 0 ) slayDragon( enderDragon.body.position, timestep );

        // if the player falls out of the world return to spawn
        if ( playerPosition.y < -config.RENDER_DISTANCE ) {
            player.position.set( startPos.x, startPos.y, startPos.z );
            player.geometry.computeBoundingBox();
            playerControls.getObject().position.set(  startPos.x, startPos.y, startPos.z  );
            camera.lookAt(0,10,0);
        }

        renderer.render(scene,camera);
        overlay.draw({ selectedItem:selectedItem, playerHealth:playerHealth, dragonHealth:enderDragon.health, paused:paused });
    }

    lasttime = time;
    window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);

// Player controls
const raycaster = new THREE.Raycaster();

let clickPosition = new THREE.Vector2(0,0);
function onMouseClick( event ) {
    if ( playerControls.isLocked === true ) {
        raycaster.setFromCamera( clickPosition, camera );
        // if the user is holding ctrl key while clicking that is considered a remove block operation, else it's add block
        landscapeTools.placeGroundBlock( terrainBlockArray, scene, raycaster, event.ctrlKey);
    } else {
        playerControls.lock();
    }
}
window.addEventListener( "click", onMouseClick );

let playerDirectionInput = { movefwd:false, moveback:false, moveleft:false, moveright:false, jump:false, movedown:false, canjump:true};
var activeKeys = {}; // You could also use an array
let onKeyDown, onKeyUp
let selectedItem = 2;
onKeyDown = onKeyUp = function( event ){
    activeKeys[event.code] = event.type == 'keydown';
    if (!(activeKeys["KeyW"] === undefined)) playerDirectionInput.movefwd = activeKeys["KeyW"];
    if (!(activeKeys["KeyS"] === undefined)) playerDirectionInput.moveback = activeKeys["KeyS"];
    if (!(activeKeys["KeyA"] === undefined)) playerDirectionInput.moveleft = activeKeys["KeyA"];
    if (!(activeKeys["KeyD"] === undefined)) playerDirectionInput.moveright = activeKeys["KeyD"];
    if (!(activeKeys["Space"] === undefined)) playerDirectionInput.jump = activeKeys["Space"];
    //if (event.code == "Digit1") selectedItem = 1; // block
    //if (event.code == "Digit2") { selectedItem = 2; // rocket
    
    if (event.code == "KeyE" && rocketCoolDown <= 0 ) {
        let directionvec = new THREE.Vector3( 0, 0, -1 );
        directionvec.applyQuaternion( playerControls.camera.quaternion );
        for ( let i = 0; i < fireworks.length; i++ ) {
            if (!fireworks[i].deployed) {
                fireworks[i].launch( playerPosition, directionvec );
                rocketCoolDown = 1000;
                return;
            }
        }
    }
}
addEventListener("keydown", onKeyDown );
addEventListener("keyup", onKeyUp );

playerControls.addEventListener( 'lock', function () {
    paused = false;
} );

playerControls.addEventListener( 'unlock', function () {
    paused = true;
} );