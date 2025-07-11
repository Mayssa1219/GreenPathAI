import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private synth = window.speechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;

  private _isSpeaking = new BehaviorSubject<boolean>(false);
  public isSpeaking$ = this._isSpeaking.asObservable();

  constructor() {}

  speak(text: string): void {
    if (!('speechSynthesis' in window)) {
      console.warn('Synthèse vocale non supportée.');
      return;
    }

    // Ne pas relancer si déjà en train de parler
    if (this._isSpeaking.getValue()) {
      console.log('Lecture déjà en cours, ne relance pas');
      return;
    }

    this.cancel();

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = 'fr-FR';

    this.utterance.onstart = () => this._isSpeaking.next(true);
    this.utterance.onend = () => this._isSpeaking.next(false);
    this.utterance.onerror = () => this._isSpeaking.next(false);

    this.synth.speak(this.utterance);
  }

  cancel(): void {
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
      this._isSpeaking.next(false);
    }
  }
}
