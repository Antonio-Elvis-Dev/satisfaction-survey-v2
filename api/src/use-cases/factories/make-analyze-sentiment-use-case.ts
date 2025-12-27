import { AnalyzeSentimentUseCase } from "../analyze-sentiment";

export function makeAnalyzeSentimentUseCase() {
        const analyzeSentimentUseCase = new AnalyzeSentimentUseCase()

        return analyzeSentimentUseCase
}