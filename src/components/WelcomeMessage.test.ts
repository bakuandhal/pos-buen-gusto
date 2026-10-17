import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WelcomeMessage from './WelcomeMessage.vue';

describe('WelcomeMessage', () => {
  it('renderiza el texto por defecto', () => {
    const wrapper = mount(WelcomeMessage);
    expect(wrapper.find('[data-testid="welcome-message"]').text()).toBe(
      'Bienvenido al POS Buen Gusto'
    );
  });

  it('renderiza la etiqueta personalizada cuando se proporciona', () => {
    const wrapper = mount(WelcomeMessage, {
      props: { label: 'Mesas' },
    });
    expect(wrapper.find('[data-testid="welcome-message"]').text()).toBe('Mesas');
  });
});
