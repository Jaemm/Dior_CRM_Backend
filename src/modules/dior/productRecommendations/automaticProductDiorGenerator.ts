import { Consultants, ProductRecommendationSelecteds, ProductRecommendations } from '@/src/common/entities/crmEntities';
import {
    ConsultantCountriesRepository,
    ProductRecommendationGroupsRepository,
    ProductRecommendationRepository,
} from '@/src/common/repositories/crm';
import { when } from 'joi';
import { In } from 'typeorm';

type ResultJson = {
    id: number;
    question: string;
    answers: string[];
};

export class AutomaticProductDiorGenerator {
    newRoutineRecommendation = 500 as const;

    diorConsultant: Consultants;
    productRecommendations: ProductRecommendations[];
    skinTone: string;
    routineRecommendation: string;
    market: string;
    answers: string;
    old: boolean;

    consultantCountriesRepository: ConsultantCountriesRepository;
    productRecommendationsRepository: ProductRecommendationRepository;
    prGroupsRepository: ProductRecommendationGroupsRepository;

    constructor(
        params: {
            diorConsultant: Consultants;
            skinTone: string;
            routineRecommendation: string;
            market: string;
            answers: string;
            old: boolean;
        },
        repositories: {
            consultantCountriesRepository: ConsultantCountriesRepository;
            productRecommendationsRepository: ProductRecommendationRepository;
            prGroupsRepository: ProductRecommendationGroupsRepository;
        },
    ) {
        this.diorConsultant = params.diorConsultant;
        this.productRecommendations = params?.diorConsultant?.productRecommendations || null;
        this.skinTone = params.skinTone;
        this.routineRecommendation = params.routineRecommendation;
        this.market = params.market;
        this.answers = params.answers;
        this.old = params.old;

        this.consultantCountriesRepository = repositories.consultantCountriesRepository;
        this.productRecommendationsRepository = repositories.productRecommendationsRepository;
        this.prGroupsRepository = repositories.prGroupsRepository;
    }

    // async questionAnswers() {
    //     const data = [
    //         {
    //             question: "Select client's age group",
    //             answers: [
    //                 { code: 'A', answer_text: 'under 20' },
    //                 { code: 'B', answer_text: '20 to 30' },
    //                 { code: 'C', answer_text: '30 to 40' },
    //                 { code: 'D', answer_text: '40 to 50' },
    //                 { code: 'E', answer_text: '50 to 60' },
    //                 { code: 'F', answer_text: 'over 60' },
    //             ],
    //         },
    //         {
    //             question: 'What are your main skin concerns?',
    //             answers: [
    //                 { code: 'A', answer_text: 'wrinkles & fines lines' },
    //                 { code: 'B', answer_text: 'lack of firmness' },
    //                 { code: 'C', answer_text: 'dark spots' },
    //                 { code: 'D', answer_text: 'lack of radiance' },
    //                 { code: 'E', answer_text: 'open pores' },
    //                 { code: 'F', answer_text: 'dryness' },
    //             ],
    //         },
    //         {
    //             question: 'Have you ever tried premium skincare?',
    //             answers: [
    //                 { code: 'A', answer_text: 'Yes, I use premium skincare.' },
    //                 { code: 'B', answer_text: "I'd like to try Dior premium skincare." },
    //                 { code: 'C', answer_text: "No, I'm not interested." },
    //             ],
    //         },
    //         {
    //             question: 'What foundation FINISH are you looking for?',
    //             answers: [
    //                 { code: 'A', answer_text: 'Matte Finish' },
    //                 { code: 'B', answer_text: 'Glow Finish' },
    //             ],
    //         },
    //         {
    //             question: 'What foundation COVERAGE are you looking for?',
    //             answers: [
    //                 { code: 'A', answer_text: 'Light' },
    //                 { code: 'B', answer_text: 'Medium' },
    //                 { code: 'C', answer_text: 'Full' },
    //             ],
    //         },
    //         {
    //             question: 'What foundation TEXTURE are you looking for?',
    //             answers: [
    //                 { code: 'A', answer_text: 'Fluid' },
    //                 { code: 'B', answer_text: 'Compact' },
    //                 { code: 'C', answer_text: 'Cushion' },
    //             ],
    //         },
    //     ];

    //     const answerArray = this.answers.split(',');

    //     const result = answerArray.map((answer, i) => {
    //         const ans = answer.split('');
    //         const json = {
    //             id: i + 1,
    //             question: data[i]['question'],
    //             answers: [''],
    //         };

