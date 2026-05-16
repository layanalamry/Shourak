import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BookingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expertId: string;
  expertName: string;
  expertSkills: string[];
  expertBio: string;
}

const BookingRequestDialog = ({ open, onOpenChange, expertId, expertName, expertSkills, expertBio }: BookingRequestDialogProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setLoading(true);

    try {
      // Analyze request with AI via local API
      let analysis = { urgency: 'medium', relevance_score: 0.5 };
      try {
        const analyzeRes = await fetch('/api/analyze-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, expertSkills, expertBio }),
        });
        if (analyzeRes.ok) {
          analysis = await analyzeRes.json();
        }
      } catch {
        // Fall back to defaults if AI analysis fails
      }

      // Create booking request
      const { error } = await supabase.from('booking_requests').insert({
        guest_id: user.id,
        expert_id: expertId,
        message: message.trim(),
        urgency: analysis.urgency,
        relevance_score: analysis.relevance_score,
      });

      if (error) throw error;

      toast.success('Request sent!', {
        description: `Your request to ${expertName} has been submitted with ${analysis.urgency} priority.`,
      });
      setMessage('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Book Session with {expertName}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Describe what you need help with. AI will analyze the urgency and match relevance to the expert's skills.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your situation, what you need help with, and any urgency..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
          />
          <Button type="submit" className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading || !message.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Analyzing & Sending...' : 'Send Request'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestDialog;
