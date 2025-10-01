import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Types for break point detection
export interface BreakPoint {
  elementId: string;
  yPosition: number;
  breakType: 'section' | 'card' | 'list-item';
  priority: 'high' | 'medium' | 'low';
  element: HTMLElement;
}

export interface PdfGeneratorConfig {
  format: 'a4';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageBreakStrategy: 'auto' | 'manual';
  scale: number;
}

export interface PageDimensions {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
}

export class PdfGeneratorService {
  private static readonly A4_WIDTH_MM = 210;
  private static readonly A4_HEIGHT_MM = 297;
  private static readonly MM_TO_PX_RATIO = 3.779527559; // 96 DPI conversion
  
  // A4 optimization constants
  private static readonly OPTIMAL_DPI = 300; // For high-quality print
  private static readonly PRINT_SCALE_FACTOR = 2.5; // Optimized for A4 print quality
  
  private config: PdfGeneratorConfig;
  
  constructor(config?: Partial<PdfGeneratorConfig>) {
    this.config = {
      format: 'a4',
      orientation: 'portrait',
      margins: {
        top: 20, // mm - Standard top margin for A4
        right: 15, // mm - Narrower side margins for more content
        bottom: 20, // mm - Standard bottom margin
        left: 15 // mm - Narrower side margins for more content
      },
      pageBreakStrategy: 'auto',
      scale: PdfGeneratorService.PRINT_SCALE_FACTOR,
      ...config
    };
  }

  /**
   * Get optimized A4 configuration for different content types
   */
  public static getA4Config(contentType: 'text-heavy' | 'mixed' | 'image-heavy' = 'mixed'): Partial<PdfGeneratorConfig> {
    const baseConfig = {
      format: 'a4' as const,
      orientation: 'portrait' as const,
    };

    switch (contentType) {
      case 'text-heavy':
        return {
          ...baseConfig,
          margins: { top: 25, right: 20, bottom: 25, left: 20 },
          scale: 2.0 // Lower scale for text readability
        };
      case 'image-heavy':
        return {
          ...baseConfig,
          margins: { top: 15, right: 10, bottom: 15, left: 10 },
          scale: 3.0 // Higher scale for image quality
        };
      default: // mixed
        return {
          ...baseConfig,
          margins: { top: 20, right: 15, bottom: 20, left: 15 },
          scale: PdfGeneratorService.PRINT_SCALE_FACTOR
        };
    }
  }

  /**
   * Calculate optimal break points for intelligent page splitting
   * Analyzes DOM structure to find natural breaking points and avoid orphans
   */
  public calculateOptimalBreaks(element: HTMLElement): BreakPoint[] {
    const breakPoints: BreakPoint[] = [];
    const pageDimensions = this.calculatePageDimensions();
    
    // Find all potential break point elements
    const reportCards = element.querySelectorAll('[class*="ReportCard"], .space-y-8 > div, .grid > div');
    const sections = element.querySelectorAll('h2, h3, h4, .mb-8, .space-y-8 > *');
    
    // Analyze ReportCard components (highest priority for breaks)
    reportCards.forEach((card, index) => {
      const htmlCard = card as HTMLElement;
      const rect = htmlCard.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Calculate relative position within the exportable area
      const relativeY = rect.top - elementRect.top;
      
      breakPoints.push({
        elementId: htmlCard.id || `report-card-${index}`,
        yPosition: relativeY,
        breakType: 'card',
        priority: 'high',
        element: htmlCard
      });
    });
    
    // Analyze section headers and major content blocks
    sections.forEach((section, index) => {
      const htmlSection = section as HTMLElement;
      const rect = htmlSection.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      const relativeY = rect.top - elementRect.top;
      
      // Skip if this element is already covered by a card break point
      const isAlreadyCovered = breakPoints.some(bp => 
        Math.abs(bp.yPosition - relativeY) < 50 // Within 50px tolerance
      );
      
      if (!isAlreadyCovered) {
        breakPoints.push({
          elementId: htmlSection.id || `section-${index}`,
          yPosition: relativeY,
          breakType: 'section',
          priority: 'medium',
          element: htmlSection
        });
      }
    });
    
    // Sort break points by position
    breakPoints.sort((a, b) => a.yPosition - b.yPosition);
    
    // Filter break points to avoid orphans and widows
    return this.filterBreakPointsForOrphans(breakPoints, pageDimensions);
  }

