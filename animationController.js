// animationController.js – handles playing and blending animation clips
import * as THREE from 'three';

export class AnimationController {
  constructor(mixer, clips) {
    this.mixer = mixer;
    this.clips = clips;
    this.currentAction = null;
    this.actions = {};

    for (const name in clips) {
      this.actions[name] = this.mixer.clipAction(clips[name]);
      if (name !== 'run') {
        this.actions[name].setLoop(THREE.LoopOnce, 1);
        this.actions[name].clampWhenFinished = true;
      }
    }
  }

  play(name) {
    const next = this.actions[name];
    if (!next) return;
    
    if (this.currentAction) {
      this.currentAction.fadeOut(0.2);
    }
    
    next.reset().fadeIn(0.2).play();
    this.currentAction = next;
  }
}
