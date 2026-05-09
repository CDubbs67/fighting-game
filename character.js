// character.js – builds a low‑poly skinned male figure and defines animation clips
import * as THREE from 'three';

export class Character {
  constructor() {
    this.boneStructure = this._createBones();
    this.bodyMeshes = [];

    // Default Material
    this.defaultMat = new THREE.MeshStandardMaterial({ color: 0x61dafb, roughness: 0.5, metalness: 0.2 });

    // Matrix Material (Shader)
    this.matrixMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
        void main() {
          vec2 st = vUv * vec2(10.0, 15.0);
          float speed = 2.0 + random(vec2(floor(st.x), 0.0)) * 3.0;
          st.y += time * speed;
          vec2 ipos = floor(st);
          vec2 fpos = fract(st);
          float charType = random(ipos);
          float mask = 0.0;
          if (charType > 0.5) {
            mask = step(0.45, fpos.x) * step(fpos.x, 0.55) * step(0.2, fpos.y) * step(fpos.y, 0.8);
          } else {
            float outer = step(0.3, fpos.x) * step(fpos.x, 0.7) * step(0.2, fpos.y) * step(fpos.y, 0.8);
            float inner = step(0.4, fpos.x) * step(fpos.x, 0.6) * step(0.35, fpos.y) * step(fpos.y, 0.65);
            mask = outer - inner;
          }
          float glow = fract(st.y) * 0.5 + 0.5;
          vec3 color = vec3(0.0, 1.0, 0.0) * mask * glow;
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.mesh = this._createSkinnedMesh();
    this.mixer = new THREE.AnimationMixer(this.mesh);
    this.clips = this._createClips();

    // Weapon system
    this.currentWeaponId = null;
    this.weaponMesh = null;

    // Set Default skin at start
    this.setSkin('default');
  }

  setWeapon(id) {
    // Remove old weapon
    if (this.weaponMesh) {
      this.weaponMesh.parent.remove(this.weaponMesh);
      this.weaponMesh = null;
    }

    if (!id || id === 'none') {
      this.currentWeaponId = null;
      return;
    }

    const bones = this._getAllBones(this.boneStructure);
    const rHand = bones.find(b => b.name === 'rLowerArm'); // Attach to lower arm/hand area

    if (id === 'sword') {
      const swordGroup = new THREE.Group();
      
      // Huge Round Blade (Cylinder)
      const blade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16),
        this.matrixMat
      );
      blade.position.y = 0.75;
      swordGroup.add(blade);
      
      // Rounded Guard (Sphere)
      const guard = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        this.matrixMat
      );
      guard.position.y = 0.1;
      swordGroup.add(guard);
      
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      handle.position.y = -0.1;
      swordGroup.add(handle);
      
