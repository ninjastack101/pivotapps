export const skillTypesMap: Map<string, string> = new Map([
    ['kaseya', 'Technical Skill (Kaseya)'],
    ['urlRedirect', 'Business Skill (Share Link)'],
    ['qna', 'Business Skill (QnA)'],
    ['apiSkill', 'Technical Skill (API)'],
]);

export declare type intentType = 'kaseyaSkills' | 'urlRedirects' | 'qna' | 'apiSkills';
export declare type skillType = 'kaseya' | 'urlRedirect' | 'meraki' | 'qna' | 'apiSkill';
