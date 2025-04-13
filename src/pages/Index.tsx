
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, BookOpenCheck, Sparkles, ArrowRight } from 'lucide-react';
import Layout from "@/components/Layout";

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-indigo-500/10 to-purple-500/5 py-20">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white/95 shadow-md rounded-full mb-6">
            <BrainCircuit className="h-6 w-6 text-indigo-500 mr-2" />
            <span className="text-sm font-medium text-indigo-700">AI-Powered Flashcards</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Create Anki Flashcards with <span className="text-indigo-600">AI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform any text into high-quality Anki flashcards instantly with the power of AI. Study smarter, not harder.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate('/create')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Start Creating
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 container max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                <BookOpenCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>1. Input Your Content</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Enter any text or upload documents (PDF, TXT, CSV, etc.) that you want to study.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>2. Generate with AI</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Our AI analyzes your content and creates optimized question-and-answer flashcards.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                <BrainCircuit className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>3. Export to Anki</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Review and send flashcards directly to Anki with just one click. Start studying right away.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/create')}
          >
            Try It Now
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-6 bg-secondary/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript, and AI. Designed for seamless integration with Anki.</p>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
