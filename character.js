// character.js – builds a low‑poly skinned male figure and defines animation clips
import * as THREE from 'three';

export class Character {
  constructor() {
    this.boneStructure = this._createBones();
    this.mesh = this._createSkinnedMesh();
    this.mixer = new THREE.AnimationMixer(this.mesh);
    this.clips = this._createClips();
  }

  _createBones() {
    const root = new THREE.Bone();
    root.name = 'root';

    const hips = new THREE.Bone();
    hips.name = 'hips';
    hips.position.y = 1.0; 
    root.add(hips);

    const spine = new THREE.Bone();
    spine.name = 'spine';
    spine.position.y = 0.2;
    hips.add(spine);

    const chest = new THREE.Bone();
    chest.name = 'chest';
    chest.position.y = 0.25;
    spine.add(chest);

    // Limbs - even closer to center
    const lUpperLeg = new THREE.Bone(); lUpperLeg.name = 'lUpperLeg'; lUpperLeg.position.set(0.12, 0, 0); hips.add(lUpperLeg);
    const lLowerLeg = new THREE.Bone(); lLowerLeg.name = 'lLowerLeg'; lLowerLeg.position.y = -0.5; lUpperLeg.add(lLowerLeg);
    
    const rUpperLeg = new THREE.Bone(); rUpperLeg.name = 'rUpperLeg'; rUpperLeg.position.set(-0.12, 0, 0); hips.add(rUpperLeg);
    const rLowerLeg = new THREE.Bone(); rLowerLeg.name = 'rLowerLeg'; rLowerLeg.position.y = -0.5; rUpperLeg.add(rLowerLeg);

    const lUpperArm = new THREE.Bone(); lUpperArm.name = 'lUpperArm'; lUpperArm.position.set(0.28, 0.05, 0); chest.add(lUpperArm);
    const lLowerArm = new THREE.Bone(); lLowerArm.name = 'lLowerArm'; lLowerArm.position.y = -0.4; lUpperArm.add(lLowerArm);

    const rUpperArm = new THREE.Bone(); rUpperArm.name = 'rUpperArm'; rUpperArm.position.set(-0.28, 0.05, 0); chest.add(rUpperArm);
    const rLowerArm = new THREE.Bone(); rLowerArm.name = 'rLowerArm'; rLowerArm.position.y = -0.4; rUpperArm.add(rLowerArm);

    return root;
  }

  _createSkinnedMesh() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x61dafb, roughness: 0.5, metalness: 0.2 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const bones = this._getAllBones(this.boneStructure);
    const find = (name) => bones.find(b => b.name === name);

