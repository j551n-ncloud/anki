import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import ApiKeyForm from '@/components/ApiKeyForm';
import { Key, ShieldCheck } from 'lucide-react';
import Layout from "@/components/Layout";

const ApiKeySettings = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Key className="h-12 w-12 mx-auto text-primary mb-4" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            AI API Key Settings
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Configure your AI API key for AI-powered flashcard generation
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ApiKeyForm />
        </motion.div>

        <motion.div 
          className="mt-12 p-6 bg-accent rounded-lg border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-lg mb-2">Data Security</h3>
              <p className="text-muted-foreground">
                Your API key is stored securely in your browser's local storage and is never sent 
                to our servers. All API requests are made directly from your browser to AI service servers.
                You can delete your stored API key at any time by clearing your browser's storage.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/create')}
            className="mx-auto"
          >
            Back to Flashcard Creator
          </Button>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default ApiKeySettings;
