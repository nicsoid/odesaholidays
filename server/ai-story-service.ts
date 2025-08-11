import OpenAI from "openai";
import type { TravelStory, StoryPreferences } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StoryGenerationRequest {
  location: string;
  mood?: string;
  style?: string;
  userContext?: string; // Personal details user wants to include
  preferences?: StoryPreferences;
}

export interface GeneratedStory {
  title: string;
  story: string;
  instagramCaption: string;
  hashtags: string[];
  mood: string;
  style: string;
}

// Odesa landmarks and their characteristics for better story generation
const ODESA_LANDMARKS = {
  "Potemkin Steps": {
    keywords: ["iconic stairs", "historic steps", "panoramic view", "architectural marvel"],
    mood_context: { romantic: "sunset views", adventurous: "climbing challenge", cultural: "historical significance" }
  },
  "Opera House": {
    keywords: ["baroque architecture", "cultural palace", "elegant evening", "artistic heritage"],
    mood_context: { romantic: "elegant date night", cultural: "opera performance", sophisticated: "architectural beauty" }
  },
  "Deribasovskaya Street": {
    keywords: ["pedestrian boulevard", "street performers", "cafes", "shopping", "vibrant atmosphere"],
    mood_context: { casual: "strolling and people watching", social: "street cafe culture", energetic: "bustling street life" }
  },
  "Arcadia Beach": {
    keywords: ["Black Sea coastline", "beach clubs", "summer vibes", "seaside restaurants"],
    mood_context: { relaxed: "beach day", party: "nightclub scene", romantic: "seaside sunset" }
  },
  "City Garden": {
    keywords: ["green oasis", "peaceful walks", "historic park", "fountains"],
    mood_context: { peaceful: "quiet reflection", romantic: "garden stroll", family: "picnic spot" }
  }
};

const MOOD_PROMPTS = {
  happy: "Create an upbeat, joyful story that captures the excitement and happiness of discovering this location",
  adventurous: "Write an exciting, adventurous story that emphasizes exploration, discovery, and the thrill of travel",
  romantic: "Craft a romantic, intimate story that highlights the beauty and charm perfect for couples",
  cultural: "Develop a culturally rich story that showcases the history, traditions, and local culture",
  peaceful: "Write a serene, contemplative story that emphasizes tranquility and personal reflection",
  energetic: "Create a vibrant, dynamic story that captures the energy and liveliness of the location"
};

const STYLE_PROMPTS = {
  casual: "Write in a friendly, conversational tone as if talking to a close friend",
  poetic: "Use beautiful, lyrical language with metaphors and imagery",
  humorous: "Include light humor and witty observations while staying respectful",
  inspirational: "Create an uplifting, motivational tone that inspires others to travel"
};

export class AIStoryService {
  async generateTravelStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    const { location, mood = 'happy', style = 'casual', userContext, preferences } = request;
    
    // Build context about the location
    const locationContext = ODESA_LANDMARKS[location as keyof typeof ODESA_LANDMARKS] || {
      keywords: [location],
      mood_context: { [mood]: `exploring ${location}` }
    };

