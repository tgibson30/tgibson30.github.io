import * as THREE from "../libs/CS559-Three/build/three.module.js";

import { FIREWORK_SPEED, RENDER_DISTANCE, SHOW_COLLISION_BOXES, MAX_PARTICLES_PER_FIREWORK } from "../config.js";

const globalCenter = new THREE.Vector3( 0, 0, 0 );
const particleFlightTime = 1000;
const particleReleaseRate = 10;
const particleSpeed = 10/5000;
const particleSize = 0.05;
const rocketFlightDuration = 2000;
const rocketBurstDuration = 3000;

const particle_geo = new THREE.BoxGeometry( particleSize, particleSize, particleSize );
let dummy = new THREE.Object3D();

export class Firework extends THREE.Object3D {
  /**
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
  */
 
  constructor( scene, params = {}) {
    super();
    let firework_body_geo = new THREE.CylinderGeometry( 0.5, 0.5, 3, 6 );
    let firework_cap_geo = new THREE.ConeGeometry( 0.8, 1.2, 6);
    let firework_body_mat = new THREE.MeshStandardMaterial({color: "white", metalness: 0, roughness: 0.9});
    let firework_cap_mat = new THREE.MeshStandardMaterial({color: "red", metalness: 0, roughness: 0.9});

    let firework_group = new THREE.Group();
    let firework_body = new THREE.Mesh(firework_body_geo, firework_body_mat);
    firework_group.add(firework_body);
    firework_body.rotateX(Math.PI/2);
    let firework_cap = new THREE.Mesh(firework_cap_geo, firework_cap_mat);
    firework_group.add(firework_cap);
    firework_cap.rotateX(Math.PI/2);
    firework_cap.translateY(2);

    firework_group.scale.set(params.scale?Number(params.scale):0.2, params.scale?Number(params.scale):0.2, params.scale?Number(params.scale):0.2);


    // collision box
    let collisionBox_geo = new THREE.BoxGeometry(1, 1, 4);
    let collisionBox_mat = new THREE.MeshBasicMaterial({ color:"red" });
    let collisionBox = new THREE.Mesh(collisionBox_geo, collisionBox_mat);
    if ( !SHOW_COLLISION_BOXES ) collisionBox.visible = false;
    collisionBox.geometry.computeBoundingBox();
    firework_group.add(collisionBox);
    collisionBox.translateZ( 0.5 );

    this.firework = firework_group;
    this.firework.position.x = params.x ? Number(params.x):0;
    this.firework.position.y = params.y ? Number(params.y):0;
    this.firework.position.z = params.z ? Number(params.z):0;
    this.collisionBox_mesh = collisionBox;
    this.collisionBox = new THREE.Box3().setFromObject( collisionBox );
    this.scene = scene;
    this.deployed = false;
    this.exploding = false;
    this.velocity = new THREE.Vector3( 0, 0, 0);
    this.flightDuration = rocketFlightDuration;
    this.burstDuration = rocketBurstDuration;
    this.particles = new THREE.InstancedMesh ( particle_geo, new THREE.MeshPhongMaterial({ color:"white" }), MAX_PARTICLES_PER_FIREWORK );
    this.particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.particles.frustumCulled = false;
    this.particleproperties = [];
    this.maxflyingparticlecount = Math.floor(0.5 * MAX_PARTICLES_PER_FIREWORK);
    this.timeuntilnextparticlerelease = 0;

    for ( let i = 0; i < MAX_PARTICLES_PER_FIREWORK; i++ ) { 
      this.particleproperties.push({
        type: (i < this.maxflyingparticlecount) ? "flying":"burst",
        x:this.firework.position.x,
        y:this.firework.position.y,
        z:this.firework.position.z,
        vx:0,
        vy:0,
        vz:0,
        deployed:false,
        timer: (i < this.maxflyingparticlecount) ? particleFlightTime:rocketBurstDuration,
      });
    }

    let burstColorVec = new THREE.Vector3( Math.random(), Math.random(), Math.random() );
    burstColorVec.normalize();
    const burstColor = new THREE.Color( burstColorVec.x, burstColorVec.y, burstColorVec.z );
    const flyingColor = new THREE.Color( 1, 1, 1 );
    for ( let i = 0; i < this.particles.count; i++ ) {
      const particle = this.particleproperties[i];
      this.particles.setColorAt( i, (particle.type == "burst") ? burstColor:flyingColor );
    }
    this.particles.material.transparent = true;
    this.particles.instanceColor.needsUpdate = true;
  }

  launch( startPos, trajectory ) {
    const trajectory_norm = trajectory.clone().normalize();
    this.velocity.add( trajectory );
    this.velocity.normalize().multiplyScalar( FIREWORK_SPEED );

    this.firework.position.set( startPos.x, startPos.y, startPos.z );

    let orientation = this.firework.position.clone().add( trajectory_norm );
    this.firework.lookAt( orientation );

    this.scene.add( this.firework );
    this.scene.add( this.particles );
    this.particles.visible = true;

    this.flightDuration = rocketFlightDuration;
    this.burstDuration = rocketBurstDuration;
    this.deployed = true;
  }