    //         if (ans.length === 1) {
    //             const tempAnswer = data[i]['answers'].find((eachAnswer) => eachAnswer.code === answer);
    //             const answerText = tempAnswer ? tempAnswer['answer_text'] : '';

    //             json.answers = [answerText];
    //         } else {
    //             const arr: string[] = [];
    //             ans.forEach((a) => {
    //                 const tempAnswer = data[i]['answers'].find((eachAnswer) => eachAnswer.code === a);
    //                 const answerText = tempAnswer ? tempAnswer['answer_text'] : '';
    //                 arr.push(answerText);
    //             });
    //             json.answers = arr;
    //         }

    //         return json;
    //     });

    //     const foundMarket = await this.consultantCountriesRepository
    //         .createQueryBuilder('country')
    //         .where('LOWER(country.name) = :market', {
    //             market: this.market.toLocaleLowerCase(),
    //         })
    //         .getOne();

    //     const market = foundMarket?.name ?? '';

    //     const recommanded = foundMarket?.defaultRecommendation ?? '';

    //     let product: ProductRecommendationSelecteds[];

    //     if (recommanded.toLowerCase().includes('japan')) {
    //         product = await this.getProductsFromMarketAsia(result);
    //     } else if (recommanded.toLowerCase().includes('western') || recommanded.toLowerCase().includes('europe')) {
    //         product = await this.getProductsFromMarketWestern(result);
    //     } else if (recommanded.toLowerCase().includes('asia')) {
    //         product = await this.getProductsFromMarketAsia(result);
    //     } else {
    //         if (this.routineRecommendation === '3') {
    //             product = await this.getProductsFromMarketWestern(result);
    //         } else if (this.routineRecommendation === '5') {
    //             product = await this.getProductsFromMarketAsia(result);
    //         } else {
    //             product = await this.getProductsFromMarketAsia(result);
    //         }
    //     }
    //     return product;
    // }
    async questionAnswers() {
        console.log('[QA-1] questionAnswers 시작', { answers: this.answers, market: this.market });

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
        console.log('[QA-2] answerArray 파싱 완료', { answerArray });

        const result = answerArray.map((answer, i) => {
            console.log(`[QA-3-${i}] 개별 answer 처리 시작`, { i, answer });

            if (!data[i]) {
            console.warn(`[QA-WARN-${i}] data에 해당 index 없음`, { i, answer });
            return { id: i + 1, question: null, answers: [] };
            }

            const ans = answer.split('');
            const json: any = {
            id: i + 1,
            question: data[i].question,
            answers: [],
            };

            if (ans.length === 1) {
            const tempAnswer = data[i].answers.find((eachAnswer) => eachAnswer.code === answer);
            const answerText = tempAnswer ? tempAnswer.answer_text : '';
            json.answers = [answerText];
            console.log(`[QA-4-${i}] 단일 답변 매핑`, { code: answer, answerText });
            } else {
            const arr: string[] = [];
            ans.forEach((a, idx) => {
                const tempAnswer = data[i].answers.find((eachAnswer) => eachAnswer.code === a);
                const answerText = tempAnswer ? tempAnswer.answer_text : '';
                arr.push(answerText);
                console.log(`[QA-4-${i}-${idx}] 다중 답변 매핑`, { code: a, answerText });
            });
            json.answers = arr;
            }

            console.log(`[QA-5-${i}] 최종 json`, json);
            return json;
        });

        console.log('[QA-6] result 생성 완료', { result });

        // ✅ market 처리
        const marketValue = this.market ? this.market.toLocaleLowerCase() : '';
        if (!this.market) {
            console.warn('[QA-WARN] market 값이 undefined, 기본값 "" 사용');
        }

        const foundMarket = await this.consultantCountriesRepository
            .createQueryBuilder('country')
            .where('LOWER(country.name) = :market', { market: marketValue })
            .getOne();
        console.log('[QA-7] foundMarket 조회 완료', { foundMarket });

        const market = foundMarket?.name ?? '';
        const recommanded = foundMarket?.defaultRecommendation ?? '';
        console.log('[QA-8] market/recommanded', { market, recommanded });

        let product: ProductRecommendationSelecteds[];

        if (recommanded?.toLowerCase().includes('japan')) {
            console.log('[QA-9] 일본 분기 진입');
            product = await this.getProductsFromMarketAsia(result);
        } else if (
            recommanded?.toLowerCase().includes('western') ||
            recommanded?.toLowerCase().includes('europe')
        ) {
            console.log('[QA-9] 서양 분기 진입');
            product = await this.getProductsFromMarketWestern(result);
        } else if (recommanded?.toLowerCase().includes('asia')) {
            console.log('[QA-9] 아시아 분기 진입');
            product = await this.getProductsFromMarketAsia(result);
        } else {
            console.log('[QA-9] 기본 분기', { routineRecommendation: this.routineRecommendation });
            if (this.routineRecommendation === '3') {
            product = await this.getProductsFromMarketWestern(result);
            } else if (this.routineRecommendation === '5') {
            product = await this.getProductsFromMarketAsia(result);
            } else {
            product = await this.getProductsFromMarketAsia(result);
            }
        }

        console.log('[QA-10] 최종 product 반환', { count: product?.length });
        return product;
    }


