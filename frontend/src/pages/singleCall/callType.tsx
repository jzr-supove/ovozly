export interface CallData {
  status: string;
  result: {
    detail: string;
    call_metadata: {
      language: string; // e.g., "uzbek"
    };
    speech_analysis: {
      transcript: string;
      intent_detection: Array<{
        intent: string;
        confidence_score: number;
      }>;
      sentiment_analysis: {
        customer_sentiment: string; // e.g., "neutral"
        agent_sentiment: string; // e.g., "positive"
      };
      entities_extracted: Array<{
        entity_type: string; // e.g., "kartochka"
        value: string; // e.g., "master kartasi"
        confidence_score: number; // e.g., 0.95
      }>;
      issues_identified: Array<{
        issue_type: string; // e.g., "kartani o'tkazish"
        description: string; // e.g., "Master kartani yangi..."
      }>;
    };
    summary_analysis: {
      key_points: string[];
      overall_sentiment: string;
      call_efficiency: string;
      resolution_status: string;
    };
    action_recommendations: Array<{
      action_type: string; // e.g., "murojaat"
      details: string; // e.g., "Mijozga bankka murojaat ..."
    }>;
  };
}