  /**
   * Filter break points to avoid orphans (single lines at bottom of page)
   * and widows (single lines at top of page)
   */
  private filterBreakPointsForOrphans(breakPoints: BreakPoint[], pageDimensions: PageDimensions): BreakPoint[] {
    const filtered: BreakPoint[] = [];
    const minElementHeight = 100; // Minimum height to avoid orphans
    const pageHeight = pageDimensions.contentHeight;
    
    for (let i = 0; i < breakPoints.length; i++) {
      const currentBreak = breakPoints[i];
      const nextBreak = breakPoints[i + 1];
      
      // Calculate element height
      const elementHeight = currentBreak.element.getBoundingClientRect().height;
      
      // Check if this would create an orphan
      const remainingPageSpace = pageHeight - (currentBreak.yPosition % pageHeight);
      
      if (elementHeight > remainingPageSpace && remainingPageSpace < minElementHeight) {
        // This would create an orphan, skip this break point
        continue;
      }
      
      // Check if this would create a widow with the next element
      if (nextBreak) {
        const nextElementHeight = nextBreak.element.getBoundingClientRect().height;
        const spaceAfterBreak = nextBreak.yPosition - currentBreak.yPosition;
        
        if (nextElementHeight > spaceAfterBreak && spaceAfterBreak < minElementHeight) {
          // This would create a widow, prefer the next break point
          continue;
        }
      }
      
      filtered.push(currentBreak);
    }
    
    return filtered;
  }

  /**
   * Calculate page dimensions based on A4 format and margins
   * Optimized for print quality and proper scaling
   */
  private calculatePageDimensions(): PageDimensions {
    const widthPx = PdfGeneratorService.A4_WIDTH_MM * PdfGeneratorService.MM_TO_PX_RATIO;
    const heightPx = PdfGeneratorService.A4_HEIGHT_MM * PdfGeneratorService.MM_TO_PX_RATIO;
    
    const marginTopPx = this.config.margins.top * PdfGeneratorService.MM_TO_PX_RATIO;
    const marginBottomPx = this.config.margins.bottom * PdfGeneratorService.MM_TO_PX_RATIO;
    const marginLeftPx = this.config.margins.left * PdfGeneratorService.MM_TO_PX_RATIO;
    const marginRightPx = this.config.margins.right * PdfGeneratorService.MM_TO_PX_RATIO;
    
    return {
      width: widthPx,
      height: heightPx,
      contentWidth: widthPx - marginLeftPx - marginRightPx,
      contentHeight: heightPx - marginTopPx - marginBottomPx
    };
  }

  /**
   * Calculate optimal canvas dimensions for A4 output
   * Ensures proper scaling and DPI for print quality
   */
  private calculateOptimalCanvasDimensions(element: HTMLElement): { width: number; height: number } {
    const pageDimensions = this.calculatePageDimensions();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate the optimal width based on A4 content width
    const optimalWidth = pageDimensions.contentWidth;
    
    // Calculate height maintaining aspect ratio
    const aspectRatio = elementRect.height / elementRect.width;
    const optimalHeight = optimalWidth * aspectRatio;
    
    return {
      width: Math.round(optimalWidth),
      height: Math.round(optimalHeight)
    };
  }