  explode( delta ) {
    if ( !this.exploding ) {
      this.velocity = new THREE.Vector3( 0, 0, 0);
      this.scene.remove( this.firework );
      //this.scene.remove( this.particles );
      this.exploding = true;

      let fireworkbodypos = this.firework.position.clone();
      for ( let i = 0; i < this.particles.count; i++ ) {
        const particle = this.particleproperties[i];
        if ( particle.type == "burst" ) {
          const particleTrajectory =  new THREE.Vector3(); //this.getPerpendicularVec( this.velocity );
          particleTrajectory.multiplyScalar( particleSpeed );
          particleTrajectory.x = Math.random() * 2 - 1;
          particleTrajectory.y = Math.random() * 2 - 1;
          particleTrajectory.z = Math.random() * 2 - 1;
          particleTrajectory.normalize().multiplyScalar( particleSpeed );

          particle.x = fireworkbodypos.x;
          particle.y = fireworkbodypos.y;
          particle.z = fireworkbodypos.z;
          particle.vx = particleTrajectory.x;
          particle.vy = particleTrajectory.y;
          particle.vz = particleTrajectory.z;
          particle.timer = rocketBurstDuration;

          dummy.position.set( particle.x, particle.y, particle.z );
          dummy.updateMatrix();
          this.particles.setMatrixAt( i, dummy.matrix );

          particle.deployed = true;
        }
      }
    } else if ( this.burstDuration > 0 ) {
      this.particles.material.opacity = ( this.burstDuration/rocketBurstDuration )
      this.particles.material.needsUpdate = true;

      this.updateParticles( delta );
      this.burstDuration -= delta;
    } else {
      this.cleanup();
    }
    

  }

  fly ( delta ) {
    this.firework.position.x += this.velocity.x * delta;
    this.firework.position.y += this.velocity.y * delta;
    this.firework.position.z += this.velocity.z * delta;

    this.collisionBox.copy( this.collisionBox_mesh.geometry.boundingBox ).applyMatrix4( this.collisionBox_mesh.matrixWorld );

    this.updateParticles( delta );

    this.flightDuration -= delta;
    if ( this.flightDuration <= 0 ) {
      this.explode( delta );
    }

    // catch all in case fireworks are off too far in space
    const distance = this.firework.position.distanceTo( globalCenter );
    if ( distance > RENDER_DISTANCE ) {
      this.cleanup();
    }
  }

  updateParticles( delta ) { 
    let fireworkbodypos = this.firework.position.clone();
    //this.particles.position.set( fireworkbodypos.x, fireworkbodypos.y, fireworkbodypos.z );
    //const matrix = new THREE.Matrix4();

    // update deployed particles
    for ( let i = 0; i < this.particles.count; i++) {
      const particle = this.particleproperties[i];
      if ( particle.deployed && ( particle.timer > 0 || particle.type == "burst" ) ) {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.z += particle.vz * delta;
        particle.timer -= delta;

      } else if ( particle.deployed && particle.timer <= 0 && particle.type == "flying") {
        particle.x = fireworkbodypos.x;
        particle.y = fireworkbodypos.y;
        particle.z = fireworkbodypos.z;
        particle.vx = 0;
        particle.vy = 0;
        particle.vz = 0;
        particle.deployed = false;
        particle.timer = particleFlightTime;
      } else if ( !particle.deployed && !this.exploding ) { // not deployed keep with the firework body
        particle.x = fireworkbodypos.x;
        particle.y = fireworkbodypos.y;
        particle.z = fireworkbodypos.z;
      }

      dummy.position.set( particle.x, particle.y, particle.z );
      dummy.updateMatrix();
      this.particles.setMatrixAt( i, dummy.matrix );

    }

    // deploy new particle if its time
    if ( this.timeuntilnextparticlerelease <= 0 && !this.exploding ) {
      for ( let i = 0; i < this.particleproperties.length; i++ ) {
        const particle = this.particleproperties[i];
        if ( !particle.deployed && particle.type == "flying" ) {
          const particleTrajectory =  new THREE.Vector3(); //this.getPerpendicularVec( this.velocity );
          particleTrajectory.multiplyScalar( particleSpeed );
          particleTrajectory.x = Math.random() * 2 - 1;
          particleTrajectory.y = Math.random() * 2 - 1;
          particleTrajectory.z = Math.random() * 2 - 1;
          particleTrajectory.normalize().multiplyScalar( particleSpeed );

          particle.x = fireworkbodypos.x;
          particle.y = fireworkbodypos.y;
          particle.z = fireworkbodypos.z;
          particle.vx = particleTrajectory.x;
          particle.vy = particleTrajectory.y;
          particle.vz = particleTrajectory.z;

          dummy.position.set( particle.x, particle.y, particle.z );
          dummy.updateMatrix();
          this.particles.setMatrixAt( i, dummy.matrix );

          particle.deployed = true;
          this.timeuntilnextparticlerelease = particleReleaseRate;
          return;
        }
      }
      this.timeuntilnextparticlerelease = particleReleaseRate;
    } else if (!this.exploding) this.timeuntilnextparticlerelease -= delta;

    this.particles.instanceMatrix.needsUpdate = true;
  }


  getPerpendicularVec( vec ) {
    let perpvec = new THREE.Vector3();
    perpvec.x = vec.y;
    perpvec.y = -vec.x;
    perpvec.z = vec.z;

    perpvec.normalize();
    
    return perpvec;
  }

  cleanup( ) {
    this.exploding = false;
    this.deployed = false;
    this.burstDuration = rocketBurstDuration;
    this.flightDuration = rocketFlightDuration;
    this.timeuntilnextparticlerelease = 0;
    this.velocity = new THREE.Vector3( 0, 0, 0);
    this.scene.remove( this.firework );
    this.scene.remove( this.particles );
    this.particles.material.opacity = 1;
    this.particles.material.needsUpdate = true;

    for ( let i = 0; i < this.particles.count; i++ ) { 
      const particle = this.particleproperties[i];
        particle.x = 0;
        particle.y = 0;
        particle.z = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.vz = 0;
        particle.deployed = false;
        particle.timer = (i < this.maxflyingparticlecount) ? particleFlightTime:rocketBurstDuration;
    }
  }
}
