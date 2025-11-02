import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SAMPLE_CSV_CONTENT = `name,description,event_type,date,venue,mode
"Tech Talk: AI in 2024","An insightful session on artificial intelligence trends",webinar,2024-03-15T10:00:00Z,"Virtual - Zoom",online
"HackHazards 2023","Annual hackathon for innovative solutions",hackathon,2023-12-20T09:00:00Z,"Main Campus Auditorium",offline
"Coding Bootcamp","5-day intensive programming workshop",bootcamp,2024-01-10T09:00:00Z,"Computer Lab A",offline
"Annual Meetup","Community networking event",meetup,2023-11-25T18:00:00Z,"City Convention Center",offline
"Algorithm Contest","Competitive programming challenge",contest,2024-02-14T14:00:00Z,"Online Platform",online`;

interface BulkEventUploadProps {
  onUploadComplete: () => void;
}

const BulkEventUpload = ({ onUploadComplete }: BulkEventUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_events.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Sample CSV downloaded successfully",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length === headers.length) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return rows;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const events = parseCSV(text);

      if (events.length === 0) {
        throw new Error('No valid events found in CSV');
      }

      // Ensure unique short_id values by generating client-side and checking against existing ones
      const { data: existingRows, error: selectError } = await supabase
        .from('events')
        .select('short_id');
      if (selectError) throw selectError;
      const used = new Set((existingRows ?? []).map((r: { short_id: string }) => r.short_id));
      const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const genShortId = () => {
        let id = '';
        for (let i = 0; i < 8; i++) {
          id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        return id;
      };

      const eventsToInsert = events.map(event => {
        let short_id = genShortId();
        while (used.has(short_id)) short_id = genShortId();
        used.add(short_id);
        
        // Parse and format date to ISO 8601 timestamp
        let formattedDate: string;
        try {
          const parsedDate = new Date(event.date);
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date: ${event.date}`);
          }
          formattedDate = parsedDate.toISOString();
        } catch (error) {
          throw new Error(`Failed to parse date "${event.date}" for event "${event.name}"`);
        }
        
        return {
          name: event.name,
          description: event.description || '',
          event_type: event.event_type as 'hackathon' | 'webinar' | 'bootcamp' | 'meetup' | 'contest',
          date: formattedDate,
          venue: event.venue,
          mode: event.mode || null,
          is_bulk_uploaded: true,
          short_id,
        };
      });

      const { error } = await supabase
        .from('events')
        .insert(eventsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${events.length} events uploaded successfully`,
      });

      setFile(null);
      setOpen(false);
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload events",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload Events
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Events</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple past events at once. Download the sample CSV to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sample CSV Format</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Required columns: name, description, event_type, date, venue, mode
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Your CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select CSV file
                  </span>
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Events'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEventUpload;