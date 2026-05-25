import { useState } from "react";
import { motion } from "framer-motion";
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check,
  Smartphone,
  Link,
  Calendar,
  MapPin,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const QRCode = () => {
  const [copied, setCopied] = useState(false);
  
  // Mock event data - this would come from your event state/API
  const event = {
    title: "Tech Innovation Summit 2024",
    date: "March 15, 2024",
    time: "2:00 PM - 6:00 PM",
    location: "Innovation Center, San Francisco",
    url: "https://hostquill.app/events/tech-summit-2024",
    registered: 247,
    capacity: 500
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(event.url);
    setCopied(true);
    toast.success("Event link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // This would generate and download the QR code image
    toast.success("QR code downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Join me at ${event.title}`,
          url: event.url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <QrCode className="w-4 h-4" />
              Event Check-in
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              {event.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Scan or share this QR code for easy event access
            </p>

            <Badge variant="secondary" className="text-sm">
              {event.registered}/{event.capacity} Registered
            </Badge>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    Event QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Code Placeholder */}
                  <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                    
                    {/* Fake QR Code Pattern */}
                    <div className="relative w-64 h-64 bg-white rounded-xl p-4 shadow-lg">
                      <div className="w-full h-full bg-black rounded-lg p-2">
                        <div className="grid grid-cols-7 gap-1 h-full">
                          {/* Generate a simple QR-like pattern */}
                          {Array.from({ length: 49 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-sm ${
                                // Create a pseudo-random pattern that looks like QR code
                                i % 7 === 0 || i % 7 === 6 || i < 7 || i > 41
                                  ? 'bg-black'
                                  : Math.random() > 0.5
                                  ? 'bg-black'
                                  : 'bg-white'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleDownloadQR}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="w-full"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="w-full"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Scan this code with your smartphone camera</p>
                    <p>or any QR code reader app</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Event Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-sm text-muted-foreground">View on map</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Link className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium break-all">{event.url}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={handleCopyLink}
                      >
                        Copy link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Registered</span>
                    <span className="font-medium">{event.registered} people</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    <span className="font-medium">{event.capacity} people</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className="font-medium text-green-600">
                      {event.capacity - event.registered} spots
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    How to Use
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <p className="text-sm">Open your smartphone camera or QR code scanner app</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <p className="text-sm">Point it at the QR code to scan</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <p className="text-sm">Tap the link that appears to open the event page</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">4</span>
                    </div>
                    <p className="text-sm">Register or check in to the event</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCode;