    async getProductsFromMarketJapan(result: ResultJson[]) {
        const products = [];

        const premium = ['Yes, I use premium skincare.', "I'd like to try Dior premium skincare."];
        const drynessDarkSpot = ['dryness', 'dark spots'];
        const nonPremium = ["No, I'm not interested."];

        const noDrynessDarkSpot = !result[1]['answers'].some((x) => drynessDarkSpot.includes(x));

        const isPremium =
            result[2]['answers'].filter((x) => premium.includes(x)).length === result[2]['answers'].length;

        const isNonPremium =
            result[2]['answers'].filter((x) => nonPremium.includes(x)).length === result[2]['answers'].length;

        let skincareProducts: ProductRecommendationSelecteds[];
        const addSkinCareRoutineForJapan = async (routine: number) => {
            skincareProducts = await this.getSkinCareRoutine(routine, 'japan skincare');
        };

        if (noDrynessDarkSpot && isPremium) await addSkinCareRoutineForJapan(2);

        if (result[1].answers.includes('dryness') && isPremium) await addSkinCareRoutineForJapan(1);

        if (result[1].answers.includes('dark spots') && isPremium) await addSkinCareRoutineForJapan(3);

        if (noDrynessDarkSpot && isNonPremium) await addSkinCareRoutineForJapan(5);

        if (result[1]['answers'].includes('dryness') && isNonPremium) await addSkinCareRoutineForJapan(4);

        if (result[1]['answers'].includes('dark spots') && isNonPremium) await addSkinCareRoutineForJapan(6);

        products.push(skincareProducts);

        const finishType = result[3]['answers'];
        const coverage = result[4]['answers'];
        const form = result[5]['answers'];

        const addMakeupRoutine = async (routineId: number) => {
            products.push(await this.getMakeupRoutine(routineId, 'japan makeup'));
        };

        if (isPremium) {
            if (finishType.includes('Matte Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) addMakeupRoutine(10);
                    if (form.includes('Compact')) addMakeupRoutine(10);
                    if (form.includes('Cushion')) addMakeupRoutine(3);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) addMakeupRoutine(1);
                    if (form.includes('Compact')) addMakeupRoutine(5);
                    if (form.includes('Cushion')) addMakeupRoutine(3);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) addMakeupRoutine(1);
                    if (form.includes('Compact')) addMakeupRoutine(5);
                    if (form.includes('Cushion')) addMakeupRoutine(11);
                }
            }

