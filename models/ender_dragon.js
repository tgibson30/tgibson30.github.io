// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";

import { SHOW_COLLISION_BOXES } from "../config.js";

export class EnderDragon extends T.Object3D{
  /**
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
  */
 
  constructor(params = {}) {
    super();
    //let dot_geo = new T.SphereGeometry(0.2);
    //let dot_mat = new T.MeshStandardMaterial({color: "red", metalness: 0.7, roughness: 0.4});
    //let dot = new T.Mesh(dot_geo, dot_mat);

    let skintexture = new T.MeshPhongMaterial({color: "#301934"});
    let scaletexture = new T.MeshPhongMaterial({color: "#3B3B3B"});
    let eyetexture = new T.MeshPhongMaterial({color: "#D5B3FC"});
    let pupiltexture = new T.MeshPhongMaterial({color: "#E52BCB"});
    let wingbonetexture = new T.MeshPhongMaterial({color: "#696969"});
    let wingtexture = new T.MeshPhongMaterial({color: "#141414", side: T.DoubleSide});

    let enderDragon_group = new T.Group();
    enderDragon_group.position.set(params.x, params.y, params.z);

    // create the head with an articulating jaw
    let head_group = new T.Group();
    enderDragon_group.add(head_group);
    head_group.translateZ(5);
    let head_geo = new T.BoxGeometry(1, 1, 1);
    let head = new T.Mesh(head_geo,skintexture);
    head_group.add(head);
    let jaw_geo = new T.BoxGeometry(0.8, 0.25, 0.9);
    let upperjaw = new T.Mesh(jaw_geo,skintexture);
    head_group.add(upperjaw);
    upperjaw.position.set(0,-0.2,0.9);

    let lowerjaw_group = new T.Group();
    head_group.add(lowerjaw_group);
    lowerjaw_group.position.set(0,-0.35,0.5)
    let lowerjaw = new T.Mesh(jaw_geo,skintexture);
    lowerjaw_group.add(lowerjaw);
    lowerjaw.position.set(0,-0.1,0.4);

    let nostril_geo = new T.BoxGeometry(0.25,0.125,0.25);
    let left_nostril = new T.Mesh(nostril_geo,skintexture);
    let right_nostril = new T.Mesh(nostril_geo,skintexture);
    upperjaw.add(left_nostril);
    upperjaw.add(right_nostril);
    left_nostril.position.set(-0.25,0.1875,0.15);
    right_nostril.position.set(0.25,0.1875,0.15);

    let eye_curve = new T.Shape();
    eye_curve.moveTo(-0.125, 0.0625);
    eye_curve.lineTo(0, 0.0625);
    eye_curve.lineTo(0.125, 0);
    eye_curve.lineTo(0.125, -0.0625);
    eye_curve.lineTo(-0.125, -0.0625);
    eye_curve.lineTo(-0.125, 0.0625);
    let eye_geo = new T.ExtrudeGeometry(eye_curve, {steps: 2, depth: 0.2, bevelEnabled: false});
    let left_eye = new T.Mesh(eye_geo, eyetexture);
    let right_eye = new T.Mesh(eye_geo, eyetexture);
    right_eye.scale.set(-1,1,1)
    head.add(left_eye);
    head.add(right_eye);
    left_eye.position.set(-0.25,0.08,0.305);
    right_eye.position.set(0.25,0.08,0.305);

    let pupil_curve = new T.Shape();
    pupil_curve.moveTo(-0.0625, 0.0625);
    pupil_curve.lineTo(0, 0.0625);
    pupil_curve.lineTo(0.0625, 0.03125);
    pupil_curve.lineTo(0.0625, -0.0625);
    pupil_curve.lineTo(-0.0625, -0.0625);
    pupil_curve.lineTo(-0.0625, 0.0625);
    let pupil_geo = new T.ExtrudeGeometry(pupil_curve, {steps: 2, depth: 0.2, bevelEnabled: false});
    let left_pupil = new T.Mesh(pupil_geo, pupiltexture);
    let right_pupil = new T.Mesh(pupil_geo, pupiltexture);
    left_eye.add(left_pupil);
    right_eye.add(right_pupil);
    left_pupil.position.set(0,0,0.005);
    right_pupil.position.set(0,0,0.005);

    let head_scale_geo = new T.BoxGeometry(0.125,0.25,0.4);
    let head_scale1 = new T.Mesh(head_scale_geo,scaletexture);
    let head_scale2 = new T.Mesh(head_scale_geo,scaletexture);
    head_group.add(head_scale1);
    head_scale1.position.set(-0.25,0.625,-0.1)
    head_group.add(head_scale2);
    head_scale2.position.set(0.25,0.625,-0.1)

    // torso
    const body_length = 4;
    let torso_group = new T.Group();
    enderDragon_group.add(torso_group);
    let torso_geo = new T.BoxGeometry(1.8, 1.8, body_length);
    let torso = new T.Mesh(torso_geo,skintexture);
    torso_group.add(torso);
    let torso_scale_geo = new T.BoxGeometry(0.125,0.4,0.8);
    let torso_scale1 = new T.Mesh(torso_scale_geo,scaletexture);
    let torso_scale2 = new T.Mesh(torso_scale_geo,scaletexture);
    let torso_scale3 = new T.Mesh(torso_scale_geo,scaletexture);
    torso_group.add(torso_scale1);
    torso_scale1.position.set(0,1.1,1.2);
    torso_group.add(torso_scale2);
    torso_scale2.position.set(0,1.1,0);
    torso_group.add(torso_scale3);
    torso_scale3.position.set(0,1.1,-1.2)

    // arms
    let arm_geo = new T.BoxGeometry(0.4, 0.4, 1.2);
    let rightarm = new T.Mesh(arm_geo,skintexture);
    let leftarm = new T.Mesh(arm_geo,skintexture);
    torso_group.add(rightarm);
    rightarm.position.set(1.1,-0.5,1.1);
    rightarm.rotateX(-Math.PI/20);
    torso_group.add(leftarm);
    leftarm.position.set(-1.1,-0.5,1.1);
    leftarm.rotateX(-Math.PI/20);
    let rightforearm = new T.Mesh(arm_geo,skintexture);
    let leftforearm = new T.Mesh(arm_geo,skintexture);
    rightarm.add(rightforearm);
    rightforearm.position.set(0,-0.3,-1);
    rightforearm.rotateX(-Math.PI/5);
    leftarm.add(leftforearm);
    leftforearm.position.set(0,-0.3,-1);
    leftforearm.rotateX(-Math.PI/5);
    let hand_geo = new T.BoxGeometry(0.5, 0.3, 1);
    let righthand = new T.Mesh(hand_geo,skintexture);
    rightforearm.add(righthand);
    righthand.position.set(0,-0.1,-0.7);
    righthand.rotateX(-Math.PI/4);
    let lefthand = new T.Mesh(hand_geo,skintexture);
    leftforearm.add(lefthand);
    lefthand.position.set(0,-0.1,-0.7);
    lefthand.rotateX(-Math.PI/4);
    
    // legs
    let leg_group = new T.Group();
    torso_group.add(leg_group);
    leg_group.translateZ(-1.1);
    let leg_geo = new T.BoxGeometry(1, 1, 2);
    let rightleg = new T.Mesh(leg_geo,skintexture);
    leg_group.add(rightleg);
    rightleg.position.set(1.4,-0.2,-0.5);
    rightleg.rotateX(-Math.PI/6);
    let leftleg = new T.Mesh(leg_geo,skintexture);
    leg_group.add(leftleg);
    leftleg.position.set(-1.4,-0.2,-0.5);
    leftleg.rotateX(-Math.PI/6);
    let calf_geo = new T.BoxGeometry(0.9,0.9,2);
    let rightcalf = new T.Mesh(calf_geo,skintexture);
    rightleg.add(rightcalf);
    rightcalf.position.set(0,0.5,-1.5);
    rightcalf.rotateX(Math.PI/6);
    let leftcalf = new T.Mesh(calf_geo,skintexture);
    leftleg.add(leftcalf);
    leftcalf.position.set(0,0.5,-1.5);
    leftcalf.rotateX(Math.PI/6);
    let feet_group = new T.Group();
    leg_group.add(feet_group);
    feet_group.position.set(0,-0.1,-3);
    let foot_geo = new T.BoxGeometry(1.2, 1.4, 0.35);
    let rightfoot = new T.Mesh(foot_geo,skintexture);
    feet_group.add(rightfoot);
    rightfoot.position.set(1.4,-0.5,0);
    let leftfoot = new T.Mesh(foot_geo,skintexture);
    feet_group.add(leftfoot);
    leftfoot.position.set(-1.4,-0.5,0);
    feet_group.rotateX(Math.PI/4);

    // right wing
    let largewingsegment_geo = new T.BoxGeometry(2.8, 0.4, 0.4);
    let smallwingsegment_geo = new T.BoxGeometry(2.5, 0.2, 0.2);
    let large_wingbone_geo = new T.CylinderGeometry(0.125,0.02,2.6);
    let small_wingbone_geo = new T.CylinderGeometry(0.1,0.02,2.5);

    let right_wing_group = new T.Group();
    torso_group.add(right_wing_group);
    right_wing_group.position.set(0.9,0.9,1.3);
    let right_largewingsegment = new T.Mesh(largewingsegment_geo, wingbonetexture);
    right_wing_group.add(right_largewingsegment);
    right_largewingsegment.position.set(1.4,0,0);
    let right_smallwingsegment_group = new T.Group();
    right_wing_group.add(right_smallwingsegment_group);
    right_smallwingsegment_group.translateX(2.8);
    let right_smallwingsegment = new T.Mesh(smallwingsegment_geo, wingbonetexture);
    right_smallwingsegment_group.add(right_smallwingsegment);
    right_smallwingsegment.translateX(1);
    let right_largewingbone = new T.Mesh(large_wingbone_geo,wingbonetexture);
    right_smallwingsegment_group.add(right_largewingbone);
    right_largewingbone.rotateX(Math.PI/2);
    right_largewingbone.translateY(-1.3);
    let right_smallwingbone_1 = new T.Mesh(small_wingbone_geo,wingbonetexture);
    right_wing_group.add(right_smallwingbone_1);
    right_smallwingbone_1.rotateX(Math.PI/2);
    right_smallwingbone_1.position.set(1.8,0,-1);
    right_smallwingbone_1.rotateZ(-Math.PI/4);
    let right_smallwingbone_2 = new T.Mesh(small_wingbone_geo,wingbonetexture);
    right_smallwingsegment_group.add(right_smallwingbone_2);
    right_smallwingbone_2.rotateX(Math.PI/2);
    right_smallwingbone_2.position.set(1,0,-1);
    right_smallwingbone_2.rotateZ(Math.PI/4);

    let right_span1geometry = new T.BufferGeometry();
    const right_span1vertices = new Float32Array( [
      0, 0, 0,
      0, 0, 2.7, 
      1.9, 0, 1.9
    ]);
    right_span1geometry.setAttribute('position',new T.BufferAttribute(right_span1vertices,3));
    right_span1geometry.computeVertexNormals();
    
    let right_span23geometry = new T.BufferGeometry();
    const right_span23vertices = new Float32Array( [
      0, 0, 0,
      0, 0, 2.7, 
      1.9, 0, 1.9
    ]);
    right_span23geometry.setAttribute('position',new T.BufferAttribute(right_span23vertices,3));
    right_span23geometry.computeVertexNormals();
    
    let right_span4geometry = new T.BufferGeometry();
    const right_span4vertices = new Float32Array( [
      0, 0, 0,
      0, 0, 2.2, 
      1.9, 0, 1.9
    ]);
    right_span4geometry.setAttribute('position',new T.BufferAttribute(right_span4vertices,3));
    right_span4geometry.computeVertexNormals();

    let right_wingmesh1 = new T.Mesh(right_span1geometry, wingtexture);
    right_wing_group.add(right_wingmesh1);
    right_wingmesh1.translateX(2.8);
    right_wingmesh1.rotation.set(Math.PI,-Math.PI/2,0);
    let right_wingmesh2 = new T.Mesh(right_span23geometry, wingtexture);
    right_smallwingsegment_group.add(right_wingmesh2);
    right_wingmesh2.rotateY(3*Math.PI/4);
    let right_wingmesh3 = new T.Mesh(right_span23geometry, wingtexture);
    right_wing_group.add(right_wingmesh3);
    right_wingmesh3.translateX(2.8);
    right_wingmesh3.rotateY(Math.PI);
    let right_wingmesh4 = new T.Mesh(right_span4geometry, wingtexture);
    right_smallwingsegment_group.add(right_wingmesh4);
    right_wingmesh4.rotateY(Math.PI/2);

    // left wing
    let left_wing_group = new T.Group();
    torso_group.add(left_wing_group);
    left_wing_group.position.set(-0.9,0.9,1.3);
    let left_largewingsegment = new T.Mesh(largewingsegment_geo, wingbonetexture);
    left_wing_group.add(left_largewingsegment);
    left_largewingsegment.position.set(-1.4,0,0);
    let left_smallwingsegment_group = new T.Group();
    left_wing_group.add(left_smallwingsegment_group);
    left_smallwingsegment_group.translateX(-2.8);
    let left_smallwingsegment = new T.Mesh(smallwingsegment_geo, wingbonetexture);
    left_smallwingsegment_group.add(left_smallwingsegment);
    left_smallwingsegment.translateX(-1);
    let left_largewingbone = new T.Mesh(large_wingbone_geo,wingbonetexture);
    left_smallwingsegment_group.add(left_largewingbone);
    left_largewingbone.rotateX(Math.PI/2);
    left_largewingbone.translateY(-1.3);
    let left_smallwingbone_1 = new T.Mesh(small_wingbone_geo,wingbonetexture);
    left_wing_group.add(left_smallwingbone_1);
    left_smallwingbone_1.rotateX(Math.PI/2);
    left_smallwingbone_1.position.set(-1.8,0,-1);
    left_smallwingbone_1.rotateZ(Math.PI/4);
    let left_smallwingbone_2 = new T.Mesh(small_wingbone_geo,wingbonetexture);
    left_smallwingsegment_group.add(left_smallwingbone_2);
    left_smallwingbone_2.rotateX(Math.PI/2);
    left_smallwingbone_2.position.set(-1,0,-1);
    left_smallwingbone_2.rotateZ(-Math.PI/4);

    let left_span1geometry = new T.BufferGeometry();
    const left_span1vertices = new Float32Array( [
      0, 0, 0,
      0, 0, 2.2, 
      1.9, 0, 1.9
    ]);
    left_span1geometry.setAttribute('position',new T.BufferAttribute(left_span1vertices,3));
    left_span1geometry.computeVertexNormals();
    
    let left_span23geometry = new T.BufferGeometry();
    const left_span23vertices = new Float32Array( [
      0, 0, 0,
      0, 0, 2.7, 
      1.9, 0, 1.9
    ]);
    left_span23geometry.setAttribute('position',new T.BufferAttribute(left_span23vertices,3));
    left_span23geometry.computeVertexNormals();
    
    let left_span4geometry = new T.BufferGeometry();
    const left_span4vertices = new Float32Array( [
      0, 0, 0,
      0, 0, 2.7, 
      1.9, 0, 1.9

    ]);
    left_span4geometry.setAttribute('position',new T.BufferAttribute(left_span4vertices,3));
    left_span4geometry.computeVertexNormals();
    
    let left_wingmesh1 = new T.Mesh(left_span1geometry, wingtexture);
    left_smallwingsegment_group.add(left_wingmesh1);
    left_wingmesh1.rotation.set(Math.PI,-Math.PI/2,0);
    let left_wingmesh2 = new T.Mesh(left_span23geometry, wingtexture);
    left_wing_group.add(left_wingmesh2);
    left_wingmesh2.translateX(-2.8);
    left_wingmesh2.rotateY(3*Math.PI/4);
    let left_wingmesh3 = new T.Mesh(left_span23geometry, wingtexture);
    left_smallwingsegment_group.add(left_wingmesh3);
    left_wingmesh3.rotateY(Math.PI);
    let left_wingmesh4 = new T.Mesh(left_span4geometry, wingtexture);
    left_wing_group.add(left_wingmesh4);
    left_wingmesh4.translateX(-2.8);
    left_wingmesh4.rotateY(Math.PI/2);

    // neck
    const neck_length = head_group.position.z - torso_group.position.z;
    let neck_geo = new T.BoxGeometry(0.6,0.6,neck_length,1,1,20);
    let neck = new T.Mesh(neck_geo,skintexture);
    enderDragon_group.add(neck);
    neck.translateZ(neck_length/2);
    const orig_neck_geo_attributes = neck_geo.attributes.position.clone();
    const neck_vertex_count = orig_neck_geo_attributes.count;

    // neck scales
    const neck_scale_array = [];
    const neck_scale_count = 5;
    let neckzstart = 2.3
    const neckstep = 0.5;
    for (let i = 0; i < neck_scale_count; i++) {
      const scale = new T.Mesh(head_scale_geo,scaletexture);
      neck.add(scale);
      scale.translateY(2);
      scale.translateZ(neckzstart -= neckstep);
      neck_scale_array.push(scale);
    }

    // tail
    const tail_length = 8;
    let tail_geo = new T.BoxGeometry(0.8,0.8,tail_length,1,1,20);
    let tail = new T.Mesh(tail_geo,skintexture);
    enderDragon_group.add(tail);
    tail.translateZ(-tail_length/2 - body_length/2);
    const orig_tail_geo_attributes = tail_geo.attributes.position.clone();
    const tail_vertex_count = orig_tail_geo_attributes.count;

    // collision box
    let collisionBox_geo = new T.BoxGeometry(4, 3, body_length * 2.5);
    let collisionBox_mat = new T.MeshBasicMaterial({color:"red"});
    let collisionBox = new T.Mesh(collisionBox_geo, collisionBox_mat);
    if ( !SHOW_COLLISION_BOXES ) collisionBox.visible = false;
    collisionBox.geometry.computeBoundingBox();
    torso_group.add(collisionBox);

    // exposte attibues that can be controlled by animate function
    this.time = 0;
    this.body = enderDragon_group;
    this.torso = torso_group;
    this.head = head_group;
    this.lowerjaw = lowerjaw_group;
    this.head_phase = 0;
    this.head_phase_dir = 1;
    this.neck_phase = 1;
    this.legs = leg_group;
    this.feet = feet_group;
    this.rightwing = right_wing_group;
    this.leftwing = left_wing_group;
    this.rightwing_tip = right_smallwingsegment_group;
    this.leftwing_tip = left_smallwingsegment_group;
    this.neck_geo = neck_geo;
    this.orig_neck_geo_attributes = orig_neck_geo_attributes;
    this.neck_vertex_count = neck_vertex_count;
    this.neck_length = neck_length;
    this.neck_scale_array = neck_scale_array;
    this.tail_geo = tail_geo;
    this.orig_tail_geo_attributes = orig_tail_geo_attributes;
    this.tail_vertex_count = tail_vertex_count;
    this.collisionBox_mesh = collisionBox;
    this.collisionBox = new T.Box3().setFromObject( collisionBox );
    this.health = 100;

    // put the object in its place
    this.body.position.x = params.x ? Number(params.x) : 0;
    this.body.position.y = params.y ? Number(params.y) : 0;
    this.body.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    this.body.scale.set(scale, scale, scale);
  }

