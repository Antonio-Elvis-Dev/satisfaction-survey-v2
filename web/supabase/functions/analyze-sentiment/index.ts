import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { surveyId } = await req.json();

    if (!surveyId) {
      return new Response(JSON.stringify({ error: 'surveyId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch text responses that haven't been analyzed yet
    const { data: responses, error: fetchError } = await supabase
      .from('responses')
      .select('id, text_response, session_id')
      .not('text_response', 'is', null)
      .order('answered_at', { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;

    if (!responses || responses.length === 0) {
      return new Response(JSON.stringify({ message: 'No text responses to analyze', analyzed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let analyzed = 0;

    // Process each response
    for (const response of responses) {
      // Check if already analyzed
      const { data: existing } = await supabase
        .from('response_sentiment')
        .select('id')
        .eq('response_id', response.id)
        .maybeSingle();

      if (existing) continue;

      // Analyze sentiment using Lovable AI
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a sentiment analysis assistant. Analyze the sentiment of customer feedback and respond with ONLY a JSON object containing "sentiment" (positive/neutral/negative) and "confidence" (0-1). Example: {"sentiment":"positive","confidence":0.85}'
            },
            {
              role: 'user',
              content: `Analyze this feedback: "${response.text_response}"`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error('AI gateway error:', aiResponse.status, await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;

      if (!content) continue;

      // Parse AI response
      let sentiment, confidence;
      try {
        const parsed = JSON.parse(content);
        sentiment = parsed.sentiment;
        confidence = parsed.confidence;
      } catch {
        // Fallback to simple parsing
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('positive')) sentiment = 'positive';
        else if (lowerContent.includes('negative')) sentiment = 'negative';
        else sentiment = 'neutral';
        confidence = 0.7;
      }

      // Store sentiment analysis
      const { error: insertError } = await supabase
        .from('response_sentiment')
        .insert({
          response_id: response.id,
          sentiment,
          confidence,
        });

      if (!insertError) analyzed++;
    }

    return new Response(JSON.stringify({ 
      message: 'Sentiment analysis completed', 
      analyzed,
      total: responses.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});