      swordGroup.rotation.x = Math.PI / 2;
      swordGroup.position.set(0, -0.4, 0);
      rHand.add(swordGroup);
      this.weaponMesh = swordGroup;
    } 
    else if (id === 'glove') {
      // Rounded Glove (Capsule)
      const glove = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.25, 4, 8),
        this.matrixMat
      );
      glove.position.set(0, -0.4, 0);
      rHand.add(glove);
      this.weaponMesh = glove;
    }

    this.currentWeaponId = id;
  }

  setSkin(type) {
    const mat = type === 'matrix' ? this.matrixMat : this.defaultMat;
    this.bodyMeshes.forEach(mesh => { mesh.material = mat; });
  }

  update(delta) {
    this.mixer.update(delta);
    if (this.matrixMat.uniforms.time) {
      this.matrixMat.uniforms.time.value += delta;
    }
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

    const addBodyPart = (mesh) => {
      this.bodyMeshes.push(mesh);
      return mesh;
    };

    // ---- Pelvis ----
    const pelvis = addBodyPart(new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bodyMat));
    pelvis.position.set(0, 0, 0);
    find('hips').add(pelvis);

    // ---- Torso ----
    const torso = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.6, 4, 8), bodyMat));
    torso.position.set(0, 0.25, 0);
    find('hips').add(torso);

    // ---- Head ----
    const head = addBodyPart(new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), bodyMat));
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
    const lUpperLeg = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), bodyMat));
    lUpperLeg.position.set(0, -0.25, 0);
    find('lUpperLeg').add(lUpperLeg);
    const lLowerLeg = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 4, 8), bodyMat));
    lLowerLeg.position.set(0, -0.25, 0);
    find('lLowerLeg').add(lLowerLeg);

    const rUpperLeg = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), bodyMat));
    rUpperLeg.position.set(0, -0.25, 0);
    find('rUpperLeg').add(rUpperLeg);
    const rLowerLeg = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 4, 8), bodyMat));
    rLowerLeg.position.set(0, -0.25, 0);
    find('rLowerLeg').add(rLowerLeg);

    // ---- Arms ----
    const lUpperArm = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 4, 8), bodyMat));
    lUpperArm.position.set(0, -0.2, 0);
    find('lUpperArm').add(lUpperArm);
    const lLowerArm = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 4, 8), bodyMat));
    lLowerArm.position.set(0, -0.2, 0);
    find('lLowerArm').add(lLowerArm);

    const rUpperArm = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 4, 8), bodyMat));
    rUpperArm.position.set(0, -0.2, 0);
    find('rUpperArm').add(rUpperArm);
    const rLowerArm = addBodyPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 4, 8), bodyMat));
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
      new THREE.NumberKeyframeTrack('lUpperLeg.rotation[x]', [0, duration / 2, duration], [0.6, -0.6, 0.6]),
      new THREE.NumberKeyframeTrack('lLowerLeg.rotation[x]', [0, duration / 2, duration], [0.4, 0.1, 0.4]),

      // Right Leg
      new THREE.NumberKeyframeTrack('rUpperLeg.rotation[x]', [0, duration / 2, duration], [-0.6, 0.6, -0.6]),
      new THREE.NumberKeyframeTrack('rLowerLeg.rotation[x]', [0, duration / 2, duration], [0.1, 0.4, 0.1]),

      // Left Arm (moves opposite to left leg)
      new THREE.NumberKeyframeTrack('lUpperArm.rotation[x]', [0, duration / 2, duration], [-0.5, 0.5, -0.5]),

      // Right Arm (moves opposite to right leg)
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[x]', [0, duration / 2, duration], [0.5, -0.5, 0.5]),

      // Hips bobbing
      new THREE.NumberKeyframeTrack('hips.position[y]', [0, duration / 4, duration / 2, 3 * duration / 4, duration], [1.0, 1.05, 1.0, 1.05, 1.0])
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

    // Sword Swing Animation - Wide horizontal arc with wind-up
    clips.swing = new THREE.AnimationClip('swing', 1.2, [
      // Right Arm - Wind back & lift (0.4) -> Horizontal slash (0.7) -> Return (1.2)
      // rotation[z] is the 'out 45 degrees' movement
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[z]', [0, 0.4, 0.7, 1.2], [0, 0.78, -0.2, 0]),
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[y]', [0, 0.4, 0.7, 1.2], [0, -1.2, 1.5, 0]),
      new THREE.NumberKeyframeTrack('rUpperArm.rotation[x]', [0, 0.4, 0.7, 1.2], [0, 0.5, -0.6, 0]),

      // Torso rotation for power
      new THREE.NumberKeyframeTrack('spine.rotation[y]', [0, 0.4, 0.7, 1.2], [0, -0.8, 1.2, 0]),
      new THREE.NumberKeyframeTrack('chest.rotation[y]', [0, 0.4, 0.7, 1.2], [0, -0.4, 0.8, 0]),

      // Hip dip
      new THREE.NumberKeyframeTrack('hips.position[y]', [0, 0.4, 0.7, 1.2], [1.0, 0.85, 1.0, 1.0])
    ]);

    return clips;
  }
}
