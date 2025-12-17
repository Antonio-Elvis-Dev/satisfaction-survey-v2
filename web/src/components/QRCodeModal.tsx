import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  surveyTitle: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ 
  open, 
  onOpenChange, 
  surveyId, 
  surveyTitle 
}) => {
  const surveyUrl = `${window.location.origin}/public/survey/${surveyId}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qrcode-${surveyTitle.replace(/\s+/g, '-')}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('QR Code baixado com sucesso');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    toast.success('Link copiado para a área de transferência');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code da Pesquisa</DialogTitle>
          <DialogDescription>
            Compartilhe este QR Code para coletar respostas presencialmente
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG 
              id="qr-code-svg"
              value={surveyUrl} 
              size={256}
              level="H"
              includeMargin
            />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">{surveyTitle}</p>
            <p className="text-xs text-muted-foreground break-all px-4">
              {surveyUrl}
            </p>
          </div>

          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleCopyLink}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
            <Button 
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;