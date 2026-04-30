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
    hips.position.y = 2; // Start body at height 2
    root.add(hips);

    const spine = new THREE.Bone();
    spine.name = 'spine';
    spine.position.y = 0.5;
    hips.add(spine);

    const chest = new THREE.Bone();
    chest.name = 'chest';
    chest.position.y = 0.5;
    spine.add(chest);

    // Limbs
    const lUpperLeg = new THREE.Bone(); lUpperLeg.name = 'lUpperLeg'; lUpperLeg.position.set(0.3, 0, 0); hips.add(lUpperLeg);
    const lLowerLeg = new THREE.Bone(); lLowerLeg.name = 'lLowerLeg'; lLowerLeg.position.y = -1; lUpperLeg.add(lLowerLeg);
    
    const rUpperLeg = new THREE.Bone(); rUpperLeg.name = 'rUpperLeg'; rUpperLeg.position.set(-0.3, 0, 0); hips.add(rUpperLeg);
    const rLowerLeg = new THREE.Bone(); rLowerLeg.name = 'rLowerLeg'; rLowerLeg.position.y = -1; rUpperLeg.add(rLowerLeg);

    const lUpperArm = new THREE.Bone(); lUpperArm.name = 'lUpperArm'; lUpperArm.position.set(0.6, 0.4, 0); chest.add(lUpperArm);
    const lLowerArm = new THREE.Bone(); lLowerArm.name = 'lLowerArm'; lLowerArm.position.y = -0.6; lUpperArm.add(lLowerArm);

    const rUpperArm = new THREE.Bone(); rUpperArm.name = 'rUpperArm'; rUpperArm.position.set(-0.6, 0.4, 0); chest.add(rUpperArm);
    const rLowerArm = new THREE.Bone(); rLowerArm.name = 'rLowerArm'; rLowerArm.position.y = -0.6; rUpperArm.add(rLowerArm);

    return root;
  }

  _createSkinnedMesh() {
    const group = new THREE.Group();
    // Use a teal material for the whole character
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x61dafb, roughness: 0.5, metalness: 0.2 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const bones = this._getAllBones(this.boneStructure);
    const find = (name) => bones.find(b => b.name === name);

    // ---- Pelvis (simple sphere) ----
    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bodyMat);
    pelvis.position.set(0, 0, 0);
    find('hips').add(pelvis);

    // ---- Torso (capsule) ----
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.2, 4, 8), bodyMat);
    torso.position.set(0, 0.9, 0); // raise above pelvis
    find('chest').add(torso);

    // ---- Head (sphere) ----
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat);
    head.position.set(0, 1.4, 0);
    find('chest').add(head);

    // ---- Face: eyes and mouth ----
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat);
    leftEye.position.set(0.12, 0.1, 0.33);
    head.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat);
    rightEye.position.set(-0.12, 0.1, 0.33);
    head.add(rightEye);
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mouthMat);
    mouth.position.set(0, -0.12, 0.33);
    head.add(mouth);

    // ---- Legs (capsules) ----
    const lUpperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.0, 4, 8), bodyMat);
    lUpperLeg.position.set(0.3, -0.5, 0);
    find('lUpperLeg').add(lUpperLeg);
    const lLowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.9, 4, 8), bodyMat);
    lLowerLeg.position.set(0, -0.9, 0);
    find('lLowerLeg').add(lLowerLeg);

    const rUpperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.0, 4, 8), bodyMat);
    rUpperLeg.position.set(-0.3, -0.5, 0);
    find('rUpperLeg').add(rUpperLeg);
    const rLowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.9, 4, 8), bodyMat);
    rLowerLeg.position.set(0, -0.9, 0);
    find('rLowerLeg').add(rLowerLeg);

    // ---- Arms (capsules) ----
    const lUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.8, 4, 8), bodyMat);
    lUpperArm.position.set(0.6, -0.3, 0);
    find('lUpperArm').add(lUpperArm);
    const lLowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.7, 4, 8), bodyMat);
    lLowerArm.position.set(0, -0.7, 0);
    find('lLowerArm').add(lLowerArm);

    const rUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.8, 4, 8), bodyMat);
    rUpperArm.position.set(-0.6, -0.3, 0);
    find('rUpperArm').add(rUpperArm);
    const rLowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.7, 4, 8), bodyMat);
    rLowerArm.position.set(0, -0.7, 0);
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
    
    // Simplified keyframe tracks for demo
    clips.run = new THREE.AnimationClip('run', 0.6, [
      new THREE.NumberKeyframeTrack('.children[0].children[3].rotation[x]', [0, 0.3, 0.6], [0.8, -0.8, 0.8]),
      new THREE.NumberKeyframeTrack('.children[0].children[5].rotation[x]', [0, 0.3, 0.6], [-0.8, 0.8, -0.8])
    ]);

    clips.jump = new THREE.AnimationClip('jump', 0.8, [
      new THREE.NumberKeyframeTrack('.children[0].position[y]', [0, 0.4, 0.8], [2, 5, 2]),
      new THREE.NumberKeyframeTrack('.children[0].rotation[x]', [0, 0.4, 0.8], [0, -0.5, 0])
    ]);

    clips.kick = new THREE.AnimationClip('kick', 0.5, [
      new THREE.NumberKeyframeTrack('.children[0].children[3].rotation[x]', [0, 0.2, 0.5], [0, -1.5, 0])
    ]);

    clips.punch = new THREE.AnimationClip('punch', 0.4, [
      new THREE.NumberKeyframeTrack('.children[0].children[1].children[0].children[2].rotation[x]', [0, 0.2, 0.4], [0, -1.5, 0])
    ]);

    return clips;
  }
}
