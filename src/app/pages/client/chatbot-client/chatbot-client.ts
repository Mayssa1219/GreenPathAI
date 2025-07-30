import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../../Services/GeminiService';
import { FormsModule } from '@angular/forms';

declare var webkitSpeechRecognition: any;
type SpeechRecognition = any;

@Component({
  selector: 'app-chatbot-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-client.html',
  styleUrls: ['./chatbot-client.css']
})
export class ChatbotClient implements OnInit {
  showChat = false;
  messages: { sender: 'user' | 'bot', text: string }[] = [];
  userInput = '';
  recognition: SpeechRecognition | undefined;

  constructor(private geminiService: GeminiService) {}

  toggleChat() {
    this.showChat = !this.showChat;
  }

  sendMessage() {
    const input = this.userInput.trim();
    if (!input) return;

    this.messages.push({ sender: 'user', text: input });
    this.userInput = '';

    this.geminiService.generateContent(input).subscribe({
      next: (res: any) => {
        const reply = res?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          this.messages.push({ sender: 'bot', text: reply });
          this.speak(reply);
        } else {
          this.messages.push({ sender: 'bot', text: "Aucune réponse générée." });
        }
      },
      error: (err) => {
        console.error("Erreur Gemini :", err);
        this.messages.push({ sender: 'bot', text: "Erreur lors de la génération." });
      }
    });
  }

  speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  }

  stopVoice() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  ngOnInit() {
    this.initVoiceRecognition();
  }

  initVoiceRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Reconnaissance vocale non supportée.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'fr-FR';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Texte reconnu :", transcript);
      this.userInput = transcript;
      this.sendMessage();
    };

    this.recognition.onerror = (event: any) => {
      console.error('Erreur de reconnaissance vocale :', event.error);
    };
  }

  startListening() {
    if (this.recognition) {
      this.recognition.start();
    }
  }
}
