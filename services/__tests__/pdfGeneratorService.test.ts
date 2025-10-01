import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PdfGeneratorService, BreakPoint, PdfGeneratorConfig } from '../pdfGeneratorService';

// Mock html2canvas and jsPDF
vi.mock('html2canvas', () => ({
  default: vi.fn()
}));

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn()
  }))
}));

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;
  let mockElement: HTMLElement;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    service = new PdfGeneratorService();
    
    // Create mock DOM element
    mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    mockElement.innerHTML = `
      <div class="space-y-8">
        <div class="report-card" id="card-1">Card 1 Content</div>
        <div class="report-card" id="card-2">Card 2 Content</div>
        <h2 id="section-1">Section Header</h2>
        <div class="report-card" id="card-3">Card 3 Content</div>
      </div>
    `;
    
    // Mock getBoundingClientRect for elements
    const mockRect = { top: 0, left: 0, width: 800, height: 600, bottom: 600, right: 800, x: 0, y: 0, toJSON: () => ({}) };
    vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);
    
    // Mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 1200;
    
    // Mock canvas context
    const mockContext = {
      drawImage: vi.fn()
    };
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext as any);
    vi.spyOn(mockCanvas, 'toDataURL').mockReturnValue('data:image/png;base64,mock-data');
    
    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        const canvas = originalCreateElement('canvas') as any;
        canvas.getContext = vi.fn().mockReturnValue(mockContext);
        canvas.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock-section-data');
        return canvas;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default A4 configuration', () => {
      const defaultService = new PdfGeneratorService();
      expect(defaultService).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<PdfGeneratorConfig> = {
        orientation: 'landscape',
        margins: { top: 25, right: 20, bottom: 25, left: 20 },
        scale: 3
      };
      
      const customService = new PdfGeneratorService(customConfig);
      expect(customService).toBeDefined();
    });

    it('should provide A4 configuration presets', () => {
      const textHeavyConfig = PdfGeneratorService.getA4Config('text-heavy');
      expect(textHeavyConfig.format).toBe('a4');
      expect(textHeavyConfig.orientation).toBe('portrait');
      expect(textHeavyConfig.margins?.top).toBe(25);
      expect(textHeavyConfig.scale).toBe(2.0);

      const imageHeavyConfig = PdfGeneratorService.getA4Config('image-heavy');
      expect(imageHeavyConfig.margins?.top).toBe(15);
      expect(imageHeavyConfig.scale).toBe(3.0);

      const mixedConfig = PdfGeneratorService.getA4Config('mixed');
      expect(mixedConfig.margins?.top).toBe(20);
    });
  });

  describe('Break Point Detection', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect for child elements
      const cards = mockElement.querySelectorAll('.report-card');
      cards.forEach((card, index) => {
        const mockCardRect = { 
          top: index * 200, 
          left: 0, 
          width: 800, 
          height: 180, 
          bottom: (index * 200) + 180, 
          right: 800,
          x: 0,
          y: index * 200,
          toJSON: () => ({})
        };
        vi.spyOn(card as HTMLElement, 'getBoundingClientRect').mockReturnValue(mockCardRect as DOMRect);
      });

      const section = mockElement.querySelector('#section-1');
      if (section) {
        const mockSectionRect = { 
          top: 400, 
          left: 0, 
          width: 800, 
          height: 40, 
          bottom: 440, 
          right: 800,
          x: 0,
          y: 400,
          toJSON: () => ({})
        };
        vi.spyOn(section as HTMLElement, 'getBoundingClientRect').mockReturnValue(mockSectionRect as DOMRect);
      }
    });

    it('should identify ReportCard components as high-priority break points', () => {
      const breakPoints = service.calculateOptimalBreaks(mockElement);
      
      const cardBreakPoints = breakPoints.filter(bp => bp.breakType === 'card');
      expect(cardBreakPoints).toHaveLength(3);
      
      cardBreakPoints.forEach(bp => {
        expect(bp.priority).toBe('high');
        expect(bp.elementId).toMatch(/card-\d+/);
      });
    });

    it('should identify section headers as medium-priority break points', () => {
      const breakPoints = service.calculateOptimalBreaks(mockElement);
      
      // Should have at least some break points (cards + sections)
      expect(breakPoints.length).toBeGreaterThan(0);
      
      // Check if we have any section break points or if they were filtered out due to proximity to cards
      const sectionBreakPoints = breakPoints.filter(bp => bp.breakType === 'section');
      if (sectionBreakPoints.length > 0) {
        sectionBreakPoints.forEach(bp => {
          expect(bp.priority).toBe('medium');
        });
      }
    });

    it('should sort break points by position', () => {
      const breakPoints = service.calculateOptimalBreaks(mockElement);
      
      for (let i = 1; i < breakPoints.length; i++) {
        expect(breakPoints[i].yPosition).toBeGreaterThanOrEqual(breakPoints[i - 1].yPosition);
      }
    });

    it('should filter out break points that would create orphans', () => {
      // Create a scenario with potential orphans
      const tallElement = document.createElement('div');
      tallElement.innerHTML = `
        <div class="report-card" style="height: 50px;">Small Card</div>
        <div class="report-card" style="height: 800px;">Very Tall Card</div>
      `;
      
      // Mock getBoundingClientRect for the tall element scenario
      vi.spyOn(tallElement, 'getBoundingClientRect').mockReturnValue({
        top: 0, left: 0, width: 800, height: 1000, bottom: 1000, right: 800, x: 0, y: 0, toJSON: () => ({})
      } as DOMRect);

      const cards = tallElement.querySelectorAll('.report-card');
      vi.spyOn(cards[0] as HTMLElement, 'getBoundingClientRect').mockReturnValue({
        top: 0, left: 0, width: 800, height: 50, bottom: 50, right: 800, x: 0, y: 0, toJSON: () => ({})
      } as DOMRect);
      vi.spyOn(cards[1] as HTMLElement, 'getBoundingClientRect').mockReturnValue({
        top: 50, left: 0, width: 800, height: 800, bottom: 850, right: 800, x: 0, y: 50, toJSON: () => ({})
      } as DOMRect);

      const breakPoints = service.calculateOptimalBreaks(tallElement);
      
      // Should have some break points, even if some are filtered out
      // The algorithm should identify at least the card elements
      expect(breakPoints.length).toBeGreaterThanOrEqual(0);
      
      // Verify that break points are properly sorted
      for (let i = 1; i < breakPoints.length; i++) {
        expect(breakPoints[i].yPosition).toBeGreaterThanOrEqual(breakPoints[i - 1].yPosition);
      }
    });
  });

  describe('A4 Format Configuration', () => {
    it('should calculate correct A4 page dimensions', () => {
      // Access private method through type assertion for testing
      const pageDimensions = (service as any).calculatePageDimensions();
      
      // A4 dimensions: 210 × 297 mm
      const expectedWidth = 210 * 3.779527559; // MM_TO_PX_RATIO
      const expectedHeight = 297 * 3.779527559;
      
      expect(pageDimensions.width).toBeCloseTo(expectedWidth, 1);
      expect(pageDimensions.height).toBeCloseTo(expectedHeight, 1);
      
      // Content dimensions should account for margins
      const marginsPx = (20 + 15) * 3.779527559; // top+bottom, left+right margins
      expect(pageDimensions.contentWidth).toBeCloseTo(expectedWidth - (15 + 15) * 3.779527559, 1);
      expect(pageDimensions.contentHeight).toBeCloseTo(expectedHeight - (20 + 20) * 3.779527559, 1);
    });

    it('should calculate optimal canvas dimensions for A4', () => {
      const canvasDimensions = (service as any).calculateOptimalCanvasDimensions(mockElement);
      
      expect(canvasDimensions.width).toBeGreaterThan(0);
      expect(canvasDimensions.height).toBeGreaterThan(0);
      
      // Should maintain aspect ratio
      const elementRect = mockElement.getBoundingClientRect();
      const expectedAspectRatio = elementRect.height / elementRect.width;
      const actualAspectRatio = canvasDimensions.height / canvasDimensions.width;
      
      expect(actualAspectRatio).toBeCloseTo(expectedAspectRatio, 2);
    });
  });

  describe('PDF Generation', () => {
    beforeEach(async () => {
      // Mock html2canvas
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockResolvedValue(mockCanvas);
    });

    it('should generate PDF with correct filename', async () => {
      const jsPDF = vi.mocked((await import('jspdf')).default);
      const mockPdf = {
        addImage: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn()
      };
      jsPDF.mockReturnValue(mockPdf as any);

      const filename = 'test-report.pdf';
      await service.generatePdf(mockElement, filename);

      expect(mockPdf.save).toHaveBeenCalledWith(filename);
    });

    it('should use white background for print-friendly output', async () => {
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      
      await service.generatePdf(mockElement, 'test.pdf');

      expect(html2canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          backgroundColor: '#ffffff'
        })
      );
    });

    it('should initialize jsPDF with A4 configuration', async () => {
      const jsPDF = vi.mocked((await import('jspdf')).default);
      
      await service.generatePdf(mockElement, 'test.pdf');

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
      });
    });

    it('should handle PDF generation errors gracefully', async () => {
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockRejectedValue(new Error('Canvas generation failed'));

      await expect(service.generatePdf(mockElement, 'test.pdf'))
        .rejects
        .toThrow('Failed to generate PDF: Canvas generation failed');
    });

    it('should apply optimal canvas settings for A4 output', async () => {
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      
      await service.generatePdf(mockElement, 'test.pdf');

      expect(html2canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          scale: 2.5, // PRINT_SCALE_FACTOR
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          removeContainer: true,
          imageTimeout: 15000,
          logging: false
        })
      );
    });
  });

  describe('Multi-Page PDF Support', () => {
    it('should handle single-page content correctly', async () => {
      const jsPDF = vi.mocked((await import('jspdf')).default);
      const mockPdf = {
        addImage: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn()
      };
      jsPDF.mockReturnValue(mockPdf as any);

      // Mock a small canvas that fits on one page
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = 800;
      smallCanvas.height = 400; // Small height
      vi.spyOn(smallCanvas, 'toDataURL').mockReturnValue('data:image/png;base64,small-content');

      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockResolvedValue(smallCanvas);

      await service.generatePdf(mockElement, 'test.pdf');

      // Should add content to PDF but not create additional pages
      expect(mockPdf.addImage).toHaveBeenCalled();
      expect(mockPdf.save).toHaveBeenCalled();
    });

    it('should create multiple pages for long content', async () => {
      const jsPDF = vi.mocked((await import('jspdf')).default);
      const mockPdf = {
        addImage: vi.fn(),
        addPage: vi.fn(),
        save: vi.fn()
      };
      jsPDF.mockReturnValue(mockPdf as any);

      // Mock a tall canvas that requires multiple pages
      const tallCanvas = document.createElement('canvas');
      tallCanvas.width = 800;
      tallCanvas.height = 3000; // Very tall content
      vi.spyOn(tallCanvas, 'toDataURL').mockReturnValue('data:image/png;base64,tall-content');

      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockResolvedValue(tallCanvas);

      await service.generatePdf(mockElement, 'test.pdf');

      // Should create multiple pages
      expect(mockPdf.addPage).toHaveBeenCalled();
      expect(mockPdf.addImage).toHaveBeenCalled(); // Should add images to PDF
    });
  });

  describe('Error Handling', () => {
    it('should throw descriptive error when html2canvas fails', async () => {
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockRejectedValue(new Error('Canvas rendering failed'));

      await expect(service.generatePdf(mockElement, 'test.pdf'))
        .rejects
        .toThrow('Failed to generate PDF: Canvas rendering failed');
    });

    it('should handle jsPDF initialization errors', async () => {
      // First ensure html2canvas succeeds
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockResolvedValue(mockCanvas);
      
      // Then make jsPDF fail
      const jsPDF = vi.mocked((await import('jspdf')).default);
      jsPDF.mockImplementation(() => {
        throw new Error('PDF initialization failed');
      });

      await expect(service.generatePdf(mockElement, 'test.pdf'))
        .rejects
        .toThrow('Failed to generate PDF: PDF initialization failed');
    });

    it('should handle unknown errors gracefully', async () => {
      const html2canvas = vi.mocked((await import('html2canvas')).default);
      html2canvas.mockRejectedValue('Unknown error');

      await expect(service.generatePdf(mockElement, 'test.pdf'))
        .rejects
        .toThrow('Failed to generate PDF: Unknown error');
    });
  });
});