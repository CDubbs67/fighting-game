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
      if (name !== 'run' && name !== 'idle') {
        this.actions[name].setLoop(THREE.LoopOnce, 1);
        this.actions[name].clampWhenFinished = false; // Don't clamp, we want to transition back
      }
    }

    // Auto-return to idle when a one-shot animation finishes
    this.mixer.addEventListener('finished', (e) => {
      this.play('idle');
    });
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
