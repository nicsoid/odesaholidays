import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface LandmarkRecommendation {
  name: string;
  description: string;
  category: string;
  historicalSignificance: string;
  bestTimeToVisit: string;
  nearbyAttractions: string[];
  photoTips: string;
  personalizedReason: string;
}

export interface UserPreferences {
  interests: string[];
  previousVisits: string[];
  travelStyle: string;
  preferredActivities: string[];
  timeOfYear: string;
}

export class AIService {
  async getPersonalizedLandmarkRecommendations(
    userPreferences: UserPreferences,
    userHistory: string[] = []
  ): Promise<LandmarkRecommendation[]> {
    try {
      const prompt = `As an expert Odesa tourism guide, provide 5 personalized landmark recommendations for a visitor with these preferences:

Interests: ${userPreferences.interests.join(', ')}
Travel Style: ${userPreferences.travelStyle}
Preferred Activities: ${userPreferences.preferredActivities.join(', ')}
Time of Year: ${userPreferences.timeOfYear}
Previous Visits: ${userPreferences.previousVisits.join(', ')}
User History: ${userHistory.join(', ')}

Focus on Odesa's unique landmarks including:
- Odesa Opera House
- Potemkin Stairs
- Privoz Market
- Deribasovskaya Street
- Arcadia Beach
- Catacombs
- City Garden
- Literary Museum
- Maritime Museum
- Vorontsov Palace

For each recommendation, provide:
1. Name of the landmark
2. Brief description (2-3 sentences)
3. Category (Architecture, Culture, History, Nature, Entertainment)
4. Historical significance
5. Best time to visit
6. 2-3 nearby attractions
7. Photography tips
8. Personalized reason why this fits their preferences

Respond in JSON format with an array of recommendations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert Odesa tourism guide with deep knowledge of the city's landmarks, history, and culture. Provide personalized recommendations in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.recommendations || [];
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      throw new Error("Failed to generate personalized recommendations");
    }
  }

  async generateSocialMediaCaption(
    postcardData: {
      templateName: string;
      message: string;
      landmark: string;
      mood: string;
    }
  ): Promise<{
    instagram: string;
    twitter: string;
    facebook: string;
    hashtags: string[];
  }> {
    try {
      const prompt = `Create engaging social media captions for a postcard from Odesa, Ukraine:

Template: ${postcardData.templateName}
Personal Message: ${postcardData.message}
Landmark: ${postcardData.landmark}
Mood: ${postcardData.mood}

Generate captions for:
1. Instagram (engaging, visual, 1-2 sentences + hashtags)
2. Twitter (concise, shareable, under 280 chars)
3. Facebook (storytelling, personal, 2-3 sentences)
4. Relevant hashtags (8-12 hashtags including Odesa-specific ones)

Focus on Odesa's charm, Ukrainian culture, and the personal travel experience.
Respond in JSON format.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a social media expert specializing in travel content and Ukrainian tourism. Create engaging, authentic captions that celebrate Odesa's unique character."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 800
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        instagram: result.instagram || "",
        twitter: result.twitter || "",
        facebook: result.facebook || "",
        hashtags: result.hashtags || []
      };
    } catch (error) {
      console.error("Error generating social media captions:", error);
      throw new Error("Failed to generate social media captions");
    }
  }

  async generateOnboardingQuestions(): Promise<{
    questions: {
      id: string;
      question: string;
      type: 'multiple_choice' | 'single_choice' | 'text';
      options?: string[];
      category: string;
    }[];
  }> {
    const questions = {
      questions: [
        {
          id: 'interests',
          question: 'What interests you most about Odesa?',
          type: 'multiple_choice' as const,
          options: [
            'Historical Architecture',
            'Maritime Culture',
            'Literary Heritage',
            'Beach & Recreation',
            'Local Cuisine',
            'Art & Museums',
            'Nightlife & Entertainment',
            'Photography'
          ],
          category: 'interests'
        },
        {
          id: 'travel_style',
          question: 'How would you describe your travel style?',
          type: 'single_choice' as const,
          options: [
            'Cultural Explorer',
            'Relaxed Tourist',
            'Adventure Seeker',
            'Photo Enthusiast',
            'History Buff',
            'Local Experience Seeker'
          ],
          category: 'style'
        },
        {
          id: 'time_preference',
          question: 'When do you prefer to visit landmarks?',
          type: 'single_choice' as const,
          options: [
            'Early Morning (peaceful)',
            'Midday (vibrant)',
            'Golden Hour (photos)',
            'Evening (romantic)',
            'Night (atmospheric)'
          ],
          category: 'timing'
        },
        {
          id: 'group_size',
          question: 'Who are you traveling with?',
          type: 'single_choice' as const,
          options: [
            'Solo Travel',
            'Couple',
            'Family with Kids',
            'Friends Group',
            'Extended Family'
          ],
          category: 'group'
        },
        {
          id: 'postcard_purpose',
          question: 'What will you use postcards for?',
          type: 'multiple_choice' as const,
          options: [
            'Send to Family',
            'Share with Friends',
            'Social Media',
            'Personal Collection',
            'Business/Work',
            'Gifts & Souvenirs'
          ],
          category: 'purpose'
        }
      ]
    };

    return questions;
  }
}

export const aiService = new AIService();