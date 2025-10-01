import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PrintStyleProvider, usePrintStyle } from '../PrintStyleProvider';

// Test component to access the context
const TestComponent = () => {
  const { isPrintMode, enablePrintMode, disablePrintMode, togglePrintMode } = usePrintStyle();
  
  return (
    <div>
      <div data-testid="print-mode-status">{isPrintMode ? 'enabled' : 'disabled'}</div>
      <button data-testid="enable-print" onClick={enablePrintMode}>
        Enable Print Mode
      </button>
      <button data-testid="disable-print" onClick={disablePrintMode}>
        Disable Print Mode
      </button>
      <button data-testid="toggle-print" onClick={togglePrintMode}>
        Toggle Print Mode
      </button>
    </div>
  );
};

describe('PrintStyleProvider', () => {
  beforeEach(() => {
    // Clean up document body classes before each test
    document.body.className = '';
  });

  afterEach(() => {
    // Clean up document body classes after each test
    document.body.className = '';
  });

  describe('Context Provider', () => {
    it('should provide print style context to children', () => {
      render(
        <PrintStyleProvider>
          <TestComponent />
        </PrintStyleProvider>
      );

      expect(screen.getByTestId('print-mode-status')).toHaveTextContent('disabled');
    });

    it('should throw error when usePrintStyle is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        render(<TestComponent />);
      }).toThrow('usePrintStyle must be used within a PrintStyleProvider');

      console.error = originalError;
    });

    it('should initialize with provided isPrintMode prop', () => {
      render(
        <PrintStyleProvider isPrintMode={true}>
          <TestComponent />
        </PrintStyleProvider>
      );

      expect(screen.getByTestId('print-mode-status')).toHaveTextContent('enabled');
    });
  });

  describe('Print Mode State Management', () => {
    it('should enable print mode when enablePrintMode is called', async () => {
      render(
        <PrintStyleProvider>
          <TestComponent />
        </PrintStyleProvider>
      );

      const enableButton = screen.getByTestId('enable-print');
      const status = screen.getByTestId('print-mode-status');

      expect(status).toHaveTextContent('disabled');

      await act(async () => {
        enableButton.click();
      });

      expect(status).toHaveTextContent('enabled');
    });

    it('should disable print mode when disablePrintMode is called', async () => {
      render(
        <PrintStyleProvider isPrintMode={true}>
          <TestComponent />
        </PrintStyleProvider>
      );

      const disableButton = screen.getByTestId('disable-print');
      const status = screen.getByTestId('print-mode-status');

      expect(status).toHaveTextContent('enabled');

      await act(async () => {
        disableButton.click();
      });

      expect(status).toHaveTextContent('disabled');
    });

    it('should toggle print mode when togglePrintMode is called', async () => {
      render(
        <PrintStyleProvider>
          <TestComponent />
        </PrintStyleProvider>
      );

      const toggleButton = screen.getByTestId('toggle-print');
      const status = screen.getByTestId('print-mode-status');

      expect(status).toHaveTextContent('disabled');

      await act(async () => {
        toggleButton.click();
      });

      expect(status).toHaveTextContent('enabled');

      await act(async () => {
        toggleButton.click();
      });

      expect(status).toHaveTextContent('disabled');
    });
  });

  describe('CSS Classes Application', () => {
    it('should apply print mode CSS classes to document body when print mode is enabled', async () => {
      render(
        <PrintStyleProvider>
          <TestComponent />
        </PrintStyleProvider>
      );

      const enableButton = screen.getByTestId('enable-print');

      // Initially no print classes should be applied
      expect(document.body.classList.contains('print-mode')).toBe(false);
      expect(document.body.classList.contains('print-white-bg')).toBe(false);
      expect(document.body.classList.contains('print-dark-text')).toBe(false);

      await act(async () => {
        enableButton.click();
      });

      // After enabling print mode, classes should be applied
      expect(document.body.classList.contains('print-mode')).toBe(true);
      expect(document.body.classList.contains('print-white-bg')).toBe(true);
      expect(document.body.classList.contains('print-dark-text')).toBe(true);
    });

    it('should remove print mode CSS classes from document body when print mode is disabled', async () => {
      render(
        <PrintStyleProvider isPrintMode={true}>
          <TestComponent />
        </PrintStyleProvider>
      );

      const disableButton = screen.getByTestId('disable-print');

      // Initially print classes should be applied
      expect(document.body.classList.contains('print-mode')).toBe(true);
      expect(document.body.classList.contains('print-white-bg')).toBe(true);
      expect(document.body.classList.contains('print-dark-text')).toBe(true);

      await act(async () => {
        disableButton.click();
      });

      // After disabling print mode, classes should be removed
      expect(document.body.classList.contains('print-mode')).toBe(false);
      expect(document.body.classList.contains('print-white-bg')).toBe(false);
      expect(document.body.classList.contains('print-dark-text')).toBe(false);
    });

    it('should apply print mode CSS classes to wrapper div when print mode is enabled', () => {
      const { container } = render(
        <PrintStyleProvider isPrintMode={true}>
          <div data-testid="child">Test content</div>
        </PrintStyleProvider>
      );

      const wrapperDiv = container.firstChild as HTMLElement;
      expect(wrapperDiv.classList.contains('print-mode')).toBe(true);
      expect(wrapperDiv.classList.contains('print-white-bg')).toBe(true);
      expect(wrapperDiv.classList.contains('print-dark-text')).toBe(true);
    });

    it('should not apply print mode CSS classes to wrapper div when print mode is disabled', () => {
      const { container } = render(
        <PrintStyleProvider isPrintMode={false}>
          <div data-testid="child">Test content</div>
        </PrintStyleProvider>
      );

      const wrapperDiv = container.firstChild as HTMLElement;
      expect(wrapperDiv.className).toBe('');
    });
  });

  describe('Cleanup', () => {
    it('should remove CSS classes from document body when component unmounts', () => {
      const { unmount } = render(
        <PrintStyleProvider isPrintMode={true}>
          <TestComponent />
        </PrintStyleProvider>
      );

      // Initially print classes should be applied
      expect(document.body.classList.contains('print-mode')).toBe(true);
      expect(document.body.classList.contains('print-white-bg')).toBe(true);
      expect(document.body.classList.contains('print-dark-text')).toBe(true);

      unmount();

      // After unmounting, classes should be removed
      expect(document.body.classList.contains('print-mode')).toBe(false);
      expect(document.body.classList.contains('print-white-bg')).toBe(false);
      expect(document.body.classList.contains('print-dark-text')).toBe(false);
    });
  });
});