  /**
   * @param {Number} step
   */
   stepAnimation(step) {
    const max_y_displacemnt = 0.2;
    const max_tail_displacement = 1;
    this.time += step;
    let t = this.time % 1; // where are we in the cycle?

    // bob the body and head
    let head_disp_theta = Math.PI - Math.PI*this.head_phase;
    this.head.position.set(this.head.position.x, max_y_displacemnt*Math.cos(head_disp_theta), this.head.position.z);
    let body_disp_theta = Math.PI/2 - Math.PI*this.head_phase;
    let body_disp = max_y_displacemnt*Math.sin(body_disp_theta)
    this.torso.position.set(this.torso.position.x, body_disp, this.torso.position.z);

    // rotate the jaw
    this.head_phase += this.head_phase_dir*step/1000;
    this.neck_phase += step/1000;

    if (this.head_phase < 0 || this.head_phase > 1) this.head_phase_dir = this.head_phase_dir*-1;;
    if (this.head_phase < 0) this.head_phase = 0;
    if (this.head_phase > 1) { 
      this.head_phase = 1;
      this.neck_phase = 0;
    }
    this.neck_phase = this.neck_phase % 2;

    // rotate the jaw
    let max_rotation = Math.PI/8;
    let theta = max_rotation * this.head_phase
    this.lowerjaw.rotation.set(theta,0,0);

    // animate the legs
    let max_leg_rotation = Math.PI/60;
    let leg_theta = Math.PI - Math.PI*this.head_phase;
    this.legs.rotation.set(max_leg_rotation*Math.cos(leg_theta),0,0);
    let max_foot_rotation = Math.PI/40;
    this.feet.rotation.set(Math.PI/6+max_foot_rotation*Math.cos(leg_theta),0,0);

    // flap the wings
    let max_wing_rotation = Math.PI/4;
    let wing_theta = Math.PI - Math.PI*this.head_phase;
    this.rightwing.rotation.set(0,0,max_wing_rotation*Math.cos(wing_theta));
    this.leftwing.rotation.set(0,0,-max_wing_rotation*Math.cos(wing_theta));

    let max_wingtip_rotation = Math.PI/5;
    let wingtip_theta = Math.PI - Math.PI*this.head_phase;
    this.rightwing_tip.rotation.set(0,0,-max_wingtip_rotation*Math.cos(wingtip_theta)-max_wingtip_rotation);
    this.leftwing_tip.rotation.set(0,0,max_wingtip_rotation*Math.cos(wingtip_theta)+max_wingtip_rotation);

    // animate the neck
    const phase_shift = 0.6;
    const neck_curve_path = new T.CurvePath();
    let p0 = {z: -1, y: -1};
    let p1 = {z: -1, y: -1};
    for ( let i = 0; i < this.neck_vertex_count; i ++ ) {
      const z = this.orig_neck_geo_attributes.getZ(i);
      const y = this.orig_neck_geo_attributes.getY(i);
      const new_y = y - max_y_displacemnt * Math.cos(z + (this.neck_phase * Math.PI) + phase_shift);
      this.neck_geo.attributes.position.setY(i,new_y);
      
      // update the path curve used for the neck scales
      if(p0.z > p1.z || p0.z == -1) {
        p0.z = p1.z;
        p0.y = p1.y;
        p1.z = z;
        p1.y = -1 * max_y_displacemnt * Math.cos(p1.z + (this.neck_phase * Math.PI) + 0.5*Math.PI);
        if (p0.z != -1) neck_curve_path.add(new T.LineCurve(new T.Vector2(p0.z,p0.y),new T.Vector2(p1.z,p1.y)));
      }
    }
    this.neck_geo.computeVertexNormals();
    this.neck_geo.attributes.position.needsUpdate = true;
    
    // animate the neck scales
    for (let i = 0; i < this.neck_scale_array.length; i++) {
      const u = 1-(this.neck_scale_array[i].position.z + this.neck_length/2)/this.neck_length;
      const p = neck_curve_path.getPointAt(u);
      const p_tan = neck_curve_path.getTangentAt(u);
      this.neck_scale_array[i].position.y = p.y + 0.3;
      //this.neck_scale_array[i].position
    }

    // animate the tail
    const tail_phase_shift = 0.6;
    for ( let i = 0; i < this.tail_vertex_count; i ++ ) {

      const z = this.orig_tail_geo_attributes.getZ(i);
      const y = this.orig_tail_geo_attributes.getY(i);
      const y_attenuation = -z/8 + 1/2;
      //const y_attenuation = 0.015625*x**2 - x/8 + 1/4;
      const new_y = y + body_disp + max_tail_displacement * y_attenuation * Math.cos(z + (this.neck_phase * Math.PI) + tail_phase_shift);
      this.tail_geo.attributes.position.setY(i,new_y);
    }
    this.tail_geo.computeVertexNormals();
    this.tail_geo.attributes.position.needsUpdate = true;
  }

}


