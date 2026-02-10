declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number] | [number, number, number, number];
        filename?: string;
        image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
        html2canvas?: { scale: number; useCORS: boolean };
        jsPDF?: { unit: string; format: string; orientation: 'portrait' | 'landscape' };
    }

    interface Html2Pdf {
        set(options: Html2PdfOptions): Html2Pdf;
        from(element: HTMLElement): Html2Pdf;
        save(): Promise<void>;
        toPdf(): Html2Pdf;
        get(type: string): Promise<unknown>;
    }

    function html2pdf(): Html2Pdf;
    export default html2pdf;
}