            if (finishType.includes('Glow Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) addMakeupRoutine(6);
                    if (form.includes('Compact')) addMakeupRoutine(13);
                    if (form.includes('Cushion')) addMakeupRoutine(4);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) addMakeupRoutine(2);
                    if (form.includes('Compact')) addMakeupRoutine(7);
                    if (form.includes('Cushion')) addMakeupRoutine(9);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) addMakeupRoutine(8);
                    if (form.includes('Compact')) addMakeupRoutine(7);
                    if (form.includes('Cushion')) addMakeupRoutine(9);
                }
            }
        } else {
            if (finishType.includes('Matte Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) addMakeupRoutine(10);
                    if (form.includes('Compact')) addMakeupRoutine(11);
                    if (form.includes('Cushion')) addMakeupRoutine(3);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) addMakeupRoutine(1);
                    if (form.includes('Compact')) addMakeupRoutine(5);
                    if (form.includes('Cushion')) addMakeupRoutine(3);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) addMakeupRoutine(1);
                    if (form.includes('Compact')) addMakeupRoutine(5);
                    if (form.includes('Cushion')) addMakeupRoutine(12);
                }
            }

            if (finishType.includes('Glow Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) addMakeupRoutine(6);
                    if (form.includes('Compact')) addMakeupRoutine(13);
                    if (form.includes('Cushion')) addMakeupRoutine(4);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) addMakeupRoutine(2);
                    if (form.includes('Compact')) addMakeupRoutine(7);
                    if (form.includes('Cushion')) addMakeupRoutine(4);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) addMakeupRoutine(2);
                    if (form.includes('Compact')) addMakeupRoutine(7);
                    if (form.includes('Cushion')) addMakeupRoutine(9);
                }
            }
        }

        return products.flat();
    }

    async getProductsFromMarketWestern(result: ResultJson[]) {
        const products: ProductRecommendationSelecteds[][] = [];

        const premium = ['Yes, I use premium skincare.', "I'd like to try Dior premium skincare."];
        const nonPremium = ["No, I'm not interested."];

        const noDryness = !result[1]['answers'].includes('dryness');

        const isPremium =
            result[2]['answers'].filter((x) => premium.includes(x)).length === result[2]['answers'].length;

        const isNonPremium =
            result[2]['answers'].filter((x) => nonPremium.includes(x)).length === result[2]['answers'].length;

        let skincareProducts;
        const addSkincareRoutine = async (routine: number) => {
            skincareProducts = await this.getSkinCareRoutine(routine, 'western skincare');
        };

        if (noDryness && isPremium) await addSkincareRoutine(2);

        if (!noDryness && isPremium) await addSkincareRoutine(1);

        if (noDryness && isNonPremium) await addSkincareRoutine(3);

        if (!noDryness && isNonPremium) await addSkincareRoutine(4);

        products.push(skincareProducts);

        const finishType = result[3]['answers'];
        const coverage = result[4]['answers'];
        const form = result[5]['answers'];

        const addMakeupRoutine = async (routine: number) => {
            products.push(await this.getMakeupRoutine(routine, 'western makeup'));
        };

        if (isPremium) {
            if (finishType.includes('Matte Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(9);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(10);
                    }
                }
            }

            if (finishType.includes('Glow Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(3);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(5);
                    }
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(2);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(8);
                    }
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(7);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(8);
                    }
                }
            }
        } else {
            if (finishType.includes('Matte Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(9);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(10);
                    }
                }
            }

            if (finishType.includes('Glow Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(3);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(5);
                    }
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(2);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(5);
                    }
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) {
                        await addMakeupRoutine(2);
                    }

                    if (form.includes('Cushion')) {
                        await addMakeupRoutine(8);
                    }
                }
            }
        }

        return products.flat();
    }

    async getProductsFromMarketAsia(result: ResultJson[]) {
        const products: ProductRecommendationSelecteds[][] = [];
        const premium = ['Yes, I use premium skincare.', "I'd like to try Dior premium skincare."];
        const drynessDarkSpot = ['dryness', 'dark spots'];
        const nonPremium = ["No, I'm not interested."];
        const darkSpotWrinkles = ['dark spots', 'wrinkles & fines lines'];
        const darkSpotFirmness = ['dark spots', 'lack of firmness'];
        const isAnswer1Count1 = result[1]['answers'].length === 1;
        const isDryness = result[1]['answers'].includes('dryness');
        const isDarkspots = result[1]['answers'].includes('dark spots');
        const isDarkSpotWrinkles = result[1]['answers'].every((x) => darkSpotWrinkles.includes(x));
        const isDarkSpotFirmness = result[1]['answers'].every((x) => darkSpotFirmness.includes(x));
        const isPremium =
            result[2]['answers'].filter((x) => premium.includes(x)).length === result[2]['answers'].length;
        const isNonPremium =
            result[2]['answers'].filter((x) => nonPremium.includes(x)).length === result[2]['answers'].length;
        let skincareProducts;
        const addSkincareRoutineForAsia = async (routine: number) => {
            skincareProducts = await this.getSkinCareRoutine(routine, 'asia skincare');
        };

        if (isAnswer1Count1 && isDryness && isPremium) await addSkincareRoutineForAsia(1);
        else if (isAnswer1Count1 && isDarkspots && isPremium) await addSkincareRoutineForAsia(3);
        else if (isPremium) await addSkincareRoutineForAsia(2);

        if (isAnswer1Count1 && isDarkspots && isNonPremium) await addSkincareRoutineForAsia(7);
        else if ((isDarkSpotFirmness && isNonPremium) || (isDarkSpotWrinkles && isNonPremium))
            await addSkincareRoutineForAsia(6);
        else if (isAnswer1Count1 && isDryness && isNonPremium) await addSkincareRoutineForAsia(4);
        else if (isNonPremium) await addSkincareRoutineForAsia(5);

        products.push(skincareProducts);

        const finishType = result[3]['answers'];
        const coverage = result[4]['answers'];
        const form = result[5]['answers'];

        const addMakeupRoutine = async (routine: number) => {
            products.push(await this.getMakeupRoutine(routine, 'asia makeup'));
        };

        if (isPremium) {
            if (finishType.includes('Matte Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(10);
                    if (form.includes('Compact')) await addMakeupRoutine(11);
                    if (form.includes('Cushion')) await addMakeupRoutine(3);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(1);
                    if (form.includes('Compact')) await addMakeupRoutine(5);
                    if (form.includes('Cushion')) await addMakeupRoutine(3);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(1);
                    if (form.includes('Compact')) await addMakeupRoutine(5);
                    if (form.includes('Cushion')) await addMakeupRoutine(12);
                }
            }

            if (finishType.includes('Glow Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(6);
                    if (form.includes('Cushion')) await addMakeupRoutine(4);
                    if (form.includes('Compact')) await addMakeupRoutine(13);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(2);
                    if (form.includes('Cushion')) await addMakeupRoutine(9);
                    if (form.includes('Compact')) await addMakeupRoutine(7);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(8);
                    if (form.includes('Cushion')) await addMakeupRoutine(9);
                    if (form.includes('Compact')) await addMakeupRoutine(7);
                }
            }
        } else {
            if (finishType.includes('Matte Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(10);
                    if (form.includes('Compact')) await addMakeupRoutine(11);
                    if (form.includes('Cushion')) await addMakeupRoutine(3);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(1);
                    if (form.includes('Compact')) await addMakeupRoutine(5);
                    if (form.includes('Cushion')) await addMakeupRoutine(3);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(1);
                    if (form.includes('Compact')) await addMakeupRoutine(5);
                    if (form.includes('Cushion')) await addMakeupRoutine(12);
                }
            }

            if (finishType.includes('Glow Finish')) {
                if (coverage.includes('Light')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(6);
                    if (form.includes('Compact')) await addMakeupRoutine(13);
                    if (form.includes('Cushion')) await addMakeupRoutine(4);
                }

                if (coverage.includes('Medium')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(2);
                    if (form.includes('Compact')) await addMakeupRoutine(7);
                    if (form.includes('Cushion')) await addMakeupRoutine(4);
                }

                if (coverage.includes('Full')) {
                    if (form.includes('Fluid')) await addMakeupRoutine(2);
                    if (form.includes('Compact')) await addMakeupRoutine(7);
                    if (form.includes('Cushion')) await addMakeupRoutine(9);
                }
            }
        }

        return products.flat();
    }

    async getSkinCareRoutine(routine: number, name: string): Promise<ProductRecommendationSelecteds[]> {
        const skincareProducts: ProductRecommendationSelecteds[] = [];

        const group = await this.prGroupsRepository.getGroupByNameAndRoutine(routine, name);

        if (group) {
            for (let i = 0; i < this.newRoutineRecommendation; i++) {
                const prs = group.prSelecteds[i];

                if (prs && prs.productRecommendationId) {
                    skincareProducts.push(prs);
                }
            }
        }

        return skincareProducts;
    }

    async getMakeupRoutine(routine: number, name: string) {
        const makeupProducts = [];

        const group = await this.prGroupsRepository.getGroupByNameAndRoutine(routine, name);

        if (group) {
            if (this.old) {
                for (let i = 0; i < this.newRoutineRecommendation; i++) {
                    const prs = group.prSelecteds[i];

                    if (prs && prs.productRecommendationId) {
                        makeupProducts.push(prs);
                    }
                }
            } else {
                const principalProduct = group.prSelecteds.find((select) => select.isPrincipal === true);

                if (principalProduct) {
                    const principalRecommendation = principalProduct?.productRecommendation;

                    const variants = principalRecommendation?.productVariants;

                    const variantsIds = variants ? variants.map((v) => v.id) : [];

                    const variantsMatchedSkintone = await this.productRecommendationsRepository.find({
                        where: {
                            id: In(variantsIds),
                            shades: this.skinTone,
                        },
                    });

                    if (variantsMatchedSkintone.length > 0 && principalRecommendation.isMarketMatch(this.market)) {
                        for (let i = 0; i < this.newRoutineRecommendation; i++) {
                            const prs = group.prSelecteds[i];

                            if (prs && prs.productRecommendationId) {
                                makeupProducts.push(prs);
                            }
                        }
                    }
                }
            }
        }

        return makeupProducts;
    }
}
