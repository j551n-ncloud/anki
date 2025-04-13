
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowRightCircle, Check, Download, Link, Terminal } from "lucide-react";

interface AnkiTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnkiTutorialModal = ({ isOpen, onClose }: AnkiTutorialModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Connect to Anki</DialogTitle>
          <DialogDescription>
            Follow these steps to set up AnkiConnect and use it with this application
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Step 1: Install Anki
              </h3>
              <p>
                If you haven't already, download and install Anki from the official website.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <a href="https://apps.ankiweb.net/" target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download Anki
                  </a>
                </Button>
              </div>
            </section>
            
            <Separator />
            
            <section className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Step 2: Install AnkiConnect Add-on
              </h3>
              <p>
                AnkiConnect is an add-on that allows external applications to communicate with Anki.
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Open Anki on your computer</li>
                <li>From the menu bar, select <span className="font-medium">Tools → Add-ons</span></li>
                <li>Click <span className="font-medium">Get Add-ons...</span></li>
                <li>Enter the AnkiConnect code: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">2055492159</code></li>
                <li>Click <span className="font-medium">OK</span></li>
                <li>Restart Anki when prompted</li>
              </ol>
            </section>
            
            <Separator />
            
            <section className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Step 3: Configure AnkiConnect (Optional)
              </h3>
              <p>
                By default, AnkiConnect only accepts connections from localhost. If you're using this application on a different computer than Anki, you'll need to configure AnkiConnect to accept external connections.
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>In Anki, go to <span className="font-medium">Tools → Add-ons</span></li>
                <li>Select AnkiConnect from the list</li>
                <li>Click <span className="font-medium">Config</span></li>
                <li>Change the "webBindAddress" to "0.0.0.0" to allow all connections (or your specific IP)</li>
                <li>Add your app's origin to the "webCorsOriginList"</li>
                <li>Click <span className="font-medium">Save</span></li>
                <li>Restart Anki</li>
              </ol>
              <div className="bg-muted p-3 rounded text-xs font-mono mt-2">
                {`{
  "apiKey": null,
  "apiLogPath": null,
  "webBindAddress": "127.0.0.1",
  "webBindPort": 8765,
  "webCorsOriginList": [""anki.j551n.com""] or [""*""]
}`}
              </div>
            </section>
            
            <Separator />
            
            <section className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Step 4: Using with this Application
              </h3>
              <p>
                Make sure Anki is running in the background whenever you want to add cards from this application.
              </p>
              <div className="flex items-center gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded">
                <Terminal className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  You must keep Anki running in the background whenever using this application to add cards.
                </p>
              </div>
            </section>
            
            <Separator />
            
            <section className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Troubleshooting
              </h3>
              <p>
                If you're having trouble connecting:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Ensure Anki is running</li>
                <li>Check if AnkiConnect is properly installed</li>
                <li>Try refreshing the connection using the "Refresh" button</li>
                <li>Restart Anki and try again</li>
                <li>Check if any firewall is blocking port 8765</li>
              </ul>
            </section>
            
            <section className="space-y-2 mt-4 pt-2">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded">
                <Link className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  For more details and advanced configuration, visit the <a href="https://github.com/FooSoft/anki-connect" target="_blank" rel="noopener noreferrer" className="underline font-medium">AnkiConnect GitHub page</a>.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            <ArrowRightCircle className="h-4 w-4 mr-1.5" />
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnkiTutorialModal;
