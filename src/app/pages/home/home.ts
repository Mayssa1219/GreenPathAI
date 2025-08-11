import {Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TawkService} from '../../Services/TawkService';
import {Avis,Circuit, HomeService} from '../../Services/HomeService';
import {AuthService} from '../../Services/authService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf,FormsModule ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy,OnInit {

  circuits: Circuit[] = [];
  avis: Avis[] = [];
  loadingCircuits = false;
  loadingAvis = false;

  constructor(private authService:AuthService,private homeService: HomeService,private tawk: TawkService) {}

  ngOnInit(): void {
    this.loadRecentCircuits();
    this.loadRecentAvis();
    this.tawk.load();

  }
  onVoirCircuitClick() {
    if (!this.authService.isLoggedIn) {
      alert('Connectez-vous pour voir ce circuit.');
      // ici tu peux aussi router vers /login si tu veux
    } else {
      alert('Accès au circuit autorisé !');
      // navigation vers le détail circuit par exemple
    }
  }
  loadRecentCircuits(): void {
    this.loadingCircuits = true;
    this.homeService.getRecentCircuits().subscribe({
      next: (data) => {
        this.circuits = data;
        this.loadingCircuits = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des circuits', err);
        this.loadingCircuits = false;
      },
    });
  }

  loadRecentAvis(): void {
    this.loadingAvis = true;
    this.homeService.getRecentAvis().subscribe({
      next: (data) => {
        this.avis = data;
        this.loadingAvis = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des avis', err);
        this.loadingAvis = false;
      },
    });
  }

  @ViewChild('carouselTrack', { static: true }) carouselTrack!: ElementRef<HTMLDivElement>;
  currentIndex = 0;
  visibleCount = 3;
  resizeObserver!: ResizeObserver;

  get maxIndex() {
    return Math.max(0, this.circuits.length - this.visibleCount);
  }



  ngAfterViewInit() {
    this.updateVisibleCount();
    this.updateCarousel();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateVisibleCount();
      this.updateCarousel();
    });
    this.resizeObserver.observe(this.carouselTrack.nativeElement);
    window.addEventListener('resize', this.onWindowResize);

    // Fun facts animation
    const funFactNumbers = this.funFactsContainer.nativeElement.querySelectorAll<HTMLElement>('.fun-fact-number');
    this.funFactObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('visible');
          const idx = Array.from(funFactNumbers).indexOf(el);
          if (idx >= 0) this.animateCounter(el, this.funFactTargets[idx]);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    funFactNumbers.forEach(el => this.funFactObserver.observe(el));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.funFactObserver) this.funFactObserver.disconnect();
  }

  onWindowResize = () => {
    this.updateVisibleCount();
    this.updateCarousel();
  };

  updateVisibleCount() {
    const w = window.innerWidth;
    if (w <= 680) this.visibleCount = 1;
    else if (w <= 1020) this.visibleCount = 2;
    else this.visibleCount = 3;
    if (this.currentIndex > this.maxIndex) this.currentIndex = this.maxIndex;
  }

  updateCarousel() {
    const track = this.carouselTrack.nativeElement;
    const cards = track.children;
    if (cards.length === 0) return;
    const gap = parseFloat(getComputedStyle(track).gap || '16') || 16;
    const cardWidth = (cards[0] as HTMLElement).offsetWidth + gap;
    this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.maxIndex));
    track.style.transform = `translateX(-${this.currentIndex * cardWidth}px)`;
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  next() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  // Fun fact values in order: Clients, Circuits, Partenaires, Questions
  funFactTargets: number[] = [0, 0, 0, 0]; // valeurs initiales
  loadFunFacts() {
    this.homeService.getFunFacts().subscribe({
      next: (data) => {
        this.funFactTargets = [
          data.clientsSatisfaits,
          data.circuitsExceptionnels,
          data.partenaires];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fun facts', err);
      }
    });
  }

  @ViewChild('funFactsContainer', { static: true }) funFactsContainer!: ElementRef<HTMLDivElement>;
  private funFactObserver!: IntersectionObserver;

  animateCounter(el: HTMLElement, target: number, duration: number = 1900) {
    let start = 0;
    let startTime: number | null = null;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (target - start) + start);
      el.textContent = value.toLocaleString("fr-FR");
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = target.toLocaleString("fr-FR");
      }
    };
    requestAnimationFrame(updateCounter);
  }

  isChatOpen = false;

  openChat() {
    this.isChatOpen = true;
  }

  closeChat() {
    this.isChatOpen = false;
  }





}
