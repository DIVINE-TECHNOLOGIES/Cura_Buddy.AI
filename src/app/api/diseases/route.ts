import { NextRequest, NextResponse } from 'next/server';
import { getAllDiseases, getAllSymptoms, searchDiseasesBySymptom } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en';
    const symptom = searchParams.get('symptom');
    const allSymptoms = searchParams.get('allSymptoms') === 'true';

    // Return all symptoms list
    if (allSymptoms) {
      const symptoms = getAllSymptoms(locale);
      return NextResponse.json({ symptoms });
    }

    // Search by symptom
    if (symptom) {
      const diseases = searchDiseasesBySymptom(symptom, locale);
      return NextResponse.json({ diseases });
    }

    // Return all diseases
    const diseases = getAllDiseases(locale);
    return NextResponse.json({ diseases });
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

