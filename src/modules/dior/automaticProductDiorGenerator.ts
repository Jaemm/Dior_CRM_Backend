import { Consultants, ProductRecommendations } from '@/src/common/entities/crmEntities';

type ResultType = {
    id: number;
    question: string;
    answers: string[];
};

export class AutomaticProductDiorGenerator {
    private skinTone: string;
    private productRecommendations: ProductRecommendations[];
    private routineRecommendation: string;
    private recommended: string;
    private market: string;
    private answers: string;
    private old: boolean;

    constructor(params: {
        dior_consultant: Consultants;
        skin_tone: string;
        routine_recommendation: string;
        recommended: string;
        answers: string;
        market: string;
        old: boolean;
    }) {
        this.productRecommendations = params.dior_consultant.productRecommendations;
        this.skinTone = params.skin_tone;
        this.routineRecommendation = params.routine_recommendation;
        this.recommended = params.recommended;
        this.market = params.market;
        this.answers = params.answers;
        this.old = params.old;
    }

    questionAnswers() {
        const data = [
            {
                question: "Select client's age group",
                answers: [
                    { code: 'A', answer_text: 'under 20' },
                    { code: 'B', answer_text: '20 to 30' },
                    { code: 'C', answer_text: '30 to 40' },
                    { code: 'D', answer_text: '40 to 50' },
                    { code: 'E', answer_text: '50 to 60' },
                    { code: 'F', answer_text: 'over 60' },
                ],
            },
            {
                question: 'What are your main skin concerns?',
                answers: [
                    { code: 'A', answer_text: 'wrinkles & fines lines' },
                    { code: 'B', answer_text: 'lack of firmness' },
                    { code: 'C', answer_text: 'dark spots' },
                    { code: 'D', answer_text: 'lack of radiance' },
                    { code: 'E', answer_text: 'open pores' },
                    { code: 'F', answer_text: 'dryness' },
                ],
            },
            {
                question: 'Have you ever tried premium skincare?',
                answers: [
                    { code: 'A', answer_text: 'Yes, I use premium skincare.' },
                    { code: 'B', answer_text: "I'd like to try Dior premium skincare." },
                    { code: 'C', answer_text: "No, I'm not interested." },
                ],
            },
            {
                question: 'What foundation FINISH are you looking for?',
                answers: [
                    { code: 'A', answer_text: 'Matte Finish' },
                    { code: 'B', answer_text: 'Glow Finish' },
                ],
            },
            {
                question: 'What foundation COVERAGE are you looking for?',
                answers: [
                    { code: 'A', answer_text: 'Light' },
                    { code: 'B', answer_text: 'Medium' },
                    { code: 'C', answer_text: 'Full' },
                ],
            },
            {
                question: 'What foundation TEXTURE are you looking for?',
                answers: [
                    { code: 'A', answer_text: 'Fluid' },
                    { code: 'B', answer_text: 'Compact' },
                    { code: 'C', answer_text: 'Cushion' },
                ],
            },
        ];

        const answerArray = this.answers.split(',');

        const result = answerArray.map((answer, i) => {
            const ans = answer.split('');
            const json = {
                id: i + 1,
                question: data[i]['question'],
                answers: [''],
            };

            if (ans.length === 1) {
                const tempAnswer = data[i]['answers'].find((eachAnswer) => (eachAnswer.code = answer));
                const answerText = tempAnswer ? tempAnswer['answer_text'] : '';

                json.answers = [answerText];
            } else {
                const arr: string[] = [];
                ans.forEach((a) => {
                    const tempAnswer = data[i]['answers'].find((eachAnswer) => (eachAnswer.code = a));
                    const answerText = tempAnswer ? tempAnswer['answer_text'] : '';
                    arr.push(answerText);
                });
                json.answers = arr;
            }

            return json;
        });

        const market = this.market;

        let product;
        if (market.toLocaleLowerCase() === 'japan') {
            product = this.getProductsFromMarketJapan(result);
        } else if (market.toLocaleLowerCase() === 'western') {
            product = this.getProductsFromMarketWestern(result);
        } else {
            // Default from asia
            product = this.getProductsFromMarketAsia(result);
        }

        return product;
    }

    getProductsFromMarketJapan(result: ResultType[]) {
        const premium = ['Yes, I use premium skincare.', "I'd like to try Dior premium skincare."];
        const drynessDarkSpot = ['dryness', 'dark spots'];

        const noDrynessDarkSpot = !result[1].answers.some((x) => drynessDarkSpot.includes(x));
        const isPremium = premium.every((p) => result[2].answers.includes(p));
        const nonPremium = ["No, I'm not interested."];

        let skincareProducts = [];
        if (noDrynessDarkSpot && isPremium) {
            skincareProducts = getSkincareRoutine(2, 'japan skincare');
        }

        if (result[1].answers.includes('dryness') && isPremium) {
            skincareProducts = getSkincareRoutine(1, 'japan skincare');
        }

        if (result[1].answers.includes('dark spots') && isPremium) {
            skincareProducts = getSkincareRoutine(3, 'japan skincare');
        }
    }

    getProductsFromMarketAsia(result: ResultType[]) {}

    getProductsFromMarketWestern(result: ResultType[]) {}

    getSkincareRoutine() {}
}
