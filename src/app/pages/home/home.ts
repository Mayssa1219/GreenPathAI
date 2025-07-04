import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {FormsModule} from '@angular/forms';
 // Crée ce service comme montré précédemment

interface Circuit {
  image: string;
  alt: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf,FormsModule ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  circuits: Circuit[] = [
    {
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      alt: 'Forêt et lac',
      title: 'Évasion Nature & Forêts',
      description: 'Parcours immersif au cœur des forêts et lacs, rencontres locales, hébergements éco-certifiés.'
    },
    {
      image: 'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=600&q=80',
      alt: 'Village local',
      title: 'Villages & Traditions',
      description: 'Immersion artisanale, gastronomie locale, accueil chez l’habitant et balades à vélo.'
    },
    {
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
      alt: 'Découverte bord de mer',
      title: 'Éco-découverte littorale',
      description: 'Exploration côtière, activités nautiques douces, nuits en éco-lodge face à la mer.'
    },
    {
      image: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=600&q=80',
      alt: 'Cascade turquoise',
      title: 'Randonnée & Cascade',
      description: 'Itinéraire sportif, cascades secrètes, bivouac écologique sous les étoiles.'
    },
    {
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
      alt: 'Montagnes et lacs',
      title: 'Montagnes & Terroirs',
      description: 'Découverte des sommets, rencontres de producteurs locaux, gastronomie bio.'
    }
  ];

  originalCircuits: Circuit[] = JSON.parse(JSON.stringify(this.circuits)); // Pour reset sur changement de langue

  selectedLang = 'fr';
  supportedLangs = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' }
  ];

  @ViewChild('carouselTrack', { static: true }) carouselTrack!: ElementRef<HTMLDivElement>;
  currentIndex = 0;
  visibleCount = 3;
  resizeObserver!: ResizeObserver;

  get maxIndex() {
    return Math.max(0, this.circuits.length - this.visibleCount);
  }

  constructor() {}

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
  funFactTargets = [623744, 112, 594, 8711];

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
