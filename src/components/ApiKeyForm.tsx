
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIKey } from '@/contexts/AIKeyContext';
import { Key, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ApiKeyForm = () => {
  const { apiKey, setApiKey } = useAIKey();
  const [inputKey, setInputKey] = useState(apiKey);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
    toast.success('API key saved successfully');
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey('');
    toast.success('API key cleared');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full mx-auto border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI API Key
          </CardTitle>
          <CardDescription>
            Enter your AI API key to use the flashcard generation feature.
            Your key is stored locally in your browser and never sent to our servers.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                type={isVisible ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter your AI API key"
                className="pr-16"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 text-xs"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              onClick={handleClear}
              disabled={!apiKey}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Key
            </Button>
            <Button 
              type="submit" 
              className="w-full"
              disabled={!inputKey || inputKey === apiKey}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Key
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default ApiKeyForm;