    // Create the prompt
    const prompt = this.buildStoryPrompt(location, mood, style, locationContext, userContext, preferences);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a creative travel storyteller specializing in Odesa, Ukraine. You create engaging, authentic travel stories that capture the essence of this beautiful Black Sea coastal city. Always include specific details about Odesa's unique character, from its multicultural heritage to its stunning seaside location."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        title: result.title || `My ${mood} adventure in ${location}`,
        story: result.story || `Discovering the beauty of ${location} in Odesa...`,
        instagramCaption: result.instagram_caption || result.story?.substring(0, 200) + '...',
        hashtags: result.hashtags || this.generateFallbackHashtags(location, mood),
        mood,
        style
      };
    } catch (error) {
      console.error('Error generating story:', error);
      
      // Fallback story generation
      return this.generateFallbackStory(location, mood, style);
    }
  }

  private buildStoryPrompt(
    location: string, 
    mood: string, 
    style: string, 
    locationContext: any,
    userContext?: string,
    preferences?: StoryPreferences
  ): string {
    const maxHashtags = preferences?.maxHashtags || 10;
    const hashtagStyle = preferences?.preferredHashtagStyle || 'trendy';
    
    return `Create a personalized travel story for Instagram about visiting ${location} in Odesa, Ukraine.

LOCATION CONTEXT: ${location}
Keywords to include: ${locationContext.keywords.join(', ')}
Specific mood context: ${locationContext.mood_context[mood] || 'exploring this beautiful location'}

MOOD: ${mood} - ${MOOD_PROMPTS[mood as keyof typeof MOOD_PROMPTS] || 'Create an engaging story'}
STYLE: ${style} - ${STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS] || 'Use a natural, engaging tone'}

${userContext ? `PERSONAL CONTEXT: Include these personal details naturally: ${userContext}` : ''}

HASHTAG REQUIREMENTS:
- Generate ${maxHashtags} relevant hashtags
- Style: ${hashtagStyle} (trendy = current popular tags, classic = timeless travel tags, niche = specific location tags)
- Include location-specific tags for Odesa and Ukraine
- Mix popular travel hashtags with location-specific ones

Return a JSON object with:
{
  "title": "Engaging title (max 60 chars)",
  "story": "Full story (200-400 words, engaging and personal)",
  "instagram_caption": "Instagram-ready caption (max 150 words) with story highlights",
  "hashtags": ["array", "of", "${maxHashtags}", "hashtags", "without", "#"]
}

Make the story authentic, specific to Odesa's unique character (multicultural, coastal, historic), and optimized for Instagram engagement.`;
  }

  private generateFallbackStory(location: string, mood: string, style: string): GeneratedStory {
    const fallbackStories = {
      happy: `Just spent the most amazing day exploring ${location} in beautiful Odesa! This coastal city never fails to surprise me with its stunning architecture and warm hospitality.`,
      romantic: `${location} in Odesa provided the perfect romantic backdrop today. There's something magical about this Black Sea coastal city that makes every moment feel special.`,
      adventurous: `Adventure called, and ${location} in Odesa answered! Exploring this historic Ukrainian port city is always an adventure filled with discoveries.`,
      cultural: `Immersing myself in the rich cultural heritage at ${location} today. Odesa's multicultural history comes alive in every corner of this magnificent city.`
    };

    return {
      title: `Discovering ${location}`,
      story: fallbackStories[mood as keyof typeof fallbackStories] || `Exploring the beauty of ${location} in Odesa, Ukraine.`,
      instagramCaption: `Another amazing day in Odesa! ${location} was absolutely incredible. #OdesaLife #Ukraine`,
      hashtags: this.generateFallbackHashtags(location, mood),
      mood,
      style
    };
  }

  private generateFallbackHashtags(location: string, mood: string): string[] {
    const baseHashtags = ['odesa', 'ukraine', 'travel', 'blacksea', 'explore', 'wanderlust'];
    const locationHashtags = location.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const moodHashtags = {
      happy: ['happiness', 'joy', 'amazing', 'beautiful'],
      romantic: ['romantic', 'love', 'sunset', 'beautiful'],
      adventurous: ['adventure', 'explore', 'discovery', 'exciting'],
      cultural: ['culture', 'history', 'heritage', 'architecture']
    };

    return [
      ...baseHashtags,
      locationHashtags,
      ...(moodHashtags[mood as keyof typeof moodHashtags] || ['travel', 'amazing'])
    ].slice(0, 10);
  }

  async generateInstagramHashtags(story: string, location: string, mood: string, count: number = 10): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a social media expert specializing in Instagram hashtags for travel content about Odesa, Ukraine."
          },
          {
            role: "user",
            content: `Generate ${count} engaging Instagram hashtags for this travel story about ${location} in Odesa:

"${story}"

Mood: ${mood}

Requirements:
- Mix popular travel hashtags with Odesa-specific tags
- Include Ukrainian and Black Sea related tags
- Make them relevant to the story content and mood
- Return as JSON array of strings without # symbols

Example format: ["odesa", "ukraine", "travel", "blacksea"]`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"hashtags": []}');
      return result.hashtags || this.generateFallbackHashtags(location, mood);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return this.generateFallbackHashtags(location, mood);
    }
  }
}

export const aiStoryService = new AIStoryService();