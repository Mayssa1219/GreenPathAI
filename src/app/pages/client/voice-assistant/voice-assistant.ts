import {Component, Input, OnInit} from '@angular/core';
import { Circuit } from '../../../models/Circuit';

@Component({
  selector: 'app-voice-assistant',
  standalone: true,
  templateUrl: './voice-assistant.html',
  styleUrl: './voice-assistant.css',
})
export class VoiceAssistantComponent implements OnInit{
  @Input() circuit!: Circuit;

  private synth = window.speechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  isPlaying = false;
  currentStepIndex = 0;
  steps: string[] = [];

  ngOnInit(): void {
    if (this.circuit.etapes) {
      this.steps = this.circuit.etapes.split('\n').map(s => s.trim()).filter(s => s);
    } else {
      this.steps = ['Aucune étape définie pour ce circuit.'];
    }
  }

  playStep(): void {
    if (!this.steps.length) return;
    this.stop();
    const text = this.steps[this.currentStepIndex];
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.onend = () => this.isPlaying = false;
    this.synth.speak(this.utterance);
    this.isPlaying = true;
  }

  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.playStep();
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.playStep();
    }
  }

  pause(): void {
    this.synth.pause();
    this.isPlaying = false;
  }

  resume(): void {
    this.synth.resume();
    this.isPlaying = true;
  }

  stop(): void {
    this.synth.cancel();
    this.isPlaying = false;
  }
}
