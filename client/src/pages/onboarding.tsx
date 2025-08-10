import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ArrowLeft, Star, Trophy, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingQuestion } from "../../shared/onboarding-schema";

interface OnboardingAnswers {
  [key: string]: string | string[];
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [showCelebration, setShowCelebration] = useState(false);

  // Get onboarding questions
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["/api/onboarding/questions"],
  });

  const questions: OnboardingQuestion[] = questionsData?.questions || [];
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest("POST", "/api/onboarding/complete", preferences);
      return response.json();
    },
    onSuccess: (data) => {
      setShowCelebration(true);
      
      // Show achievement toast
      toast({
        title: "🎉 Welcome to Odesa Holiday!",
        description: `You've earned ${data.pointsEarned} points and unlocked your first achievement!`,
      });

      // Redirect to creator after celebration
      setTimeout(() => {
        setLocation("/creator");
      }, 3000);

      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions[currentStep];

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      const preferences = {
        interests: answers.interests || [],
        travelStyle: answers.travel_style || "",
        preferredActivities: answers.interests || [],
        timeOfYear: "current",
        groupSize: answers.group_size || "",
        postcardPurpose: answers.postcard_purpose || [],
        timePreference: answers.time_preference || "",
        completedOnboarding: true,
        onboardingProgress: 100
      };

      completeOnboardingMutation.mutate(preferences);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isAnswered = currentQuestion && answers[currentQuestion.id];
  const isLastStep = currentStep === totalSteps - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-4 text-6xl">
              <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
              <Star className="h-16 w-16 text-blue-500 animate-pulse" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Welcome to Odesa Holiday!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                You've unlocked your first achievement and earned 10 points!
              </p>
            </div>

            <Badge variant="secondary" className="text-lg py-2 px-4">
              🎯 First Steps Achievement
            </Badge>

            <p className="text-sm text-gray-500">
              Taking you to the postcard creator...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Let's Personalize Your Experience
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Help us recommend the perfect Odesa landmarks and postcards for you
          </p>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {currentQuestion.question}
              </CardTitle>
              <CardDescription>
                {currentQuestion.type === 'multiple_choice' 
                  ? 'Select all that apply' 
                  : 'Choose one option'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type={currentQuestion.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                      name={currentQuestion.id}
                      value={option}
                      checked={
                        currentQuestion.type === 'multiple_choice'
                          ? (answers[currentQuestion.id] as string[] || []).includes(option)
                          : answers[currentQuestion.id] === option
                      }
                      onChange={(e) => {
                        if (currentQuestion.type === 'multiple_choice') {
                          const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
                          if (e.target.checked) {
                            handleAnswerChange(currentQuestion.id, [...currentAnswers, option]);
                          } else {
                            handleAnswerChange(currentQuestion.id, currentAnswers.filter(a => a !== option));
                          }
                        } else {
                          handleAnswerChange(currentQuestion.id, option);
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="flex-1">{option}</span>
                    {currentQuestion.type === 'multiple_choice' && 
                     (answers[currentQuestion.id] as string[] || []).includes(option) && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isAnswered || completeOnboardingMutation.isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {completeOnboardingMutation.isPending ? (
              "Setting up..."
            ) : isLastStep ? (
              "Complete Setup"
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i <= currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}