import {
    Consultants,
    ProductRecommendationGroups,
    ProductRecommendationSelecteds,
    ProductRecommendations,
} from '@/src/common/entities/crmEntities';
import { ProductRecommendationGroupsRepository, ProductRecommendationRepository } from '@/src/common/repositories/crm';

import { ILike } from 'typeorm';

type ResultJson = {
    id: number;
    question: string;
    answers: string[];
};

export class AutomaticProductDiorGenerator {
    private NEW_RECOMM_TIME = 500 as const;

    private skinTone: string;
    private recommended: string;
    private market: string;
    private answers: string;
    private old: boolean;
    private prGroupsRepository: ProductRecommendationGroupsRepository;

    constructor(
        params: {
            dior_consultant: Consultants;
            skin_tone: string;
            routine_recommendation: string;
            recommended: string;
            answers: string;
            market: string;
            old: boolean;
        },
        prGroupsRepository: ProductRecommendationGroupsRepository,
    ) {
        this.skinTone = params.skin_tone;
        this.recommended = params.recommended;
        this.market = params.market;
        this.answers = params.answers;
        this.old = params.old;
        this.prGroupsRepository = prGroupsRepository;
    }

    async questionAnswers() {
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
            product = await this.getProductsFromMarketJapan(result);
        } else if (this.recommended.includes('western')) {
            product = await this.getProductsFromMarketWestern(result);
        } else {
            // Default from asia
            product = await this.getProductsFromMarketAsia(result);
        }

