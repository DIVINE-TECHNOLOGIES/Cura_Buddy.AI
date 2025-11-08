import { NextRequest, NextResponse } from 'next/server';

interface Disease {
  name: { [key: string]: string };
  symptoms: { [key: string]: string[] };
  cure: { [key: string]: string };
  medicines: string[];
}

// Enhanced AI response function that uses disease data and provides intelligent responses
async function getAIResponse(
  question: string,
  diseases: Disease[],
  _conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  const q = question.toLowerCase().trim();

  // Check for greetings
  if (q.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i)) {
    return "Hello! I'm Cura Buddy AI, your healthcare assistant. I'm here to help you with health-related questions, symptom analysis, and general medical guidance. How can I assist you today?";
  }

  // Check for specific diseases with better matching
  const matchedDiseases: Array<{ disease: Disease; matchScore: number }> = [];
  
  for (const disease of diseases) {
    const symptoms = disease.symptoms['en'] || [];
    let matchScore = 0;
    
    symptoms.forEach(symptom => {
      const symptomLower = symptom.toLowerCase();
      if (q.includes(symptomLower)) {
        matchScore += 2;
      }
      // Check for partial matches
      const symptomWords = symptomLower.split(' ');
      symptomWords.forEach(word => {
        if (word.length > 3 && q.includes(word)) {
          matchScore += 0.5;
        }
      });
    });
    
    if (matchScore > 0) {
      matchedDiseases.push({ disease, matchScore });
    }
  }

  // Sort by match score and get top matches
  matchedDiseases.sort((a, b) => b.matchScore - a.matchScore);
  
  if (matchedDiseases.length > 0 && matchedDiseases[0].matchScore >= 1) {
    const topMatch = matchedDiseases[0].disease;
    const name = topMatch.name['en'] || topMatch.name['hi'] || topMatch.name['ta'] || topMatch.name['te'];
    const cure = topMatch.cure['en'] || topMatch.cure['hi'] || topMatch.cure['ta'] || topMatch.cure['te'];
    const medicines = topMatch.medicines.join(', ');
    
    let response = `Based on your symptoms, you might be experiencing **${name}**.\n\n`;
    response += `**Recommended Treatment:**\n${cure}\n\n`;
    response += `**Common Medications:** ${medicines}\n\n`;
    
    if (matchedDiseases.length > 1) {
      response += `*Note: I also found similar symptoms for other conditions. `;
      response += `For an accurate diagnosis, please consult with a qualified healthcare professional.*`;
    } else {
      response += `*⚠️ Important: This is a preliminary assessment. Please consult a healthcare professional for an accurate diagnosis and personalized treatment plan.*`;
    }
    
    return response;
  }

  // Health advice patterns
  if (q.match(/(health|wellness|fitness|exercise|diet|nutrition)/i)) {
    return `Here are some general health tips:\n\n` +
           `• **Stay Hydrated:** Drink at least 8 glasses of water daily\n` +
           `• **Balanced Diet:** Include fruits, vegetables, whole grains, and lean proteins\n` +
           `• **Regular Exercise:** Aim for at least 30 minutes of moderate activity most days\n` +
           `• **Adequate Sleep:** Get 7-9 hours of quality sleep each night\n` +
           `• **Stress Management:** Practice relaxation techniques like meditation or deep breathing\n` +
           `• **Regular Check-ups:** Visit your healthcare provider for preventive care\n\n` +
           `*Remember: These are general guidelines. For personalized advice, consult a healthcare professional.*`;
  }

  // Emergency keywords
  if (q.match(/(emergency|urgent|severe|critical|chest pain|difficulty breathing|unconscious)/i)) {
    return `🚨 **EMERGENCY ALERT** 🚨\n\n` +
           `If you're experiencing a medical emergency, please:\n\n` +
           `1. **Call emergency services immediately** (911 or your local emergency number)\n` +
           `2. **Do not delay** seeking professional medical help\n` +
           `3. **Do not rely solely on this AI** for emergency situations\n\n` +
           `*This AI assistant is not a substitute for professional medical care, especially in emergencies.*`;
  }

  // Medication questions
  if (q.match(/(medicine|medication|drug|pill|dosage|side effect)/i)) {
    return `I can provide general information about medications, but please note:\n\n` +
           `• **Always consult a healthcare provider** before starting, stopping, or changing medications\n` +
           `• **Follow prescribed dosages** exactly as directed\n` +
           `• **Be aware of potential side effects** and interactions\n` +
           `• **Never share medications** with others\n\n` +
           `If you have specific questions about a medication, please consult your pharmacist or doctor.`;
  }

  // Symptom-related questions
  if (q.match(/(symptom|pain|ache|fever|cough|headache|nausea|dizziness)/i)) {
    return `I understand you're experiencing symptoms. Here's how I can help:\n\n` +
           `1. **Use the Symptom Checker** section above to get more detailed analysis\n` +
           `2. **Describe your symptoms** in detail for better assistance\n` +
           `3. **Note the duration and severity** of your symptoms\n` +
           `4. **Consult a healthcare professional** if symptoms persist or worsen\n\n` +
           `*For accurate diagnosis and treatment, a healthcare provider's evaluation is essential.*`;
  }

  // Default intelligent response
  return `I'm here to help with your health-related questions! I can assist with:\n\n` +
         `🔍 **Symptom Analysis** - Describe your symptoms for preliminary assessment\n` +
         `💊 **Medication Information** - General guidance on medications\n` +
         `🏥 **Health Advice** - Tips for maintaining good health\n` +
         `🌍 **Multi-language Support** - Available in multiple languages\n\n` +
         `*Please note: I'm an AI assistant providing general information. For medical diagnosis, treatment, or emergency situations, always consult qualified healthcare professionals.*\n\n` +
         `How can I help you today?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Load diseases data from SQL database
    let diseases: Disease[] = [];
    try {
      const { getAllDiseases } = await import('../../../../lib/db');
      diseases = getAllDiseases('en');
    } catch (dbError) {
      console.error('Error loading diseases from database:', dbError);
      // Fallback: try fetching from JSON if database fails
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'public', 'symptoms_cures.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContents);
        diseases = json.diseases || [];
      } catch (fsError) {
        console.error('Error reading diseases from JSON:', fsError);
        diseases = [];
      }
    }

    // Get AI response
    const response = await getAIResponse(message, diseases, conversationHistory);

    // Simulate thinking time for better UX
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

