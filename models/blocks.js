// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { BLOCKSIZE, SHOW_COLLISION_BOXES, USE_TEXTURES } from "../config.js";

const block_geo = new T.BoxGeometry(BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
let GroundBlockMap = new T.TextureLoader().load("./textures/end_stone.png");
GroundBlockMap.colorSpace = T.SRGBColorSpace;
let SpikeBlockMap = new T.TextureLoader().load("./textures/obsidian.png");
SpikeBlockMap.colorSpace = T.SRGBColorSpace;

export class GroundBlock extends T.Object3D{
  /**
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
  */
 
  constructor(params = {}) {
    super();
    let block_mat = new T.MeshStandardMaterial( USE_TEXTURES ? { map: GroundBlockMap }:{ color: "green", metalness: 0, roughness: 0.9 });
    let block = new T.Mesh(block_geo, block_mat);

    this.block = block;
    this.block.position.x = params.x ? Number(params.x):0;
    this.block.position.y = params.y ? Number(params.y):0;
    this.block.position.z = params.z ? Number(params.z):0;
  }
}

export class SpikeBlock extends T.Object3D{
  /**
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
  */
 
  constructor(params = {}) {
    super();
    //let block_geo = new T.BoxGeometry(params.size?Number(params.size):1, params.size?Number(params.size):1, params.size?Number(params.size):1);
    let block_mat = new T.MeshStandardMaterial(USE_TEXTURES ? { map: SpikeBlockMap }:{ color: "blue", metalness: 0, roughness: 0.9 });
    let block = new T.Mesh(block_geo, block_mat);

    this.block = block;
    this.block.position.x = params.x ? Number(params.x):0;
    this.block.position.y = params.y ? Number(params.y):0;
    this.block.position.z = params.z ? Number(params.z):0;
  }
}

export class EndCrystal extends T.Object3D{
  /**
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
  */
 
  constructor(params = {}) {
    super();
    let block_group_inner = new T.Group();
    let block_mat = new T.MeshStandardMaterial({color: "red", metalness: 0, roughness: 0.9});
    let block = new T.Mesh(block_geo, block_mat);
    block_group_inner.add(block);
    block.rotateX(Math.PI/4);
    block.rotateZ(Math.PI/4);


    const edges1 = new T.EdgesGeometry( block_geo ); 
    const line1 = new T.LineSegments(edges1, new T.LineBasicMaterial( { color: 0xffffff } ) );
    block_group_inner.add(line1);

    const edges2 = new T.EdgesGeometry( block_geo ); 
    const line2 = new T.LineSegments(edges2, new T.LineBasicMaterial( { color: 0xffffff } ) );
    block_group_inner.add(line2);

    let block_group_outer = new T.Group();
    block_group_outer.add(block_group_inner);

    // collision box
    let collisionBox_geo = new T.BoxGeometry( 3 * BLOCKSIZE, 3 * BLOCKSIZE, 3 * BLOCKSIZE );
    let collisionBox_mat = new T.MeshBasicMaterial({color:"red"});
    let collisionBox = new T.Mesh(collisionBox_geo, collisionBox_mat);
    if ( !SHOW_COLLISION_BOXES ) collisionBox.visible = false;
    collisionBox.geometry.computeBoundingBox();
    block_group_outer.add(collisionBox);

    this.block = block_group_outer;
    this.inner_group = block_group_inner;
    this.crystal = block;
    this.outline1 = line1;
    this.outline2 = line2;
    this.block.position.x = params.x ? Number(params.x):0;
    this.block.position.y = (params.y ? Number(params.y):0) + 2 * BLOCKSIZE;
    this.block.position.z = params.z ? Number(params.z):0;
    this.collisionBox_mesh = collisionBox;
    this.collisionBox = new T.Box3().setFromObject( collisionBox );
    this.offset = 2*Math.random();
    this.time = 0;
  }

  animate( delta ) {
    this.time += delta;
    this.time = this.time%1000000; // don't let time get too large

    this.inner_group.position.y = BLOCKSIZE * Math.cos(this.time/250 + this.offset);
    this.collisionBox.copy( this.collisionBox_mesh.geometry.boundingBox ).applyMatrix4( this.collisionBox_mesh.matrixWorld );

    this.crystal.rotateX(delta/1000);
    this.crystal.rotateY(delta/1000);
    this.outline1.rotateY(delta/1000);
    this.outline1.rotateZ(delta/1000);
    this.outline2.rotateZ(delta/1000);
    this.outline2.rotateX(delta/1000);
    
  }
}