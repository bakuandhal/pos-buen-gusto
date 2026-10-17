/* ============================================================================
   POS Buen Gusto — Configuración de animaciones GSAP
   Duraciones, curvas y utilidades centralizadas.
   ============================================================================ */

import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

// Registrar plugins de GSAP
gsap.registerPlugin(Flip);

// ── Duraciones (segundos) ──
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.35,
  slow: 0.5,
} as const;

// ── Curvas de easing ──
export const ANIMATION_EASE = {
  standard: 'power2.inOut',
  spring: 'back.out(1.7)',
  flip: 'power2.inOut',
  modalIn: 'power2.out',
  modalOut: 'power2.in',
} as const;

// ── Z-index centralizados ──
export const Z_INDEX = {
  dropdown: 100,
  sticky: 200,
  modalBackdrop: 300,
  modal: 400,
  popover: 500,
} as const;

// ── Utilidad: crear contexto GSAP limpio ──
export function createGsapContext() {
  return gsap.context(() => {
    // El contexto se limpia automáticamente al revertir
  });
}

// ── Utilidad: animación de entrada de modal ──
export function animateModalIn(element: HTMLElement) {
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASE.modalIn,
      clearProps: 'all',
    }
  );
}

// ── Utilidad: animación de salida de modal ──
export function animateModalOut(element: HTMLElement) {
  return gsap.to(element, {
    opacity: 0,
    y: 20,
    scale: 0.98,
    duration: ANIMATION_DURATION.fast,
    ease: ANIMATION_EASE.modalOut,
  });
}

// ── Utilidad: animación de lista (stagger) ──
export function animateListIn(elements: HTMLElement[]) {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 12 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_DURATION.fast,
      stagger: 0.06,
      ease: ANIMATION_EASE.standard,
      clearProps: 'all',
    }
  );
}
