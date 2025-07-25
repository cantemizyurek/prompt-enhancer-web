
"use client";

import { useState } from "react";
import { motion, AnimatePresence, useAnimate } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mastraClient } from "@/lib/mastra";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [scope, animate] = useAnimate();
  
  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
  }
  
  const [particles, setParticles] = useState<Particle[]>([]);

  const enhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsEnhancing(true);
    
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      duration: Math.random() * 1 + 10
    }));
    
    setParticles(newParticles);

    animate(scope.current, { boxShadow: '0 0 15px rgba(255, 255, 255, 0.7)' }, { duration: 0.5 });
    animate(scope.current, { boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)' }, { duration: 0.5, delay: 1 });
    
    const agent = mastraClient.getAgent("promptEnhancerAgent");

    const result = await agent.generate({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const messages = result.response.messages;

    const message = messages[messages.length - 1];
    
    if (message.role === "assistant") {
      const content = message.content as {type: "text"; text: string}[];
      setEnhancedPrompt(content.map(part => part.text).join("\n"));
    } else {
      setEnhancedPrompt("Something went wrong");
    }
    
    setIsEnhancing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhancedPrompt);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 md:py-12 md:px-8 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Prompt Enhancer
          </motion.h1>
          <motion.p
            className="text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Transform your basic prompts into detailed, structured, and effective instructions
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="mb-8 border border-border bg-card">
            <CardHeader>
              <CardTitle>Input Prompt</CardTitle>
              <CardDescription>Enter your basic prompt here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={scope}
                placeholder="Enter your prompt here..."
                className="min-h-32 resize-none bg-background transition-all duration-300"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={enhancePrompt} 
                disabled={!prompt.trim() || isEnhancing}
                className="bg-primary hover:bg-primary/90"
              >
                {isEnhancing ? "Enhancing..." : "Enhance Prompt"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {(isEnhancing || enhancedPrompt) && (
          <AnimatePresence mode="wait">
            <motion.div
              key={isEnhancing ? 'enhancing' : 'enhanced'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle>Enhanced Prompt</CardTitle>
                <CardDescription>Your improved, detailed prompt</CardDescription>
              </CardHeader>
              <CardContent>
                {isEnhancing ? (
                  <div className="space-y-2 relative overflow-hidden">
                    {/* Animated loading skeletons */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear'
                      }}
                    />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-2/5" />
                  </div>
                ) : (
                  <motion.div 
                    className="whitespace-pre-wrap bg-background p-4 rounded-md border border-border overflow-hidden relative"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {enhancedPrompt.split('\n').map((line, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                        >
                          {line || <br />}
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* Magical shimmer effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      style={{ pointerEvents: 'none' }}
                    />
                  </motion.div>
                )}
              </CardContent>
              {!isEnhancing && enhancedPrompt && (
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline"
                    className="bg-secondary hover:bg-secondary/90"
                    disabled={isCopied}
                  >
                    {isCopied ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </main>
  );
}
