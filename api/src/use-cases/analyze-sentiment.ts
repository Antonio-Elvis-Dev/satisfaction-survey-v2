import Sentiment from 'sentiment';

interface AnalyzeSentimentRequest {
    text: string;
}

interface AnalyzeSentimentResponse {
    score: number;      // Pontuação numérica (ex: 3)
    sentiment: 'positive' | 'negative' | 'neutral'; // Veredito
}

export class AnalyzeSentimentUseCase {
    execute({ text }: AnalyzeSentimentRequest): AnalyzeSentimentResponse {
        const sentiment = new Sentiment();

        // Um mini-dicionário PT-BR para garantir que funciona logo de cara
        // Podes expandir isto depois ou usar uma lib específica de PT
        const ptBrLanguage = {
            labels: {
                'bom': 3, 'excelente': 5, 'incrivel': 5, 'ótimo': 4, 'gostei': 3, 'feliz': 3, 'amo': 4,
                'ruim': -3, 'péssimo': -5, 'horrível': -5, 'triste': -3, 'odeio': -4, 'demorado': -2, 'caro': -2,
                'lento': -2, 'problema': -2, 'erro': -2, 'falha': -3, 'pior': -4, 'melhor': 4
            }
        };

        sentiment.registerLanguage('pt', ptBrLanguage);

        // Analisa o texto (tenta usar o PT, mas o fallback inglês ajuda com termos universais "ok", "good")
        const result = sentiment.analyze(text, { language: 'pt' });
        
        let label: 'positive' | 'negative' | 'neutral' = 'neutral';
        
        if (result.score > 0) label = 'positive';
        if (result.score < 0) label = 'negative';

        return {
            score: result.score,
            sentiment: label
        };
    }
}