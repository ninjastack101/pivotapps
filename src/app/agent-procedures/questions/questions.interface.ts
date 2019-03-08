export interface ISkillQuestion {
    id: number;
    question: string;
    questionAdaptiveCard: string;
    questionVariableName: string;
    questionOrder: number;
    createdAt?: Date;
    updatedAt?: Date;
    skillId: number;
}

export interface IQuestionsDiff {
    newQuestions: Array<ISkillQuestion>;
    updatedQuestions: Array<ISkillQuestion>;
}