  /**
   * Generate PDF with intelligent page breaks and A4 optimization
   */
  public async generatePdf(element: HTMLElement, filename: string): Promise<void> {
    try {
      const breakPoints = this.calculateOptimalBreaks(element);
      const pageDimensions = this.calculatePageDimensions();
      const canvasDimensions = this.calculateOptimalCanvasDimensions(element);
      
      // Create canvas with A4-optimized settings
      const canvas = await html2canvas(element, {
        scale: this.config.scale,
        backgroundColor: '#ffffff', // White background for print-friendly output
        useCORS: true,
        allowTaint: true,
        width: canvasDimensions.width,
        height: canvasDimensions.height,
        windowWidth: canvasDimensions.width,
        scrollX: 0,
        scrollY: 0,
        // A4 print optimization settings
        foreignObjectRendering: true, // Better text rendering
        removeContainer: true, // Clean rendering
        imageTimeout: 15000, // Allow time for images to load
        logging: false // Disable console logs for cleaner output
      });
      
      // Initialize jsPDF with precise A4 configuration
      const pdf = new jsPDF({
        orientation: this.config.orientation,
        unit: 'mm',
        format: 'a4',
        compress: true, // Optimize file size
        precision: 2 // Precision for measurements
      });
      
      await this.addPagesToPdf(pdf, canvas, breakPoints, pageDimensions);
      
      // Save the PDF with optimized settings
      pdf.save(filename);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add pages to PDF with intelligent breaks
   */
  private async addPagesToPdf(
    pdf: jsPDF, 
    canvas: HTMLCanvasElement, 
    breakPoints: BreakPoint[], 
    pageDimensions: PageDimensions
  ): Promise<void> {
    const imgData = canvas.toDataURL('image/png');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate scaling to fit A4 width
    const pdfWidth = pageDimensions.width / PdfGeneratorService.MM_TO_PX_RATIO;
    const pdfHeight = pageDimensions.height / PdfGeneratorService.MM_TO_PX_RATIO;
    const contentWidth = pageDimensions.contentWidth / PdfGeneratorService.MM_TO_PX_RATIO;
    const contentHeight = pageDimensions.contentHeight / PdfGeneratorService.MM_TO_PX_RATIO;
    
    const scaleX = contentWidth / (canvasWidth / this.config.scale);
    const scaleY = scaleX; // Maintain aspect ratio
    
    const scaledCanvasHeight = (canvasHeight / this.config.scale) * scaleY;
    
    // If content fits on one page, add it directly
    if (scaledCanvasHeight <= contentHeight) {
      pdf.addImage(
        imgData, 
        'PNG', 
        this.config.margins.left, 
        this.config.margins.top, 
        contentWidth, 
        scaledCanvasHeight
      );
      return;
    }
    
    // Multi-page handling with break points
    let currentY = 0;
    let pageNumber = 1;
    
    for (let i = 0; i <= breakPoints.length; i++) {
      const isLastSection = i === breakPoints.length;
      const nextBreakY = isLastSection ? scaledCanvasHeight : (breakPoints[i].yPosition / this.config.scale) * scaleY;
      
      const sectionHeight = nextBreakY - currentY;
      
      // Add new page if not the first page
      if (pageNumber > 1) {
        pdf.addPage();
      }
      
      // Calculate source coordinates on canvas
      const sourceY = (currentY / scaleY) * this.config.scale;
      const sourceHeight = (sectionHeight / scaleY) * this.config.scale;
      
      // Create a temporary canvas for this section
      const sectionCanvas = document.createElement('canvas');
      const sectionCtx = sectionCanvas.getContext('2d');
      
      if (sectionCtx) {
        sectionCanvas.width = canvasWidth;
        sectionCanvas.height = sourceHeight;
        
        // Draw the section from the main canvas
        sectionCtx.drawImage(
          canvas,
          0, sourceY, canvasWidth, sourceHeight,
          0, 0, canvasWidth, sourceHeight
        );
        
        const sectionImgData = sectionCanvas.toDataURL('image/png');
        
        // Add section to PDF
        pdf.addImage(
          sectionImgData,
          'PNG',
          this.config.margins.left,
          this.config.margins.top,
          contentWidth,
          sectionHeight
        );
      }
      
      currentY = nextBreakY;
      pageNumber++;
    }
  }
}