        return product;
    }

    async getProductsFromMarketJapan(result: ResultJson[]) {
        const products = [];

        const premium = ['Yes, I use premium skincare.', "I'd like to try Dior premium skincare."];
        const drynessDarkSpot = ['dryness', 'dark spots'];

        const noDrynessDarkSpot = !result[1].answers.some((x) => drynessDarkSpot.includes(x));
        const isPremium = premium.every((p) => result[2].answers.includes(p));
        const nonPremium = ["No, I'm not interested."];

        let skincareProducts: ProductRecommendationSelecteds[] = [];
        if (noDrynessDarkSpot && isPremium) {
            skincareProducts = await this.getSkincareRoutine(2, 'japan skincare');
        }

        if (result[1].answers.includes('dryness') && isPremium) {
            skincareProducts = await this.getSkincareRoutine(1, 'japan skincare');
        }

        if (result[1].answers.includes('dark spots') && isPremium) {
            skincareProducts = await this.getSkincareRoutine(3, 'japan skincare');
        }

        const isNonPremium = nonPremium.every((p) => result[2].answers.includes(p));

        if (noDrynessDarkSpot && isNonPremium) {
            skincareProducts = await this.getSkincareRoutine(5, 'japan skincare');
        }

        if (result[1].answers.includes('dryness') && isNonPremium) {
            skincareProducts = await this.getSkincareRoutine(4, 'japan skincare');
        }

        if (result[1].answers.includes('dark spots') && isNonPremium) {
            skincareProducts = await this.getSkincareRoutine(6, 'japan skincare');
        }

        products.push(skincareProducts);

        const addMakeupRoutine = async (routineId: number) => {
            products.push(await this.getMakeupRoutine(routineId, 'japan makeup'));
        };

        const finishType = result[3].answers[0];
        const coverage = result[4].answers[0];
        const form = result[5].answers[0];

        if (isPremium) {
            if (finishType === 'Matte Finish') {
                if (coverage === 'Light') {
                    if (form === 'Fluid') await addMakeupRoutine(10);
                    if (form === 'Compact') await addMakeupRoutine(11);
                    if (form === 'Cushion') await addMakeupRoutine(3);
                }
                if (coverage === 'Medium') {
                    if (form === 'Fluid') await addMakeupRoutine(1);
                    if (form === 'Cushion') await addMakeupRoutine(3);
                    if (form === 'Compact') await addMakeupRoutine(5);
                }
                if (coverage === 'Full') {
                    if (form === 'Fluid') await addMakeupRoutine(1);
                    if (form === 'Cushion') await addMakeupRoutine(11);
                    if (form === 'Compact') await addMakeupRoutine(5);
                }
            }
            if (finishType === 'Glow Finish') {
                if (coverage === 'Light') {
                    if (form === 'Fluid') await addMakeupRoutine(6);
                    if (form === 'Cushion') await addMakeupRoutine(4);
                    if (form === 'Compact') await addMakeupRoutine(13);
                }
                if (coverage === 'Medium') {
                    if (form === 'Fluid') await addMakeupRoutine(2);
                    if (form === 'Cushion') await addMakeupRoutine(9);
                    if (form === 'Compact') await addMakeupRoutine(7);
                }
                if (coverage === 'Full') {
                    if (form === 'Fluid') await addMakeupRoutine(8);
                    if (form === 'Cushion') await addMakeupRoutine(9);
                    if (form === 'Compact') await addMakeupRoutine(7);
                }
            }
        } else {
            if (finishType === 'Matte Finish') {
                if (coverage === 'Light') {
                    if (form === 'Fluid') await addMakeupRoutine(10);
                    if (form === 'Compact') await addMakeupRoutine(11);
                    if (form === 'Cushion') await addMakeupRoutine(3);
                }
                if (coverage === 'Medium') {
                    if (form === 'Fluid') await addMakeupRoutine(1);
                    if (form === 'Cushion') await addMakeupRoutine(3);
                    if (form === 'Compact') await addMakeupRoutine(5);
                }
                if (coverage === 'Full') {
                    if (form === 'Fluid') await addMakeupRoutine(1);
                    if (form === 'Cushion') await addMakeupRoutine(12);
                    if (form === 'Compact') await addMakeupRoutine(5);
                }
            }
            if (finishType === 'Glow Finish') {
                if (coverage === 'Light') {
                    if (form === 'Fluid') await addMakeupRoutine(6);
                    if (form === 'Cushion') await addMakeupRoutine(4);
                    if (form === 'Compact') await addMakeupRoutine(13);
                }
                if (coverage === 'Medium') {
                    if (form === 'Fluid') await addMakeupRoutine(2);
                    if (form === 'Cushion') await addMakeupRoutine(4);
                    if (form === 'Compact') await addMakeupRoutine(7);
                }
                if (coverage === 'Full') {
                    if (form === 'Fluid') await addMakeupRoutine(2);
                    if (form === 'Cushion') await addMakeupRoutine(9);
                    if (form === 'Compact') await addMakeupRoutine(7);
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

        let skincareProducts: ProductRecommendationSelecteds[] = [];

        if (
            result[1]['answers'].length === 1 &&
            result[1]['answers'].includes('dryness') &&
            result[2]['answers'].every((ans) => premium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(1, 'asia skincare');
        } else if (
            result[1]['answers'].length === 1 &&
            result[1]['answers'].includes('dark spots') &&
            result[2]['answers'].every((ans) => premium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(3, 'asia skincare');
        } else if (result[2]['answers'].every((ans) => premium.includes(ans))) {
            skincareProducts = await this.getSkincareRoutine(2, 'asia skincare');
        } else if (
            result[1]['answers'].length === 1 &&
            result[1]['answers'].includes('dark spots') &&
            result[2]['answers'].every((ans) => nonPremium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(7, 'asia skincare');
        } else if (
            (result[1]['answers'].every((ans) => darkSpotFirmness.includes(ans)) &&
                result[2]['answers'].every((ans) => nonPremium.includes(ans))) ||
            (result[1]['answers'].every((ans) => darkSpotWrinkles.includes(ans)) &&
                result[2]['answers'].every((ans) => nonPremium.includes(ans)))
        ) {
            skincareProducts = await this.getSkincareRoutine(6, 'asia skincare');
        } else if (
            result[1]['answers'].length === 1 &&
            result[1]['answers'].includes('dryness') &&
            result[2]['answers'].every((ans) => nonPremium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(4, 'asia skincare');
        } else if (result[2]['answers'].every((ans) => nonPremium.includes(ans))) {
            skincareProducts = await this.getSkincareRoutine(5, 'asia skincare');
        }

        products.push(skincareProducts);

        const addMakeupRoutine = async (routineId: number) => {
            products.push(await this.getMakeupRoutine(routineId, 'asia makeup'));
        };

        if (result[2]['answers'].every((ans) => premium.includes(ans))) {
            if (result[3]['answers'].includes('Matte Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(10);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(11);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(3);
                    }
                } else if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(3);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(5);
                    }
                } else if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(12);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(5);
                    }
                }
            } else if (result[3]['answers'].includes('Glow Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(6);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(13);
                    }
                } else if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(2);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(9);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(7);
                    }
                } else if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(8);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(9);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(7);
                    }
                }
            }
        } else {
            if (result[3]['answers'].includes('Matte Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(10);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(11);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(3);
                    }
                } else if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(3);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(5);
                    }
                } else if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(12);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(5);
                    }
                }
            } else if (result[3]['answers'].includes('Glow Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(6);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(13);
                    }
                } else if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(2);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(7);
                    }
                } else if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(2);
                    } else if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(9);
                    } else if (result[5]['answers'].includes('Compact')) {
                        await addMakeupRoutine(7);
                    }
                }
            }
        }

        return products.flat();
    }

    async getProductsFromMarketWestern(result: ResultJson[]) {
        const products = [];

        const premium = ['Yes, I use premium skincare.', "I'd like to try Dior premium skincare."];
        const nonPremium = ["No, I'm not interested."];

        let skincareProducts: ProductRecommendationSelecteds[] = [];

        if (!result[1]['answers'].includes('dryness') && result[2]['answers'].every((ans) => premium.includes(ans))) {
            skincareProducts = await this.getSkincareRoutine(2, 'western skincare');
        } else if (
            result[1]['answers'].includes('dryness') &&
            result[2]['answers'].every((ans) => premium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(1, 'western skincare');
        } else if (
            !result[1]['answers'].includes('dryness') &&
            result[2]['answers'].every((ans) => nonPremium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(3, 'western skincare');
        } else if (
            result[1]['answers'].includes('dryness') &&
            result[2]['answers'].every((ans) => nonPremium.includes(ans))
        ) {
            skincareProducts = await this.getSkincareRoutine(4, 'western skincare');
        }

        products.push(skincareProducts);

        const addMakeupRoutine = async (routineId: number) => {
            products.push(await this.getMakeupRoutine(routineId, 'western makeup'));
        };

        if (result[2]['answers'].every((ans) => premium.includes(ans))) {
            if (result[3]['answers'].includes('Matte Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(9);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }
                if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }
                if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(10);
                    }
                }
            }
            if (result[3]['answers'].includes('Glow Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(3);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(5);
                    }
                }
                if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(2);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(8);
                    }
                }
                if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(7);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(8);
                    }
                }
            }
        } else {
            if (result[3]['answers'].includes('Matte Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(9);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }
                if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(4);
                    }
                }
                if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(1);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(10);
                    }
                }
            }
            if (result[3]['answers'].includes('Glow Finish')) {
                if (result[4]['answers'].includes('Light')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(3);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(5);
                    }
                }
                if (result[4]['answers'].includes('Medium')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(2);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(5);
                    }
                }
                if (result[4]['answers'].includes('Full')) {
                    if (result[5]['answers'].includes('Fluid')) {
                        await addMakeupRoutine(2);
                    }
                    if (result[5]['answers'].includes('Cushion')) {
                        await addMakeupRoutine(8);
                    }
                }
            }
        }

        return products.flat();
    }

    async getSkincareRoutine(routine: number, name: string): Promise<ProductRecommendationSelecteds[]> {
        const group = await this.prGroupsRepository.getGroupByNameAndRoutine(routine, name);

        if (!group) {
            return [] as [];
        }

        const skincareProducts: ProductRecommendationSelecteds[] =
            this.findExistProducGroupSelectedWithRecommendationId(group);

        return skincareProducts;
    }

    async getMakeupRoutine(routine: number, name: string): Promise<ProductRecommendationSelecteds[]> {
        const group = await this.prGroupsRepository.getGroupByNameAndRoutine(routine, name);

        let makeupProducts: ProductRecommendationSelecteds[] = [];
        if (!group) {
            return makeupProducts;
        }

        if (this.old) {
            makeupProducts = this.findExistProducGroupSelectedWithRecommendationId(group);
        } else {
            const principalProduct = group.prSelecteds.find((select) => select.isPrincipal === true);

            if (principalProduct) {
                if (principalProduct.productRecommendation && principalProduct.productRecommendation.productVariants) {
                    const anySkinTone = principalProduct.productRecommendation.productVariants.find(
                        (variants) => variants.shades === this.skinTone,
                    );

                    const isMarketMatch = principalProduct.productRecommendation.isMarketMatch(this.market);

                    if (anySkinTone && isMarketMatch) {
                        makeupProducts = this.findExistProducGroupSelectedWithRecommendationId(group);
                    }
                }
            } else {
                makeupProducts = this.findExistProducGroupSelectedWithRecommendationId(group);
            }
        }
        return makeupProducts;
    }

    findExistProducGroupSelectedWithRecommendationId(group: ProductRecommendationGroups) {
        const array: ProductRecommendationSelecteds[] = [];
        for (let i = 0; i < this.NEW_RECOMM_TIME; i++) {
            if (i < this.NEW_RECOMM_TIME) {
                const prs = group.prSelecteds[i];

                if (prs && prs.productRecommendationId) {
                    array.push(prs);
                }
            }
        }

        return array;
    }
}
