import * as T from "../libs/CS559-Three/build/three.module.js";
import { GroundBlock, SpikeBlock, EndCrystal } from "../models/blocks.js";
import { Perlin } from './perlin.js';

import { BLOCKSIZE, MIN_SPIKE_HEIGHT, MAX_SPIKE_HEIGHT, TERRAIN_SIZE } from "../config.js";

export function placeGroundBlock( terrainBlockArray, scene, raycaster, remove ) {
    const intersectingObjs = raycaster.intersectObjects( scene.children );
    if (intersectingObjs.length > 0) {
        const closestObj = intersectingObjs[0];
        const isPlaceable = (closestObj.object.parent.type == "Scene");

        // add block
        if (!remove && isPlaceable) {
            const targetBlockNormal = closestObj.normal.clone().multiplyScalar(BLOCKSIZE);
            const newBlockPosition = closestObj.object.position.clone().add(targetBlockNormal);
            const block = new GroundBlock({x:newBlockPosition.x, y:newBlockPosition.y, z:newBlockPosition.z, size:BLOCKSIZE})
            scene.add(block.block);
            terrainBlockArray.push(block);
        }

        // remove block
        if (remove && terrainBlockArray.length > 1) {
            scene.remove(closestObj.object);
            const block2removeposition = closestObj.object.position;
            for (let i = terrainBlockArray.length - 1; i >= 0; i--) {
                let curblockposition = terrainBlockArray[i].block.position;
                if (curblockposition.x == block2removeposition.x && curblockposition.y == block2removeposition.y && curblockposition.z == block2removeposition.z) terrainBlockArray.splice(i,1);
            }
        } 
    
    }
}

export function removeBlockAt( terrainBlockArray, position, scene ) {
    if (terrainBlockArray.length > 1) {
        const block2removeposition = position;
        for (let i = terrainBlockArray.length - 1; i >= 0; i--) {
            let curblock = terrainBlockArray[i].block;
            let curblockposition = terrainBlockArray[i].block.position;
            if ( curblockposition.x == block2removeposition.x && curblockposition.y == block2removeposition.y && curblockposition.z == block2removeposition.z ) {
                terrainBlockArray.splice(i,1);
                scene.remove(curblock);
                return 1;
            }
        }
    }
    return 0; // no blocks found at that position
}

export function generateTerrain( scene, params = {}) {
    const MAXWIDTH = params.maxWidth?Number(params.maxWidth):100;
    const MAXHEIGHT = params.maxHeight?Number(params.maxHeight):3;
    const MAXDEPTH = params.maxDepth?Number(params.maxDepth):0;
    const PERLINSCALE = params.perlinscale?Number(params.perlinscale):10;
    const SEED = params.seed?Number(params.seed):0;

    let terrainBlockArray = [];
    const noise = new Perlin();
    noise.seed(SEED);

    for (let y = -MAXDEPTH; y <= MAXHEIGHT; y += BLOCKSIZE) {
        for (let x = -Math.floor(MAXWIDTH/2); x <= Math.ceil(MAXWIDTH/2); x += BLOCKSIZE) {
            for (let z = -Math.floor(MAXWIDTH/2); z <= Math.ceil(MAXWIDTH/2); z += BLOCKSIZE) {
                if (y <= 0) {
                    const block = new GroundBlock({x:x, y:y, z:z, size:BLOCKSIZE})
                    scene.add(block.block);
                    terrainBlockArray.push(block);
                } else {
                    const xnorm = x/PERLINSCALE;
                    const znorm = z/PERLINSCALE;
                    const n = noise.perlin2(xnorm,znorm);
                    const targetelevation = Math.round((MAXHEIGHT+1)/2 * n + (MAXHEIGHT+1)/2) - 1;

                    if (y <= targetelevation) {
                        const block = new GroundBlock({x:x, y:y, z:z, size:BLOCKSIZE})
                        scene.add(block.block);
                        terrainBlockArray.push(block);
                    }
                }
            }
        }
    }

    return terrainBlockArray;
}

export function generateEndSpikes( scene, terrainBlockArray, params = {}) {
    const numspikes = params.num?Number(params.num):3;
    const radius = 0.75 * TERRAIN_SIZE/2;
    const pattern = [
        0, 0,
        0, 1,
        0, 2,
        0, -1,
        0, -2,
        -1, 1,
        -1, 0,
        -1, -1,
        1, 1,
        1, 0,
        1, -1,
        -2, 0,
        2, 0
    ]

    let endCrystalArray = [];
    
    for (let i = 0; i < numspikes; i++) {
        const spikeheight = Math.floor( (i + 1) * MAX_SPIKE_HEIGHT/numspikes )//Math.round( Math.random() * (MAX_SPIKE_HEIGHT - MIN_SPIKE_HEIGHT) + MIN_SPIKE_HEIGHT );
        const offsetposition = new T.Vector2( Math.round(radius * Math.cos( i * 2 * Math.PI/numspikes )),  Math.round(radius * Math.sin( i * 2 * Math.PI/numspikes )));

        for ( let h = 1; h < spikeheight+1; h++ ) {
            for ( let ndx = 0; ndx < pattern.length/2; ndx++) {
                const pos = new T.Vector3( offsetposition.x + pattern[ndx * 2], h, offsetposition.y + pattern[ndx * 2 + 1] )
                removeBlockAt( terrainBlockArray, pos, scene );
                let block = new SpikeBlock({ x:pos.x, y:pos.y, z:pos.z })
                terrainBlockArray.push(block);
                scene.add(block.block);

                // add the end crystal if we are at the top of the spike
                if ( h == spikeheight &&  ndx == 0 ) {
                    let crystal = new EndCrystal({ x:pos.x, y:pos.y, z:pos.z });
                    endCrystalArray.push(crystal)
                    scene.add(crystal.block);
                }
            }
        }
    }

    return endCrystalArray
}