    // ---- Pelvis ----
    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bodyMat);
    pelvis.position.set(0, 0, 0);
    find('hips').add(pelvis);

    // ---- Torso ----
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.6, 4, 8), bodyMat);
    torso.position.set(0, 0.25, 0); 
    find('hips').add(torso); // Attach to hips but it will overlap spine

    // ---- Head ----
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat);
    head.position.set(0, 0.25, 0);
    find('chest').add(head);

    // ---- Face ----
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    leftEye.position.set(0.1, 0.1, 0.28);
    head.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    rightEye.position.set(-0.1, 0.1, 0.28);
    head.add(rightEye);
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mouthMat);
    mouth.position.set(0, -0.08, 0.28);
    head.add(mouth);

    // ---- Legs ----
    const lUpperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), bodyMat);
    lUpperLeg.position.set(0, -0.25, 0);
    find('lUpperLeg').add(lUpperLeg);
    const lLowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 4, 8), bodyMat);
    lLowerLeg.position.set(0, -0.25, 0);
    find('lLowerLeg').add(lLowerLeg);

    const rUpperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), bodyMat);
    rUpperLeg.position.set(0, -0.25, 0);
    find('rUpperLeg').add(rUpperLeg);
    const rLowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 4, 8), bodyMat);
    rLowerLeg.position.set(0, -0.25, 0);
    find('rLowerLeg').add(rLowerLeg);

    // ---- Arms ----
    const lUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 4, 8), bodyMat);
    lUpperArm.position.set(0, -0.2, 0);
    find('lUpperArm').add(lUpperArm);
    const lLowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 4, 8), bodyMat);
    lLowerArm.position.set(0, -0.2, 0);
    find('lLowerArm').add(lLowerArm);

    const rUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 4, 8), bodyMat);
    rUpperArm.position.set(0, -0.2, 0);
    find('rUpperArm').add(rUpperArm);
    const rLowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 4, 8), bodyMat);
    rLowerArm.position.set(0, -0.2, 0);
    find('rLowerArm').add(rLowerArm);

    group.add(this.boneStructure);
    return group;
  }

  _getAllBones(root) {
    const list = [];
    root.traverse((b) => { if (b.isBone) list.push(b); });
    return list;
  }

  _createClips() {
    const clips = {};
    
    // Realistic Run Animation using bone names
    // lUpperLeg, rUpperLeg, lUpperArm, rUpperArm
    const duration = 0.6;
    clips.run = new THREE.AnimationClip('run', duration, [
      // Left Leg
      new THREE.NumberKeyframeTrack('lUpperLeg.rotation[x]', [0, duration/2, duration], [0.6, -0.6, 0.6]),
      new THREE.NumberKeyframeTrack('lLowerLeg.rotation[x]', [0, duration/2, duration], [0.4, 0.1, 0.4]),
      
      // Right Leg
      new THREE.NumberKeyframeTrack('rUpperLeg.rotation[x]', [0, duration/2, duration], [-0.6, 0.6, -0.6]),
      new THREE.NumberKeyframeTrack('rLowerLeg.rotation[x]', [0, duration/2, duration], [0.1, 0.4, 0.1]),
      
      // Left Arm (moves opposite to left leg)
      new THREE.NumberKeyframeTrack('lUpperArm.rotation[x]', [0, duration/2, duration], [-0.5, 0.5, -0.5]),
      
      // Right Arm (moves opposite to right leg)
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[x]', [0, duration/2, duration], [0.5, -0.5, 0.5]),

      // Hips bobbing
      new THREE.NumberKeyframeTrack('hips.position[y]', [0, duration/4, duration/2, 3*duration/4, duration], [1.0, 1.05, 1.0, 1.05, 1.0])
    ]);

    // Idle Animation - subtle breathing/swaying
    clips.idle = new THREE.AnimationClip('idle', 2.0, [
      new THREE.NumberKeyframeTrack('chest.rotation[x]', [0, 1.0, 2.0], [0, 0.05, 0]),
      new THREE.NumberKeyframeTrack('lUpperArm.rotation[z]', [0, 1.0, 2.0], [0.1, 0.15, 0.1]),
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[z]', [0, 1.0, 2.0], [-0.1, -0.15, -0.1]),
      new THREE.NumberKeyframeTrack('hips.position[y]', [0, 1.0, 2.0], [1.0, 1.02, 1.0])
    ]);

    // Punch Animation - Balanced power punch
    clips.punch = new THREE.AnimationClip('punch', 1.0, [
      // Right Arm Wind-up (0.0 to 0.4) -> Strike (0.55) -> Recovery (1.0)
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[x]', [0, 0.4, 0.55, 1.0], [0, 1.3, -1.8, 0]),
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[y]', [0, 0.4, 0.55, 1.0], [0, -0.6, 0.3, 0]),
      new THREE.NumberKeyframeTrack('rLowerArm.rotation[x]', [0, 0.4, 0.55, 1.0], [0, -1.6, -0.1, 0]),
      
      // Balanced Torso twist
      new THREE.NumberKeyframeTrack('spine.rotation[y]', [0, 0.4, 0.55, 1.0], [0, -1.0, 0.6, 0]),
      new THREE.NumberKeyframeTrack('chest.rotation[y]', [0, 0.4, 0.55, 1.0], [0, -0.4, 0.4, 0]),
      
      // Moderate hip dip
      new THREE.NumberKeyframeTrack('hips.position[y]', [0, 0.4, 0.55, 1.0], [1.0, 0.85, 1.05, 1.0]),
      
      // Left arm balance
      new THREE.NumberKeyframeTrack('lUpperArm.rotation[x]', [0, 0.4, 0.55, 1.0], [0, -0.8, 0.6, 0])
    ]);

    return clips;
  }
}
